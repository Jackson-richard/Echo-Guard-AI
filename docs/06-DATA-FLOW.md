# EchoGuard AI — Data Flow & Sequence Diagrams

> **Version:** 1.0.0  
> **Classification:** Internal — Architecture Blueprint

---

## 1. High-Level Data Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                                 │
│                                                                      │
│  ┌─────────────┐   ┌──────────────┐   ┌───────────────────────┐     │
│  │  Voice       │   │  Behavioral  │   │  Standard             │     │
│  │  Recorder    │   │  Collector   │   │  Interactions         │     │
│  │  (WebRTC)    │   │  (Passive)   │   │  (Clicks, Nav)        │     │
│  └──────┬───────┘   └──────┬───────┘   └───────────┬───────────┘     │
│         │                  │                       │                 │
│         │    Audio Blob    │  Keystroke/Mouse       │  REST API      │
│         │                  │  Events (Batched)     │  Requests       │
│         ▼                  ▼                       ▼                 │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                  React Application                           │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │    │
│  │  │ VoiceService │  │ BehaviorHook │  │ API Service  │       │    │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │    │
│  │         └─────────────────┴─────────────────┘               │    │
│  │                           │                                  │    │
│  │             ┌─────────────┴────────────────┐                │    │
│  │             │  Axios (REST) + Socket.IO    │                │    │
│  │             └─────────────┬────────────────┘                │    │
│  └───────────────────────────┼──────────────────────────────────┘    │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
                    ╔══════════╧═══════════╗
                    ║    NGINX Gateway     ║
                    ║  SSL + Rate Limit    ║
                    ╚══════════╤═══════════╝
                               │
┌──────────────────────────────▼───────────────────────────────────────┐
│                       FLASK APPLICATION                              │
│                                                                      │
│  ┌────────────────── MIDDLEWARE PIPELINE ──────────────────────┐     │
│  │  JWT Auth → Rate Limit → Trust Gate → Request Logger       │     │
│  └────────────────────────────┬────────────────────────────────┘     │
│                               │                                      │
│  ┌────────────────────────────▼────────────────────────────────┐     │
│  │                    API BLUEPRINTS                            │     │
│  │  auth_bp │ voice_bp │ behavior_bp │ trust_bp │ dashboard_bp │     │
│  └────────────────────────────┬────────────────────────────────┘     │
│                               │                                      │
│  ┌────────────────────────────▼────────────────────────────────┐     │
│  │                    SERVICE LAYER                             │     │
│  │                                                              │     │
│  │  ┌──────────────────────────────────────────────────────┐   │     │
│  │  │              TRUST ENGINE (Orchestrator)              │   │     │
│  │  │                                                      │   │     │
│  │  │   Collects signals from:                             │   │     │
│  │  │   ├── VoiceService     → speaker similarity score    │   │     │
│  │  │   ├── DeepfakeService  → authenticity probability    │   │     │
│  │  │   ├── BehaviorService  → anomaly score               │   │     │
│  │  │   ├── RiskEngine       → contextual risk score       │   │     │
│  │  │   └── SessionData      → session integrity score     │   │     │
│  │  │                                                      │   │     │
│  │  │   Computes: Weighted Trust Score (0-100)             │   │     │
│  │  │   Decides:  Continue | Challenge | Restrict | Term   │   │     │
│  │  │   Explains: SHAP-based human-readable explanation    │   │     │
│  │  └──────────────────────────────────────────────────────┘   │     │
│  └────────────────────────────┬────────────────────────────────┘     │
│                               │                                      │
│  ┌────────────────────────────▼────────────────────────────────┐     │
│  │                    ML INFERENCE LAYER                        │     │
│  │  ┌───────────────┐ ┌────────────────┐ ┌─────────────────┐  │     │
│  │  │  Resemblyzer   │ │ Deepfake Model │ │ Isolation Forest│  │     │
│  │  │  Speaker       │ │ Audio          │ │ Behavioral      │  │     │
│  │  │  Verification  │ │ Classifier     │ │ Anomaly         │  │     │
│  │  └───────────────┘ └────────────────┘ └─────────────────┘  │     │
│  └────────────────────────────┬────────────────────────────────┘     │
│                               │                                      │
│  ┌────────────────────────────▼────────────────────────────────┐     │
│  │                    REPOSITORY LAYER                          │     │
│  │  UserRepo │ VoiceRepo │ SessionRepo │ AlertRepo │ AuditRepo │     │
│  └────────────────────────────┬────────────────────────────────┘     │
│                               │                                      │
└────────────────────────────── │ ──────────────────────────────────────┘
                               │
                    ╔══════════╧═══════════╗
                    ║      MongoDB         ║
                    ╚══════════════════════╝
```

---

## 2. Trust Score Computation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   TRUST ENGINE PIPELINE                          │
│                                                                  │
│  INPUT SIGNALS          WEIGHTS       COMPONENT SCORES           │
│  ─────────────          ───────       ────────────────           │
│                                                                  │
│  Voice Verification ──── 30% ──── voice_score (0-100)           │
│        │                                                         │
│  Deepfake Detection ──── 25% ──── deepfake_score (0-100)        │
│        │                                                         │
│  Behavior Analysis ───── 20% ──── behavior_score (0-100)        │
│        │                                                         │
│  Contextual Risk ──────── 15% ──── context_score (0-100)        │
│        │                                                         │
│  Session Integrity ────── 10% ──── session_score (0-100)        │
│        │                                                         │
│        ▼                                                         │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  WEIGHTED AGGREGATION                                 │       │
│  │                                                       │       │
│  │  trust_score = Σ (component_score × weight)           │       │
│  │                                                       │       │
│  │  With override rules:                                 │       │
│  │  • If deepfake_detected  → cap at 10 (CRITICAL)       │       │
│  │  • If voice_mismatch     → cap at 30 (LOW)            │       │
│  │  • If behavior_anomaly   → reduce by 30%              │       │
│  │  • If session_hijack     → force to 0 (TERMINATE)     │       │
│  └──────────────────────────┬───────────────────────────┘       │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  DECISION ENGINE                                      │       │
│  │                                                       │       │
│  │  Score 80-100 → CONTINUE  (trust_level: high)         │       │
│  │  Score 50-79  → CHALLENGE (trust_level: medium)       │       │
│  │  Score 20-49  → RESTRICT  (trust_level: low)          │       │
│  │  Score  0-19  → TERMINATE (trust_level: critical)     │       │
│  └──────────────────────────┬───────────────────────────┘       │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  SHAP EXPLAINER                                       │       │
│  │                                                       │       │
│  │  "Trust score dropped to 35 (LOW) because:            │       │
│  │   • Voice verification confidence: 42% (-28 impact)   │       │
│  │   • Typing speed deviation: +45% from baseline        │       │
│  │   • Login from new IP address in different country"    │       │
│  └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Continuous Authentication Sequence

```
User                Frontend          Backend             ML Layer         MongoDB
 │                    │                  │                   │                │
 │──── Login ────────▶│                  │                   │                │
 │                    │── POST /auth ───▶│                   │                │
 │                    │                  │── validate pwd ──▶│                │
 │                    │                  │◀── pwd ok ────────│                │
 │                    │                  │── create session ─────────────────▶│
 │                    │◀── JWT tokens ───│                   │                │
 │◀── Dashboard ──────│                  │                   │                │
 │                    │                  │                   │                │
 │                    │══ WebSocket Connect (Socket.IO) ════▶│                │
 │                    │                  │                   │                │
 ╔════════════════════╧══════════════════╧═══════════════════╧═══════════════╗
 ║                    CONTINUOUS AUTHENTICATION LOOP                         ║
 ╚════════════════════╤══════════════════╤═══════════════════╤═══════════════╝
 │                    │                  │                   │                │
 │  [Typing...]       │                  │                   │                │
 │  [Mouse move...]   │                  │                   │                │
 │                    │                  │                   │                │
 │                    │── POST /behavior │                   │                │
 │                    │   (batched       │                   │                │
 │                    │    events)──────▶│                   │                │
 │                    │                  │── extract features│                │
 │                    │                  │──────────────────▶│                │
 │                    │                  │                   │── anomaly      │
 │                    │                  │                   │   detection    │
 │                    │                  │◀── anomaly_score──│                │
 │                    │                  │                   │                │
 │                    │                  │                   │                │
 │  [Voice prompt     │                  │                   │                │
 │   triggered]       │                  │                   │                │
 │── Record audio ───▶│                  │                   │                │
 │                    │── POST /voice    │                   │                │
 │                    │   (audio blob)──▶│                   │                │
 │                    │                  │── preprocess ────▶│                │
 │                    │                  │                   │── speaker      │
 │                    │                  │                   │   verify       │
 │                    │                  │◀── similarity ────│                │
 │                    │                  │                   │                │
 │                    │                  │── deepfake check─▶│                │
 │                    │                  │                   │── classify     │
 │                    │                  │◀── genuine/fake ──│                │
 │                    │                  │                   │                │
 │                    │                  │                   │                │
 │                    │                  │───────────────────────────────┐    │
 │                    │                  │  TRUST ENGINE COMPUTATION     │    │
 │                    │                  │                               │    │
 │                    │                  │  Aggregate:                   │    │
 │                    │                  │  • voice_score                │    │
 │                    │                  │  • deepfake_score             │    │
 │                    │                  │  • behavior_score             │    │
 │                    │                  │  • context_score              │    │
 │                    │                  │  • session_score              │    │
 │                    │                  │                               │    │
 │                    │                  │  Compute weighted score       │    │
 │                    │                  │  Apply override rules         │    │
 │                    │                  │  Generate SHAP explanation    │    │
 │                    │                  │  Make access decision         │    │
 │                    │                  │◀──────────────────────────────┘    │
 │                    │                  │                   │                │
 │                    │                  │── store risk_score ───────────────▶│
 │                    │                  │── update session ─────────────────▶│
 │                    │                  │                   │                │
 │                    │◀═ WS: trust_update ═══════════════════│                │
 │◀── Update gauge ───│                  │                   │                │
 │                    │                  │                   │                │
 ║                    ║                  ║                   ║                ║
 ║  IF trust < 20:    ║                  ║                   ║                ║
 │                    │◀═ WS: session_terminated ════════════│                │
 │◀── Force logout ───│                  │── create alert ──────────────────▶│
 │                    │                  │── create incident ────────────────▶│
 │                    │                  │── audit log ──────────────────────▶│
 │                    │                  │                   │                │
 ║  IF 20 < trust < 50:                 ║                   ║                ║
 │                    │◀═ WS: access_restricted ═════════════│                │
 │◀── Limited UI ─────│                  │                   │                │
 │                    │                  │                   │                │
 ║  IF 50 < trust < 80:                 ║                   ║                ║
 │                    │◀═ WS: re_auth_required ══════════════│                │
 │◀── Show re-auth ───│                  │                   │                │
 │── Re-authenticate ▶│                  │                   │                │
 │                    │                  │                   │                │
```

---

## 4. Voice Enrollment Flow

```
User              Frontend           Backend            ML Layer          MongoDB
 │                   │                  │                  │                 │
 │── Start enroll ──▶│                  │                  │                 │
 │                   │── GET /voice/    │                  │                 │
 │                   │   status ───────▶│                  │                 │
 │                   │◀── {enrolled:    │                  │                 │
 │                   │    false,        │                  │                 │
 │                   │    samples: 0/3} │                  │                 │
 │                   │                  │                  │                 │
 │◀── Show prompt ───│                  │                  │                 │
 │   "Read this      │                  │                  │                 │
 │    phrase aloud"   │                  │                  │                 │
 │                   │                  │                  │                 │
 │── Record sample ─▶│                  │                  │                 │
 │                   │── POST /voice/   │                  │                 │
 │                   │   enroll ───────▶│                  │                 │
 │                   │                  │── validate audio │                 │
 │                   │                  │── preprocess ───▶│                 │
 │                   │                  │                  │── quality      │
 │                   │                  │                  │   check        │
 │                   │                  │◀── quality ok ───│                 │
 │                   │                  │                  │── extract      │
 │                   │                  │                  │   embedding    │
 │                   │                  │◀── d-vector ─────│                 │
 │                   │                  │── store sample ──────────────────▶│
 │                   │◀── {samples: 1/3}│                  │                 │
 │◀── "2 more        │                  │                  │                 │
 │    needed" ────────│                  │                  │                 │
 │                   │                  │                  │                 │
 │   ... (repeat 2x) ...               │                  │                 │
 │                   │                  │                  │                 │
 │                   │                  │── avg embeddings─▶│                 │
 │                   │                  │◀── final d-vector│                 │
 │                   │                  │── store profile ─────────────────▶│
 │                   │◀── {enrolled:    │                  │                 │
 │                   │    true}         │                  │                 │
 │◀── "Enrollment    │                  │                  │                 │
 │    complete!" ─────│                  │                  │                 │
```

---

## 5. Deepfake Detection Data Flow

```
Audio Input
    │
    ▼
┌──────────────────┐
│  Preprocessing    │   • Sample rate normalization (16 kHz)
│                   │   • Noise reduction (spectral gating)
│                   │   • Silence trimming
│                   │   • Amplitude normalization
└────────┬──────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────────────┐
│Speaker │ │ Deepfake       │
│Verify  │ │ Detection      │
│        │ │                │
│Resemb- │ │Pre-trained CNN │
│lyzer   │ │on mel-spectro- │
│        │ │gram analysis   │
│Output: │ │                │
│cosine  │ │Output:         │
│similar-│ │P(genuine),     │
│ity     │ │P(synthetic)    │
│(0-1)   │ │(0-1)           │
└───┬────┘ └───────┬────────┘
    │              │
    ▼              ▼
┌─────────────────────────────┐
│      RESULT FUSION           │
│                              │
│  IF deepfake_prob > 0.7:     │
│    → DEEPFAKE ALERT          │
│    → Trust cap at 10         │
│                              │
│  IF similarity < 0.75:       │
│    → VOICE MISMATCH          │
│    → Trust reduced           │
│                              │
│  IF both pass:               │
│    → HIGH CONFIDENCE         │
│    → Trust boost             │
└──────────────────────────────┘
```

---

## 6. Incident Response Flow

```
  THREAT DETECTED
        │
        ▼
  ┌─────────────┐
  │ Create Alert │──────▶ MongoDB: alerts
  └──────┬──────┘
         │
         ▼
  ┌──────────────────┐
  │ Severity >= HIGH? │
  └──────┬───────────┘
     YES │        NO
         │         └──▶ Notification (in-app)
         ▼
  ┌──────────────────┐
  │ Create Incident  │──────▶ MongoDB: incident_reports
  └──────┬───────────┘
         │
         ├──▶ WS Push: Alert to dashboard
         ├──▶ WS Push: Notification to user
         ├──▶ Auto-action (restrict/terminate)
         ├──▶ Audit log entry
         │
         ▼
  ┌──────────────────┐
  │ Forensic Package │
  │                  │
  │ • Trust score    │
  │   history        │
  │ • Audio samples  │
  │ • Behavior       │
  │   snapshot        │
  │ • Session data   │
  │ • Network data   │
  │ • SHAP explain   │
  └──────────────────┘
```
