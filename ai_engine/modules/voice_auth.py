import torch
import torch.nn.functional as F
from speechbrain.pretrained import EncoderClassifier
from transformers import pipeline
import string
import re

# We'll use the same ECAPA-TDNN model used for enrollment
classifier = EncoderClassifier.from_hparams(source="speechbrain/spkrec-ecapa-voxceleb", savedir="pretrained_models/spkrec-ecapa-voxceleb")
asr_pipeline = None

def load_asr():
    global asr_pipeline
    if asr_pipeline is None:
        asr_pipeline = pipeline("automatic-speech-recognition", model="openai/whisper-tiny.en")
    return asr_pipeline

def clean_text(text):
    text = text.lower()
    text = re.sub(f"[{re.escape(string.punctuation)}]", "", text)
    return text.strip()

def process_voice_verification(audio_bytes: bytes, enrolled_embedding: list, challenge_phrase: str = None, threshold: float = 0.25):
    # Process incoming audio to get its embedding
    with open("temp_verify.wav", "wb") as f:
        f.write(audio_bytes)
        
    try:
        # ASR Challenge Phrase Check
        if challenge_phrase:
            asr = load_asr()
            transcription = asr("temp_verify.wav")["text"]
            t_clean = clean_text(transcription)
            c_clean = clean_text(challenge_phrase)
            
            # Replay Attack Handling (Phrase Mismatch)
            # We want to check if the user said the exact words (or very close). 
            # We check if words in the challenge phrase are mostly in the transcription.
            words_c = c_clean.split()
            words_t = t_clean.split()
            match_count = sum([1 for w in words_c if w in words_t])
            if match_count < len(words_c) * 0.5: # Needs at least 50% accurate reading of phrase
                return {
                    "verified": False,
                    "confidence": 0,
                    "similarity": 0.0,
                    "threshold": threshold,
                    "error": "Challenge phrase mismatch. Possible replay attack.",
                    "transcription": transcription,
                    "expected": challenge_phrase
                }
                
        signal = classifier.load_audio("temp_verify.wav")
        new_embedding = classifier.encode_batch(signal)
        
        # Convert the received list back to a tensor
        enrolled_tensor = torch.tensor(enrolled_embedding).unsqueeze(0).unsqueeze(0)
        if len(enrolled_tensor.shape) < 3:
            enrolled_tensor = enrolled_tensor.unsqueeze(0)
            
        # Flatten both for cosine similarity
        e1 = new_embedding.flatten()
        e2 = enrolled_tensor.flatten()
        
        # Compute cosine similarity
        cos_sim = F.cosine_similarity(e1.unsqueeze(0), e2.unsqueeze(0)).item()
        
        # Threshold logic
        confidence = float(cos_sim * 100)
        is_verified = bool(cos_sim >= threshold)
        
        return {
            "verified": is_verified,
            "confidence": round(confidence, 2),
            "similarity": round(float(cos_sim), 4),
            "threshold": threshold
        }
    except Exception as e:
        return {"error": str(e)}
