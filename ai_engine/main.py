from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from modules.voice_enrollment import process_enrollment
from modules.deepfake_detection import process_deepfake
from modules.behavior_analytics import process_behavior
from modules.voice_auth import process_voice_verification
import json

app = FastAPI(title="EchoGuard AI Engine")

@app.get("/")
def read_root():
    return {"status": "Active", "service": "Identity Intelligence Engine (I2E)"}

@app.post("/api/v1/voice/enroll")
async def enroll_voice(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()
        return process_enrollment(audio_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/voice/verify")
async def verify_voice(
    file: UploadFile = File(...), 
    enrolled_embedding: str = Form(...),
    challenge_phrase: str = Form(None),
    threshold: float = Form(0.25)
):
    try:
        audio_bytes = await file.read()
        embedding_list = json.loads(enrolled_embedding)
        return process_voice_verification(audio_bytes, embedding_list, challenge_phrase, threshold)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/voice/deepfake")
async def detect_deepfake(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()
        return process_deepfake(audio_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/behavior/analyze")
async def analyze_behavior(request: Request):
    try:
        data = await request.json()
        return process_behavior(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
