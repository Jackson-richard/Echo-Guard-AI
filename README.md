# EchoGuard AI 🛡️

**AI-Powered Multi-Modal Continuous Authentication & Deepfake Defense Platform**

[![Python Version](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://python.org)
[![React Version](https://img.shields.io/badge/react-18-blue.svg)](https://reactjs.org/)
[![Docker Support](https://img.shields.io/badge/docker-ready-green.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#)

EchoGuard AI is an enterprise-grade cybersecurity SaaS platform designed to eliminate account takeovers and defeat deepfake injection attacks. Utilizing a proprietary **Zero-Trust Adaptive Engine**, the system continuously monitors user behavior and vocal biometrics in real-time, autonomously calculating security risk and terminating compromised sessions instantaneously.

---

## 🌟 Core Features

- **Continuous Behavioral Biometrics:** Real-time tracking of mouse dynamics, keystroke rhythm, and flight-time mapping against a personalized deep-learning model (Isolation Forest).
- **Voice Biometric Verification:** Sub-second vocal feature extraction and comparative analysis using ECAPA-TDNN technology.
- **Deepfake Audio Defense:** Patented anti-spoofing algorithms immediately detect synthetic, cloned, or replayed audio attacks (AASIST/RawNet2).
- **Adaptive Trust Engine:** A master inference orchestrator running mathematically fused multimodality validation, yielding a real-time `Trust Score (0-100)`.
- **Automated Incident Response:** Self-healing session management capable of issuing Step-Up MFA, locking write-APIs, or instantly revoking JWTs via WebSockets.
- **SecOps Dashboard:** Production-ready dark-themed interface built for Security Operations Center (SOC) analysts to review alerts, forensic timelines, and PDF incident reports.
- **Explainable AI (XAI):** Every Trust Score decision returns a human-readable threat explanation (e.g., "Typing flight time increased by 400% alongside unknown device fingerprint").

---

## 🏗 Architecture

The platform follows a scalable, containerized microservices architecture composed of:
1. **Frontend (Vite + React + Tailwind):** State management handling WebSocket events.
2. **Backend Engine (Flask + Clean Architecture):** Houses REST Controllers, MongoDB Repos, JWT Auth, and Application Services.
3. **AI Inference Subsystem (FastAPI):** GPU/CPU-optimized endpoints running biometric and anti-spoofing predictions securely.
4. **Data Layer (MongoDB + Redis):** Encrypted document store and in-memory rate-limiter.

*Reference `docs/` for complete architectural deep-dives.*

---

## 📁 Repository Structure

```text
EchoGuard/
├── frontend/               # React Vite Application 
├── backend/                # Python Flask Core API
├── ai_engine/              # ML Models & Inference Pipelines
├── docs/                   # Complete architectural specs
├── deploy/                 # Docker, Kubernetes, and Nginx configs
├── .env.example            # Master environment template
├── docker-compose.yml      # Orchestration definition
└── README.md
```

---

## 🚀 Environment Setup & Installation

### Prerequisites
- Docker Engine & Docker Compose (`v2+`)
- Node.js `18+` (For local UI development)
- Python `3.11+` (For local API/ML development)

### 1. Configuration Setup
Clone the repository and prepare the security secrets:
```bash
git clone https://github.com/your-org/echoguard-ai.git
cd echoguard-ai
cp .env.example .env
```
*Note: Update the `.env` with a strong `JWT_SECRET` and secure DB credentials.*

### 2. Dataset & Model Bootstrapping (ML Ops)
Pre-trained weights are required for local inference. Run the bootstrap script:
```bash
bash deploy/scripts/download_models.sh
# Downloads SpeechBrain ECAPA-TDNN and ASVSpoof weights to /ai_engine/models/
```

### 3. Docker Deployment (Recommended)
Launch the entire localized enterprise cluster:
```bash
docker-compose up --build -d
```
Verify cluster health:
```bash
docker ps
```
**Access Points:**
- **SecOps Dashboard:** `http://localhost:3000` (or `80` if proxied locally)
- **Backend API:** `http://localhost:5000/api/v1/health`
- **AI Docs (Swagger):** `http://localhost:8000/docs`

---

## 🤖 Demonstration Mode (Ideathons & Exhibitions)

For live demonstrations, enable `DEMO_MODE=True` in your `.env`.
This unlocks the **SaaS Pitch Threat Simulator** located on the frontend UI, allowing you to instantly trigger:
- *Deepfake Voice Injection* (Forces Trust Score < 10)
- *Account Hijack* (Anomalous keystrokes forcing Step-Up Auth)
- *Insider Threat* (Geo-fence violation)

Watch the WebSockets instantly terminate sessions and generate PDF forensic reports live.

---

## 🛡️ Security & Enterprise Standards
- **OWASP Top 10 Compliant:** Defends against NoSQLi, CSRF, XSS.
- **Cryptography:** TLS1.3 transmission, BCrypt hashing, AES-256 PII storage.
- **Tokens:** Rotating refresh tokens combined with aggressive 15m JWT expiries.

---

## 📚 Documentation 
Refer to the `docs/` directory for exhaustive technical specifications:
- `01-SOFTWARE-ARCHITECTURE.md` - Core Design & Clean Architecture Patterns
- `04-DATABASE-DESIGN.md` - MongoDB ERDs & Collections
- `05-SECURITY-ARCHITECTURE.md` - Cryptography and Network Security
- `09-BACKEND-ARCHITECTURE.md` - Flask API & Business Workflows
- `10-AI-ARCHITECTURE.md` - Machine Learning & XAI Strategy
- `11-PRODUCTION-ARCHITECTURE.md` - DevOps, E2E Testing, & Deployment

---

## 🔮 Future Scope
- **Edge Deployment:** Push behavioral isolation forests directly to client browsers (WebAssembly) for offline zero-latency inference.
- **Multi-tenant Kubernetes:** Scalable Helm charts for B2B sub-domains.
- **Gaze Tracking:** Implement spatial webcam monitoring as a 4th biometric modality.

---

## 📄 License & Confidentiality
Property of EchoGuard AI. Intended for internal demonstration, product review, and cybersecurity assessment purposes. 

**DO NOT distribute proprietary deepfake mitigation weights publicly.**
