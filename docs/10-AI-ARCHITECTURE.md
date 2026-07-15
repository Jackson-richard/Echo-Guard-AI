# EchoGuard AI - Core Artificial Intelligence Architecture

## 1. Executive Summary
The EchoGuard AI layer acts as the **Adaptive Trust Engine**—a continuous, multi-modal verification system guarding against account takeovers and deepfake attacks. It aggregates independent biometric and environmental risk signals to dynamically compute a **Trust Score (0-100)** in real-time, enforcing Zero-Trust continuous authentication. The architecture is modular, relying heavily on pre-trained enterprise-grade models optimized for low latency inference.

---

## 2. AI Folder Structure

```text
ai_engine/
├── core/                       # Core orchestration layers
│   ├── adaptive_trust.py       # Adaptive Trust Engine logic
│   ├── explainability.py       # SHAP / LIME / Rule-based explainable AI
│   └── thresholding.py         # Trust boundary decision logic
├── modules/                    # Individual AI Subsystems
│   ├── voice/
│   │   ├── feature_extraction.py
│   │   ├── speaker_verification.py
│   │   └── voice_embeddings.py
│   ├── behavior/
│   │   ├── feature_engineering.py
│   │   ├── anomaly_detector.py
│   │   └── baseline_tracker.py
│   └── deepfake/
│       ├── audio_anti_spoofing.py
│       └── confidence_scorer.py
├── data/                       # Dataset processing and synthetic generators
│   ├── synthetic_behavior.py
│   └── loaders/
├── models/                     # Weights, pipelines, and pre-trained checkpoints
│   ├── ecapa_tdnn/
│   ├── isolation_forest/
│   └── asvspoof/
├── pipelines/                  # End-to-end execution wrappers
│   ├── inference_pipeline.py
│   └── training_pipeline.py
├── evaluation/                 # Metrics & Model validation
│   ├── metrics.py              
│   ├── roc_analysis.py
│   └── evaluation_reports.py
├── mlops/                      # Lifecycle & Storage
│   ├── model_registry.py
│   ├── shadow_deploy.py
│   └── auto_retrain.py
├── tests/                      # Validation testing for AI logic
└── requirements-ai.txt
```

---

## 3. Model Selection Strategy

### Voice Biometrics (Speaker Verification)
- **Model:** Pre-trained **SpeechBrain ECAPA-TDNN** (Emphasized Channel Attention, Propagation, and Aggregation in TDNN).
- **Why:** State-of-the-art for Text-Independent Speaker Verification. Extreme accuracy in zero-shot verification, providing highly discriminative embeddings.

### Behavioral Biometrics (Anomaly Detection)
- **Model:** **Isolation Forest** (Primary fallback: XGBoost for supervised components if labels are generated).
- **Why:** Ideal for unsupervised anomaly detection where normal traffic (the baselined user profile) is highly prevalent, and intrusions (hijacked sessions) appear as outliers. Computationally lightweight.

### Audio Deepfake Detection (Anti-Spoofing)
- **Model:** Pre-trained models evaluated on **ASVspoof 2021** (e.g., RawNet2 or AASIST).
- **Why:** Directly addresses synthesized, voice-cloned, and replayed audio attacks. Avoiding training from scratch leverages years of acoustic research into synthetic artifacts.

---

## 4. Dataset Selection

- **VoxCeleb 1 & 2:** Used for evaluating generalizability of our Voice Biometrics pipeline under "in-the-wild" noise.
- **LibriSpeech:** Providing clean baseline audio corpus to validate fundamental model accuracy.
- **ASVspoof (2019/2021):** The gold standard dataset for logical access (synthetic speech) and physical access (replay attacks) deepfakes.
- **Behavior Data:** Generated synthetic keystroke dynamics, augmented with carefully collected local browser behavior datasets (typing speed, flight time, cursor curvature) during testing.
- **Why:** Using established academic/industry datasets ensures models are benchmarked against known standards, preventing over-tuning on proprietary small-scale data.

---

## 5. Feature Engineering Strategy

### Voice
- Melspectrograms, MFCCs (Mel-Frequency Cepstral Coefficients), Pitch, Spectral Centroid, and Energy.
- Pipeline truncates/pads audio, normalizes volume, and extracts embeddings directly from the TDNN layer to create a dense vector per user.

### Behavior (Continuous)
- **Keystrokes:** Key Hold Duration (press to release), Flight Time (release of $K_n$ to press of $K_{n+1}$), Typing Speed (WPM).
- **Mouse Dynamics:** Speed, Acceleration (pixels/$ms^2$), Curvature (deviation from linear path), Click Frequency.
- **Environmental Context:** Session duration, Device fingerprint matches, IP geography consistency.

---

## 6. Training & Retraining Pipeline

**Behavioral Retraining (Dynamic Profiles):**
1. System collects N sessions of confirmed safe behavior.
2. `auto_retrain.py` builds an updated feature set.
3. Model fits a new Isolation Forest per user asynchronously.
4. Old model remains active in a Shadow Deployment while the new model is evaluated (K-Fold cross-validation).
5. If new model F1/Precision is superior, hot-swap the model references.

**Global Model Retraining:**
Voice and Deepfake sub-systems are pre-trained. Retraining is handled downstream by mlops only when fundamental shifts in base models (e.g., new state-of-the-art open source release) are integrated.

---

## 7. Real-Time Inference Pipeline

**Latency Goal:** < 250ms per multi-modal interaction.
```text
[ Browser Extractor ] 
    │ (Encrypted Payload)
    ▼
[ Inference Pipeline API (gRPC / sockets) ]
    │
    ├──► [ Voice Extractor ] ──► [ ECAPA-TDNN ] ──► (Voice Score)
    │
    ├──► [ Behavior Extractor ] ──► [ Isolation Forest ] ──► (Anomaly Score)
    │
    └──► [ Audio Validator ] ──► [ AASIST/RawNet2 ] ──► (Deepfake Confidence)
    │
    ▼
[ Adaptive Trust Engine ] ◄── (Historical Context, IP, Device)
    │
    ▼
[ Trust Score (0-100) ] & [ Explainable AI Module ]
    │
    ▼
[ Output Action Trigger -> Backend DB ]
```

---

## 8. Adaptive Trust Engine

The core logic orchestrator. Uses weighted fusion to merge modalities.
* $T_{\text{voice}}$ = 0 (Mismatch) to 1 (Match)
* $T_{\text{behav}}$ = 0 (Anomaly) to 1 (Typical)
* $T_{\text{device}}$ = 0 (Unknown) to 1 (Trusted)
* $P_{\text{fake}}$ = 0 (Real) to 1 (Deepfake)

**Calculation (Simplified):**
$$ Trust = \left[ (W_v \cdot T_{voice}) + (W_b \cdot T_{behav}) + (W_d \cdot T_{device}) \right] \times (1 - P_{fake}) \times 100 $$

**Rule Overrides:** 
If $P_{fake} > 0.8$, immediately cap Trust at 10.

**Decision Boundaries:**
- **> 90:** Session verified. Transparent.
- **70 – 90:** Continue monitoring, augment telemetry logging.
- **40 – 70:** Step-Up Auth required (MFA prompt or Voice re-read).
- **20 – 40:** Temporary restriction (Block sensitive API writes, Read-only).
- **< 20:** Immediate session termination and token revocation.

---

## 9. Explainable AI (XAI) Design

Decisions must be interpretable by Security Analysts.
- **Model Agnostic Frameworks:** Use SHAP (SHapley Additive exPlanations) for tree-based behavioral models to determine *which* behavior caused the flag (e.g., "Typing flight time increased by 400%").
- **Human Readable Outputs:**
  ```json
  {
    "trust_score": 41,
    "decision": "STEP_UP_AUTH",
    "reason": "Voice mismatch detected alongside unknown browser footprint. High deepfake probability.",
    "factors": {
       "voice_similarity": 0.32,
       "typing_rhythm_deviation": "high",
       "deepfake_confidence": 0.85
    },
    "recommendation": "Request voice re-authentication immediately."
  }
  ```

---

## 10. Evaluation Strategy & Metrics

Offline and Shadow evaluations use standard classification metrics:
- **Accuracy, Precision, Recall, F1-Score** (Primary for class imbalance).
- **EER (Equal Error Rate):** Critical for biometric threshold tuning where False Acceptance Rate (FAR) = False Rejection Rate (FRR).
- **ROC-AUC (Receiver Operating Characteristic):** Area under the curve to measure classification robustness.
- **Confusion Matrices:** Plotted automatically during CI/CD to ensure new model builds do not bias toward false positives (locking out legitimate users).

---

## 11. Model Storage & ML-Ops Strategy

- **Voice Embeddings:** Stored securely in MongoDB as Base64 encoded NumPy arrays. 
- **User Models (Behavior):** Pickled/Joblib serialized `sklearn` models stored in an S3-compatible object store (e.g., MinIO), linked to MongoDB `user_id`.
- **Pre-trained Weights (Deepfake/Voice):** Immutable containers mounted locally via Docker Volumes. Kept out of standard DBs due to massive file sizes.
- **Versioning:** Handled via MLflow or DVC (Data Version Control) to track dataset lineage and model hyperparameters.

---

## 12. Optimization & Deployment Strategy

- **Frameworks:** ONNX Runtime for inference. Converting PyTorch models to ONNX slashes latency by up to 50% on CPU.
- **Hardware:** Target multi-core CPU inference for scalability. Keep models small enough to avoid hard GPU requirements unless deploying dedicated Deepfake subnets.
- **Microservices Deployment:** The AI engine is containerized separately from the standard REST API backend (e.g., FastAPI vs Flask), keeping computationally heavy tasks isolated. Communication occurs securely internally.
