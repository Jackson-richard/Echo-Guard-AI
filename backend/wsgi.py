import os
import requests
import bcrypt
import datetime
import json
from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_socketio import SocketIO
from flask_cors import CORS
from database.connection import client, db
from bson.objectid import ObjectId
from trust_engine import TrustEngine

app = Flask(__name__)
CORS(app)

try:
    ai_engine_ip = os.environ.get("AI_ENGINE_HOST", 'ai_engine')
    AI_ENGINE_URL = os.environ.get("AI_ENGINE_URL", f"http://{ai_engine_ip}:8000")
except:
    AI_ENGINE_URL = "http://localhost:8000"

app.config["JWT_SECRET_KEY"] = "super-secret-AI-cyber-key-12345"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = datetime.timedelta(hours=24)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")
trust_engine = TrustEngine(db)

def broadcast_event(type_name, data):
    socketio.emit("security_event", {"type": type_name, "data": data, "timestamp": datetime.datetime.utcnow().isoformat()})

def record_incident(user_id, title, severity, reason, mitre_tactic, details):
    incident = {
        "title": title,
        "severity": severity,
        "status": "open",
        "date": datetime.datetime.utcnow().isoformat(),
        "user_id": user_id,
        "reason": reason,
        "mitre_tactic": mitre_tactic,
        "details": details,
        "recommended_response": "Lock session and investigate." if severity in ["high", "critical"] else "Monitor."
    }
    db.soc_incidents.insert_one(incident)
    broadcast_event("incident_created", {"incident": title, "severity": severity})
    return incident

@app.route("/")
def health_check():
    return jsonify({"status": "healthy", "service": "EchoGuard Zero Trust PDP"})

@app.route("/api/v1/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"error": "Missing credentials"}), 400
        
    # Ensure test user exists (Autoseed for Ideathon)
    if not db.users.find_one({"email": "alex.morgan@echoguard.io"}):
        hashed_pw = bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        db.users.insert_one({
            "email": "alex.morgan@echoguard.io",
            "password": hashed_pw,
            "firstName": "Alex",
            "role": "admin"
        })
    
    user = db.users.find_one({"email": email})
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user["password"].encode('utf-8')):
        return jsonify({"error": "Invalid credentials"}), 401
        
    user_id = str(user["_id"])
    access_token = create_access_token(identity=user_id)
    
    # Establish Active Session with Trust 100
    session_id = str(ObjectId())
    db.active_sessions.update_one(
        {"user_id": user_id},
        {"$set": {"trust_score": 100, "session_id": session_id, "last_active": datetime.datetime.utcnow(), "status": "active"}},
        upsert=True
    )
    
    db.authentication_logs.insert_one({
        "user_id": user_id, "email": email, "ip": request.remote_addr,
        "timestamp": datetime.datetime.utcnow(), "status": "success"
    })
    
    user_data = {"id": user_id, "email": user.get("email"), "firstName": user.get("firstName"), "role": user.get("role")}
    broadcast_event("auth_login", {"user": email})
    return jsonify({"success": True, "token": access_token, "user": user_data, "session_id": session_id})

@app.route("/api/v1/auth/me", methods=["GET"])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    if not user:
        return jsonify({"error": "User not found"}), 404
    user["id"] = user_id
    del user["_id"]
    
    # Get current trust
    session = db.active_sessions.find_one({"user_id": user_id})
    user["trust_score"] = session["trust_score"] if session else 100
    
    return jsonify({"success": True, "user": user})

@app.route("/api/v1/telemetry", methods=["POST"])
@jwt_required()
def telemetry():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Passive context checking
    eval_result = trust_engine.evaluate_behavior(user_id, data)
    
    # Update active session trust score smoothly
    if eval_result["risk_modifier"] != 0:
        session = db.active_sessions.find_one({"user_id": user_id})
        new_trust = max(0, min(100, (session.get("trust_score", 100) + eval_result["risk_modifier"])))
        db.active_sessions.update_one(
            {"user_id": user_id},
            {"$set": {"trust_score": new_trust, "last_active": datetime.datetime.utcnow()}}
        )
        
        broadcast_event("trust_updated", {"user_id": user_id, "new_score": new_trust, "status": eval_result["status"]})
        
        # Log anomaly incident if significant drop
        if eval_result["risk_modifier"] <= -30:
            record_incident(user_id, "Behavioral Anomaly Detected", "high", "Significant deviation from baseline", "TA0005 Defense Evasion", f"Modifier: {eval_result['risk_modifier']}")
            
    return jsonify({"success": True, "status": eval_result["status"], "risk_modifier": eval_result["risk_modifier"]})

@app.route("/api/v1/trust/evaluate-action", methods=["POST"])
@jwt_required()
def evaluate_action():
    user_id = get_jwt_identity()
    action = request.get_json().get("action", "general_access")
    
    risk_assessment = trust_engine.check_action_risk(user_id, action)
    
    if risk_assessment["requires_challenge"]:
        record_incident(user_id, "Elevated Risk Action Attempt", "medium", f"Attempted {action} with low trust ({risk_assessment['current_trust']} < {risk_assessment['required']})", "TA0004 Privilege Escalation", "Challenging user via voice.")
    
    return jsonify({"success": True, "assessment": risk_assessment})

@app.route("/api/v1/auth/step-up-challenge", methods=["POST"])
@jwt_required()
def step_up_challenge():
    user_id = get_jwt_identity()
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
        
    file = request.files["audio"]
    file_bytes = file.read()
    
    enrollment = db.voice_embeddings.find_one({"user_id": user_id})
    if not enrollment or "embedding" not in enrollment:
        return jsonify({"error": "No baseline voice enrolled."}), 400
        
    try:
        # Step 1: Deepfake Detection Check via AI Engine
        df_resp = requests.post(f"{AI_ENGINE_URL}/api/v1/voice/deepfake", files={"file": ("challenge.wav", file_bytes, "audio/wav")})
        df_result = df_resp.json()
        
        if df_result.get("verdict") == "Deepfake":
            # Immediate Lockout
            db.active_sessions.update_one({"user_id": user_id}, {"$set": {"status": "locked", "trust_score": 0}})
            record_incident(user_id, "Deepfake Injection Attempt", "critical", "Synthesized voice detected during step-up", "TA0011 Command and Control", f"Risk: {df_result.get('risk')}")
            return jsonify({"success": False, "error": "Deepfake detected. Session locked."}), 403
            
        # Step 2: Speaker Verification
        sv_resp = requests.post(
            f"{AI_ENGINE_URL}/api/v1/voice/verify",
            files={"file": ("challenge.wav", file_bytes, "audio/wav")},
            data={"enrolled_embedding": json.dumps(enrollment["embedding"])}
        )
        sv_result = sv_resp.json()
        
        if not sv_result.get("verified"):
            record_incident(user_id, "Voice Verification Failed", "high", "Biometric mismatch during step-up challenge", "TA0006 Credential Access", "Session integrity questionable.")
            db.active_sessions.update_one({"user_id": user_id}, {"$set": {"status": "locked"}})
            return jsonify({"success": False, "error": "Verification failed. Session locked."}), 403
            
        # Success - Restore Trust
        db.active_sessions.update_one({"user_id": user_id}, {"$set": {"trust_score": 100, "status": "active"}})
        broadcast_event("trust_restored", {"user_id": user_id})
        return jsonify({"success": True, "message": "Step-up verified. Trust restored to 100."})
            
    except Exception as e:
        return jsonify({"error": f"AI Engine interaction failed: {str(e)}"}), 502

@app.route("/api/v1/dashboard/soc-stats", methods=["GET"])
def soc_dashboard():
    # SOC Metrics
    active_sessions = db.active_sessions.count_documents({"status": "active"})
    incidents_today = db.soc_incidents.count_documents({"status": "open"})
    avg_trust_docs = list(db.active_sessions.find({"status": "active"}))
    avg_trust = sum([d.get("trust_score", 100) for d in avg_trust_docs]) / max(len(avg_trust_docs), 1)
    
    # Retrieve incidents
    recent_incidents = list(db.soc_incidents.find().sort("_id", -1).limit(20))
    for i in recent_incidents:
        i["id"] = str(i["_id"])
        del i["_id"]
        
    return jsonify({
        "success": True,
        "metrics": {
            "active_sessions": active_sessions,
            "open_incidents": incidents_today,
            "average_network_trust": int(avg_trust)
        },
        "incidents": recent_incidents
    })

@app.route("/api/v1/scans/deepfake", methods=["GET"])
@jwt_required()
def get_deepfake_history():
    scans = list(db.deepfake_scans.find().sort("_id", -1).limit(50))
    for d in scans:
        d["id"] = str(d["_id"])
        del d["_id"]
    return jsonify({"success": True, "scans": scans})

@app.route("/api/v1/voice/deepfake", methods=["POST"])
@jwt_required()
def manual_deepfake_scan():
    user_id = get_jwt_identity()
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
        
    file = request.files["audio"]
    file_bytes = file.read()
    
    try:
        response = requests.post(
            f"{AI_ENGINE_URL}/api/v1/voice/deepfake",
            files={"file": (file.filename, file_bytes, "audio/wav")}
        )
        result = response.json()
        
        # Save independent scan log
        scan_doc = {
            "verdict": result.get("verdict"),
            "confidence": result.get("confidence"),
            "risk": result.get("risk"),
            "explanation": result.get("explanation"),
            "timestamp": datetime.datetime.utcnow(),
            "user_id": user_id
        }
        db.deepfake_scans.insert_one(scan_doc)
        return jsonify({"success": True, "result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 502

@app.route("/api/v1/voice/enroll", methods=["POST"])
@jwt_required()
def enroll_voice():
    user_id = get_jwt_identity()
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
        
    file = request.files["audio"]
    file_bytes = file.read()
    
    try:
        response = requests.post(f"{AI_ENGINE_URL}/api/v1/voice/enroll", files={"file": (file.filename, file_bytes, "audio/wav")})
        result = response.json()
        metrics = result.get("metrics")
        embedding = result.get("embedding")
        
        db.voice_embeddings.replace_one({"user_id": user_id}, {
            "user_id": user_id,
            "metrics": metrics,
            "embedding": embedding,
            "timestamp": datetime.datetime.utcnow()
        }, upsert=True)
        
        return jsonify({
            "success": True, 
            "metrics": metrics, 
            "message": "Voice enrolled successfully!",
            "quality_score": metrics.get("quality_score"),
            "embedding_saved": True
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 502

@app.route("/voice/enroll", methods=["POST"])
def voice_enroll_direct():
    user_id = request.form.get("user_id", "default_user")
    if "audio" not in request.files: return jsonify({"error": "No audio"}), 400
    file = request.files["audio"]
    file_bytes = file.read()
    
    try:
        response = requests.post(f"{AI_ENGINE_URL}/api/v1/voice/enroll", files={"file": ("enroll.wav", file_bytes, "audio/wav")})
        if response.status_code != 200:
            return jsonify({"quality_score": 0, "embedding_saved": False, "error": response.json().get("detail")}), 400
            
        result = response.json()
        metrics = result.get("metrics")
        
        db.voice_embeddings.replace_one({"user_id": user_id}, {
            "user_id": user_id,
            "metrics": metrics,
            "embedding": result.get("embedding"),
            "timestamp": datetime.datetime.utcnow()
        }, upsert=True)
        
        return jsonify({
            "quality_score": metrics.get("quality_score"),
            "embedding_saved": True
        })
    except Exception as e:
        return jsonify({"quality_score": 0, "embedding_saved": False, "error": str(e)}), 500

@app.route("/voice/verify", methods=["POST"])
def voice_verify_direct():
    user_id = request.form.get("user_id", "default_user")
    challenge_phrase = request.form.get("challenge_phrase")
    threshold = float(os.environ.get("VOICE_SIMILARITY_THRESHOLD", "0.25"))

    if "audio" not in request.files: return jsonify({"error": "No audio"}), 400
    file = request.files["audio"]
    file_bytes = file.read()

    enrollment = db.voice_embeddings.find_one({"user_id": user_id})
    if not enrollment: return jsonify({"error": "User not enrolled"}), 400

    record = {
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "user_id": user_id,
        "challenge_phrase": challenge_phrase,
        "similarity": 0.0,
        "verified": False,
        "deepfake_result": "Genuine",
        "reason": ""
    }

    try:
        # 1. Deepfake Check
        df_resp = requests.post(f"{AI_ENGINE_URL}/api/v1/voice/deepfake", files={"file": ("verify.wav", file_bytes, "audio/wav")})
        df_result = df_resp.json()
        if df_result.get("verdict") == "Deepfake":
            record["deepfake_result"] = "Deepfake"
            record["reason"] = "Synthetic Voice Detected"
            db.verification_logs.insert_one(record)
            return jsonify({
                "verified": False,
                "similarity": 0.0,
                "threshold": threshold,
                "reason": "Synthetic Voice Detected"
            })
            
        # 2. Similarity and ASR Check
        sv_resp = requests.post(
            f"{AI_ENGINE_URL}/api/v1/voice/verify",
            files={"file": ("verify.wav", file_bytes, "audio/wav")},
            data={
                "enrolled_embedding": json.dumps(enrollment["embedding"]),
                "challenge_phrase": challenge_phrase if challenge_phrase else "",
                "threshold": threshold
            }
        )
        if sv_resp.status_code != 200:
            raise Exception(sv_resp.text)
            
        sv_result = sv_resp.json()
        
        record["similarity"] = sv_result.get("similarity", 0.0)
        record["verified"] = sv_result.get("verified", False)
        record["reason"] = sv_result.get("error", "Verification completed.")
        db.verification_logs.insert_one(record)

        if "error" in sv_result:
            return jsonify({
                "verified": False,
                "similarity": 0.0,
                "threshold": threshold,
                "reason": sv_result["error"]
            })

        return jsonify({
            "verified": sv_result["verified"],
            "similarity": sv_result["similarity"],
            "threshold": threshold
        })
    except Exception as e:
        record["reason"] = str(e)
        db.verification_logs.insert_one(record)
        return jsonify({"verified": False, "similarity": 0.0, "threshold": threshold, "error": str(e)}), 500

@app.route("/api/v1/incidents", methods=["GET"])
@jwt_required()
def get_incidents():
    inc_docs = list(db.soc_incidents.find().sort("_id", -1).limit(50))
    for d in inc_docs:
        d["id"] = str(d["_id"])
        del d["_id"]
    return jsonify({"success": True, "incidents": inc_docs})

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, allow_unsafe_werkzeug=True)
