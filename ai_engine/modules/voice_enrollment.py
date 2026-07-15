import io
import torch
import torchaudio
import librosa
import numpy as np
from speechbrain.pretrained import EncoderClassifier

classifier = None

def load_model():
    global classifier
    if classifier is None:
        classifier = EncoderClassifier.from_hparams(
            source="speechbrain/spkrec-ecapa-voxceleb", 
            savedir="pretrained_models/spkrec-ecapa-voxceleb"
        )
    return classifier

def calculate_metrics(waveform, sample_rate):
    np_wave = waveform.numpy()
    mono_wave = np_wave[0] if np_wave.shape[0] > 0 else np_wave
    
    duration = len(mono_wave) / sample_rate
    
    intervals = librosa.effects.split(mono_wave, top_db=20)
    non_silent_samples = sum([end - start for start, end in intervals])
    total_samples = len(mono_wave)
    silence_percentage = 100.0 * (1 - (non_silent_samples / total_samples)) if total_samples > 0 else 100.0
    
    clipping_threshold = 0.99
    clipping = 100.0 * np.sum(np.abs(mono_wave) > clipping_threshold) / total_samples if total_samples > 0 else 0.0
    
    # SNR Estimation
    signal_power = 0
    if non_silent_samples > 0:
        signal_power = np.mean(np.concatenate([mono_wave[s:e] for s, e in intervals]) ** 2)
        
    mask = np.ones(total_samples, dtype=bool)
    for s, e in intervals:
        mask[s:e] = False
    
    noise_power = np.mean(mono_wave[mask] ** 2) if np.sum(mask) > 0 else 0
    
    snr = 20.0
    if noise_power > 0 and signal_power > 0:
        snr_raw = 10 * np.log10(signal_power / noise_power)
        snr = max(0, snr_raw)
        
    score = 100.0
    if duration < 1.0: score -= 40
    elif duration < 2.0: score -= 15
    if snr < 15: score -= (15 - snr) * 2
    if clipping > 0.5: score -= 20
    if silence_percentage > 50: score -= 20
    
    score = max(0, min(100, score))
    
    return {
        "duration": float(duration),
        "silence_percentage": float(silence_percentage),
        "clipping_detected": float(clipping),
        "snr": float(snr),
        "quality_score": float(score)
    }

def process_enrollment(file_bytes: bytes):
    model = load_model()
    
    waveform, sample_rate = torchaudio.load(io.BytesIO(file_bytes))
    original_sr = sample_rate
    
    if sample_rate != 16000:
        resampler = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=16000)
        waveform = resampler(waveform)
        sample_rate = 16000
    
    metrics = calculate_metrics(waveform, sample_rate)
    
    if metrics["quality_score"] < 40:
        raise ValueError("Audio quality too low for enrollment")
        
    embeddings = model.encode_batch(waveform)
    emb_list = embeddings.squeeze().detach().cpu().numpy().tolist()
    
    return {
        "metrics": metrics,
        "embedding": emb_list,
        "sample_rate_validation": True,
        "original_sample_rate": original_sr
    }
