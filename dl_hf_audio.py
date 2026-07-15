import urllib.request
import os

os.makedirs("test_audio", exist_ok=True)

urls = {
    "user_a.wav": "https://huggingface.co/speechbrain/spkrec-ecapa-voxceleb/resolve/main/example1.wav",
    "user_b.wav": "https://huggingface.co/speechbrain/spkrec-ecapa-voxceleb/resolve/main/example2.wav"
}

for name, url in urls.items():
    try:
        urllib.request.urlretrieve(url, f"test_audio/{name}")
        print(f"Downloaded {name}")
    except Exception as e:
        print(f"Failed {name}: {e}")
