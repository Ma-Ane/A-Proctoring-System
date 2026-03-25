import numpy as np
import torch
import torch.nn.functional as F
import math
from scipy.signal import resample_poly

THRESHOLD = 0.2

def rms_energy(x):
    return np.sqrt(np.mean(x ** 2) + 1e-8)

def is_silence(x):
    return rms_energy(x) < 0.003

def apply_agc(x):
    rms = rms_energy(x)
    if rms < 1e-6:
        return x  # truly silent, don't touch it
    
    TARGET_RMS = 0.1
    gain = min(TARGET_RMS / rms, 3.0)  # max 3x gain, not 10x
    x = x * gain
    
    # soft limiting instead of hard clip — no distortion
    x = np.tanh(x)
    return x


def classify_audio(speech, background, silence):
    if silence > THRESHOLD:
        return "SILENCE"

    if speech > THRESHOLD:
        return "SPEECH"

    if speech > background * 1.3:
        return "TALKING"

    if background > THRESHOLD:
        return "NOISE"

    return "UNCERTAIN"

# inference function
def run_audio_inference(pann_model, audio_np):
    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
    CLASS_NAMES = ["speech", "background", "silence"]

    waveform = torch.tensor(audio_np, dtype=torch.float32).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = pann_model(waveform)
        probs = F.softmax(logits, dim=1)[0].cpu().numpy()

    results = dict(zip(CLASS_NAMES, probs))

    speech = results.get("speech", 0.0)
    background = results.get("background", 0.0)
    silence = results.get("silence", 0.0)

    talk_score = speech

    # decision logic
    if talk_score > 0.6 and talk_score > background * 1.2:
        event = "TALKING"
    else:
        event = "NORMAL"

    return {
        "speech": float(speech),
        "background": float(background),
        "silence": float(silence),
        "event": classify_audio(speech, background, silence)
    }


# resampling to required frequency
def resample_to_32k(audio_np: np.ndarray, original_sr: int) -> np.ndarray:
    # Model trained at 32kHz — must match
    if original_sr == 32000:
        return audio_np
    gcd = math.gcd(32000, original_sr)
    up = 32000 // gcd
    down = original_sr // gcd
    return resample_poly(audio_np, up, down).astype(np.float32)