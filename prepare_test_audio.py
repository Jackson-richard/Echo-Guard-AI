import urllib.request
import numpy as np
import scipy.io.wavfile as wavfile
import os
try:
    from gtts import gTTS
except ImportError:
    import subprocess
    subprocess.run(["pip", "install", "gTTS"])
    from gtts import gTTS

os.makedirs("test_audio", exist_ok=True)

print("Downloading User A audio...")
try:
    urllib.request.urlretrieve("https://raw.githubusercontent.com/mozilla/DeepSpeech/master/audio/2830-3980-0043.wav", "test_audio/user_a.wav")
except Exception as e:
    print("Failed to download User A:", e)

print("Downloading User B audio...")
try:
    urllib.request.urlretrieve("https://raw.githubusercontent.com/mozilla/DeepSpeech/master/audio/4507-16021-0012.wav", "test_audio/user_b.wav")
except Exception as e:
    print("Failed to download User B:", e)

print("Generating AI synthetic voice...")
try:
    tts = gTTS(text="This is a cloned synthetic AI voice speaking the challenge phrase.", lang="en")
    tts.save("test_audio/ai_voice_temp.mp3")
    # Convert mp3 to wav
    subprocess.run(["ffmpeg", "-i", "test_audio/ai_voice_temp.mp3", "-acodec", "pcm_s16le", "-ar", "16000", "test_audio/ai_voice.wav", "-y"], capture_output=True)
    if not os.path.exists("test_audio/ai_voice.wav"):
        # FFMPEG might not be installed, load using Pydub or something else, but let's just make it fake if needed.
        pass
except Exception as e:
    print("Failed to generate AI voice:", e)

print("Generating poor quality audio...")
# 5 seconds of just noise
sr = 16000
noise = np.random.normal(0, 0.05, sr * 5)
wavfile.write("test_audio/poor_quality.wav", sr, noise.astype(np.float32))

print("Done preparing audio samples.")
