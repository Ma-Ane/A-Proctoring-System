import torch.nn as nn
from backend.ML_helper_function.pannDefine import Cnn14
import torch

class PANNClassifier(nn.Module):
    def __init__(self):
        super().__init__()
        self.base = Cnn14(sample_rate=32000, window_size=1024, hop_size=320, mel_bins=64,
              fmin=50, fmax=8000, classes_num=527)  # No pretrained argument
        checkpoint = torch.load("backend/ML_models/Cnn14_mAP=0.431.pth", map_location='cpu')  # path to the pretrained weights
        self.base.load_state_dict(checkpoint['model'])  # Load weights

        self.fc = nn.Linear(2048, 3)  # for 6 classes (speech, whispering, typing, conversation, background)

    def forward(self, x):
    # x must be (B, T)
        if x.ndim != 2:
            raise RuntimeError(f"Expected (B, T), got {x.shape}")

        out = self.base(x)['embedding']
        return self.fc(out)


