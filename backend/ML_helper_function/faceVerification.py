# Make the model ready for verification purpose

import torch
import torch.nn as nn
import torch.nn.functional as F
import math
from torchvision import models
from facenet_pytorch import MTCNN
from PIL import Image
import numpy as np
from torchvision import transforms
import matplotlib.pyplot as plt
import os


# -------- Model Definitions ----------
class ResNet50_EmbeddingNet(nn.Module):
    def __init__(self, embedding_size=512, pretrained=True, freeze_backbone=False):
        super().__init__()

        # Load pretrained ResNet50
        base_model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)

        # Optionally freeze early layers to preserve pretrained features
        if freeze_backbone:
            for param in base_model.parameters():
                param.requires_grad = False

        # Keep all layers except avgpool and fc
        self.backbone = nn.Sequential(*list(base_model.children())[:-2])

        # Global average pooling
        self.pool = nn.AdaptiveAvgPool2d((1, 1))

        # Embedding layer
        self.embedding = nn.Linear(2048, embedding_size)
        self.bn = nn.BatchNorm1d(embedding_size)

    def forward(self, x):
        # Backbone feature extraction
        x = self.backbone(x)
        x = self.pool(x)
        x = x.view(x.size(0), -1)       # Flatten

        # Embedding and normalization
        x = self.embedding(x)
        x = self.bn(x)
        x = F.normalize(x, p=2, dim=1)  # L2 normalization
        return x


# --------- Arcface Head ---------------
class ArcMarginProduct(nn.Module):
    """
    ArcFace head for angular margin-based softmax.
    """
    def __init__(self, in_features, out_features, s=30.0, m=0.5, easy_margin=False):
        super().__init__()
        self.in_features = in_features
        self.out_features = out_features

        # Weight parameter (class centers)
        self.weight = nn.Parameter(torch.FloatTensor(out_features, in_features))
        nn.init.xavier_uniform_(self.weight)

        # Hyperparameters
        self.s = s  # Scale factor
        self.m = m  # Angular margin
        self.easy_margin = easy_margin

        # Precompute constants
        self.cos_m = math.cos(m)
        self.sin_m = math.sin(m)
        self.th = math.cos(math.pi - m)
        self.mm = math.sin(math.pi - m) * m

    def forward(self, embeddings, labels):
        """
        embeddings: (batch_size, in_features)
        labels: (batch_size,)
        """
        # Normalize embeddings and weights
        embeddings_norm = F.normalize(embeddings)
        weights_norm = F.normalize(self.weight)

        # Cosine similarity
        cosine = F.linear(embeddings_norm, weights_norm)
        cosine = cosine.clamp(-1 + 1e-7, 1 - 1e-7)  # Prevent NaNs
        sine = torch.sqrt(1.0 - cosine ** 2)

        # ArcFace formula
        phi = cosine * self.cos_m - sine * self.sin_m
        if self.easy_margin:
            phi = torch.where(cosine > 0, phi, cosine)
        else:
            phi = torch.where(cosine > self.th, phi, cosine - self.mm)

        # One-hot encoding
        one_hot = torch.zeros_like(cosine)
        one_hot.scatter_(1, labels.view(-1, 1), 1.0)

        # Combine original cosine and phi
        output = one_hot * phi + (1.0 - one_hot) * cosine
        output *= self.s  # Scale logits

        return output
    

# _----------------- Load the Model -------------

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_face_verification_model(model_path: str, num_classes: int):
    print("Loading Face Verification Model...")

    # Redefine model architecture
    model = ResNet50_EmbeddingNet(embedding_size=512).to(device)
    arcface_head = ArcMarginProduct(512, num_classes).to(device)

    # Load checkpoint
    checkpoint = torch.load(model_path, map_location=device)
    model.load_state_dict(checkpoint['model_state_dict'])
    arcface_head.load_state_dict(checkpoint['arcface_state_dict'])
    
    model.eval()
    arcface_head.eval()

    print("✅ Model loaded successfully on", device)
    return model


# ----------- Preprocessing function -------------

mtcnn = MTCNN(image_size=112, margin=10, device=device, post_process=False)

preprocess_transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize([0.5,0.5,0.5],[0.5,0.5,0.5])
])

def crop_with_margin(img, box, margin=0.3):
    x1, y1, x2, y2 = box
    w, h = x2 - x1, y2 - y1
    x1_new = max(0, x1 - margin*w)
    y1_new = max(0, y1 - margin*h)
    x2_new = min(img.width, x2 + margin*w)
    y2_new = min(img.height, y2 + margin*h)
    return img.crop((x1_new, y1_new, x2_new, y2_new))


def detect_crop_and_normalize(img, margin=0.3, prob_threshold=0.98):
    boxes, probs = mtcnn.detect(img)

    if boxes is None or probs is None or len(boxes) == 0:
        print("❌ No face detected")
        return None

    probs = np.array(probs)
    boxes = np.array(boxes)

    # Sort faces by confidence (descending)
    sorted_idx = np.argsort(probs)[::-1]
    probs = probs[sorted_idx]
    boxes = boxes[sorted_idx]

    # Case 1: Only one face
    if len(probs) == 1:
        if probs[0] < prob_threshold:
            print(f"❌ Low confidence face: {probs[0]:.3f}")
            return None

        box = boxes[0]

    # Case 2: Multiple faces
    else:
        top1 = probs[0]
        top2 = probs[1]

        # True multiple faces
        if top1 >= prob_threshold and top2 >= prob_threshold:
            print(
                f"❌ Multiple faces detected "
                f"(p1={top1:.3f}, p2={top2:.3f})"
            )
            return None

        # Only one confident face → accept best one
        if top1 >= prob_threshold:
            box = boxes[0]
        else:
            print(f"❌ No confident face (top={top1:.3f})")
            return None

    # Crop, resize, normalize
    face = crop_with_margin(img, box, margin=margin)
    face = face.resize((112, 112))
    tensor_face = preprocess_transform(face)

    return tensor_face



## just to display the image
# def show_face(tensor_face, title="Face"):
#     pil_face = transforms.ToPILImage()(tensor_face * 0.5 + 0.5)
#     plt.imshow(pil_face)
#     plt.title(title)
#     plt.axis('off')
#     plt.show()


# ------------- Preprocess the input image -----------------
def get_embedding(model, image_path):
    tensor_face = detect_crop_and_normalize(image_path)
    if tensor_face is None:
        return None

    # show_face(tensor_face, title=os.path.basename(image_path))
    tensor_face = tensor_face.unsqueeze(0).to(device)
    with torch.no_grad():
        emb = model(tensor_face)
        emb = F.normalize(emb, p=2, dim=1)
    return emb.cpu().numpy().flatten()


# -------------- Cosine similarity -------------------
def cosine_similarity(emb1, emb2):
    return np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))

# -------------- FOr saving the input image into db -------------------
def webcam_style_transform(img):
    img = cv2.resize(img, (160, 160))  # Slightly larger before simulating low quality
    img = cv2.GaussianBlur(img, (5, 5), sigmaX=1.2)  # Blurriness

    # Random brightness & contrast
    alpha = np.random.uniform(0.6, 1.2)  # contrast
    beta = np.random.uniform(-30, 30)    # brightness
    img = cv2.convertScaleAbs(img, alpha=alpha, beta=beta)

    # Add Gaussian noise
    noise = np.random.normal(0, 15, img.shape).astype(np.int16)
    img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)

    # Random grayscale
    if np.random.rand() < 0.1:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)

    # Mild random rotation
    angle = np.random.uniform(-5, 5)
    h, w = img.shape[:2]
    M = cv2.getRotationMatrix2D((w//2, h//2), angle, 1)
    img = cv2.warpAffine(img, M, (w, h), borderMode=cv2.BORDER_REFLECT)

    # Final resize to model input
    img = cv2.resize(img, (112, 112))
    return img

