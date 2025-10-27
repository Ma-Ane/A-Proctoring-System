from backend.ML_helper_function.faceVerification import load_face_verification_model, get_embedding, webcam_style_transform
from PIL import Image
import torch
import cv2
import torch.nn.functional as F


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


MODEL_PATH = "../ML_models/face_verification_model_with_17_train_loss.pth"
NUM_CLASSES = 540  # From training file 
model = load_face_verification_model(MODEL_PATH, NUM_CLASSES)


img1 = '../test_images/cropped-manjit.jpg'
img2 = '../test_images/cropped-kritam.jpg'

# Load the images
hq_img = cv2.imread(img2)
webcam_img = cv2.imread(img1)

if hq_img is None or webcam_img is None:
    raise FileNotFoundError("Check the image paths.")


hq_img = cv2.cvtColor(hq_img, cv2.COLOR_BGR2RGB)
webcam_img = cv2.cvtColor(webcam_img, cv2.COLOR_BGR2RGB)


h1_img_resized = cv2.resize(hq_img, (112, 112))
webcam_img_resized = cv2.resize(webcam_img, (112, 112))

# hq_pil = Image.fromarray(cv2.cvtColor(hq_img_aug, cv2.COLOR_BGR2RGB))
# webcam_pil = Image.fromarray(cv2.cvtColor(webcam_img_resized, cv2.COLOR_BGR2RGB))

# Align faces
# aligned_hq = mtcnn(hq_pil)
# aligned_webcam = mtcnn(webcam_pil)

# Check if faces were detected
# if aligned_hq is None or aligned_webcam is None:
#     raise ValueError("Face not detected in one of the images.")

# Add batch dimension and move to device
aligned_hq = torch.tensor(h1_img_resized / 255.0, dtype=torch.float32)  # Normalize 0-1
aligned_hq = aligned_hq.permute(2, 0, 1).unsqueeze(0).to(device)  # [1, 3, 112, 112]

aligned_webcam = torch.tensor(webcam_img_resized / 255.0, dtype=torch.float32)
aligned_webcam = aligned_webcam.permute(2, 0, 1).unsqueeze(0).to(device)


# Make sure model is in eval mode and on correct device
model.eval()
model.to(device)

# Get embeddings
with torch.no_grad():
    embedding_hq = model(aligned_hq)       # [1, embedding_size]
    embedding_webcam = model(aligned_webcam)

# Compute cosine similarity
cos_sim = F.cosine_similarity(embedding_hq, embedding_webcam).item()

print(f"Cosine similarity between images: {cos_sim:.4f}")

# Threshold decision example (tune threshold based on your experiments)
threshold = 0.5
if cos_sim > threshold:
    print("✅ Faces match!")
else:
    print("❌ Faces do NOT match!")