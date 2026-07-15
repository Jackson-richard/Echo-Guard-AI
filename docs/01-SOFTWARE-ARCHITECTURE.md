# EchoGuard AI — Software Architecture Document

> **Version:** 1.0.0  
> **Classification:** Internal — Architecture Blueprint  
> **Last Updated:** 2026-07-14  
> **Author:** EchoGuard AI Engineering Team

---

## 1. Executive Summary

EchoGuard AI is an enterprise-grade **Multi-Modal Continuous Authentication & Deepfake Defense Platform** built on Zero Trust Security principles. Unlike traditional authentication systems that verify users only at login, EchoGuard AI continuously evaluates user authenticity throughout active sessions using multiple biometric and contextual signals.

The platform detects account hijacking, insider threats, deepfake voice attacks, voice impersonation, behavioral anomalies, session hijacking, and suspicious user behavior — computing a **Dynamic Trust Score** in real-time to make autonomous access control decisions.

---

## 2. Architectural Principles

| Principle | Application |
|---|---|
| **Zero Trust** | Never trust, always verify. Every request is authenticated and authorized continuously. |
| **Defense in Depth** | Multiple independent security layers — voice biometrics, behavioral analysis, deepfake detection, contextual risk. |
| **Clean Architecture** | Business logic is independent of frameworks, UI, databases, and external agencies. |
| **SOLID** | Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion. |
| **Separation of Concerns** | Each module owns its domain logic, data access, and API surface. |
| **Fail-Secure** | On failure, the system defaults to the most restrictive security posture. |
| **Observability** | Every decision is logged, explained, and auditable. |

---

## 3. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │Dashboard │ │ Alerts   │ │ Reports  │ │ Admin    │ │ Settings    │  │
│  │ Module   │ │ Module   │ │ Module   │ │ Module   │ │ Module      │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬──────┘  │
│       └─────────────┴────────────┴─────────────┴─────────────┘         │
│                          React + Vite + TailwindCSS                    │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │ HTTPS / WSS
┌──────────────────────────────▼──────────────────────────────────────────┐
│                          API GATEWAY LAYER                             │
│              NGINX Reverse Proxy + Rate Limiting + SSL                 │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────────┐
│                       APPLICATION LAYER (Flask)                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │   Auth API   │ │  Voice API   │ │ Behavior API │ │  Trust API   │  │
│  │  Blueprint   │ │  Blueprint   │ │  Blueprint   │ │  Blueprint   │  │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘  │
│         └────────────────┴────────────────┴────────────────┘           │
│                        Flask Blueprint Router                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │  Incident    │ │Notification  │ │  Reports     │ │   Admin      │  │
│  │  Blueprint   │ │  Blueprint   │ │  Blueprint   │ │  Blueprint   │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │
│                                                                        │
│  ┌─────────────────── MIDDLEWARE PIPELINE ──────────────────────────┐  │
│  │ JWT Validation → Rate Limiter → Trust Gate → Request Logger     │  │
│  └─────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────────┐
│                        SERVICE LAYER                                   │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐              │
│  │ AuthService    │ │ VoiceService   │ │ BehaviorService│              │
│  ├────────────────┤ ├────────────────┤ ├────────────────┤              │
│  │ TrustEngine    │ │ RiskEngine     │ │ DeepfakeService│              │
│  ├────────────────┤ ├────────────────┤ ├────────────────┤              │
│  │ IncidentService│ │ NotifyService  │ │ ReportService  │              │
│  ├────────────────┤ ├────────────────┤ ├────────────────┤              │
│  │ ThreatIntel    │ │ AuditService   │ │ ExplainService │              │
│  └────────────────┘ └────────────────┘ └────────────────┘              │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────────┐
│                      ML INFERENCE LAYER                                │
│  ┌───────────────────┐ ┌───────────────────┐ ┌──────────────────────┐  │
│  │ Speaker Verifier  │ │ Deepfake Detector │ │ Behavior Anomaly     │  │
│  │ (Resemblyzer /    │ │ (Pre-trained CNN) │ │ Detector             │  │
│  │  SpeechBrain)     │ │                   │ │ (Isolation Forest)   │  │
│  └───────────────────┘ └───────────────────┘ └──────────────────────┘  │
│  ┌───────────────────┐ ┌───────────────────┐                           │
│  │ SHAP Explainer    │ │ Feature Extractor │                           │
│  └───────────────────┘ └───────────────────┘                           │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────────┐
│                      DATA ACCESS LAYER                                 │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐              │
│  │ UserRepository │ │ VoiceRepository│ │ SessionRepo    │              │
│  ├────────────────┤ ├────────────────┤ ├────────────────┤              │
│  │ AlertRepository│ │ IncidentRepo   │ │ AuditLogRepo   │              │
│  ├────────────────┤ ├────────────────┤ ├────────────────┤              │
│  │ BehaviorRepo   │ │ SettingsRepo   │ │ NotificationRepo│             │
│  └────────────────┘ └────────────────┘ └────────────────┘              │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────────┐
│                      PERSISTENCE LAYER                                 │
│                   MongoDB (MongoEngine ODM)                            │
│  ┌────────┐┌───────────┐┌────────┐┌──────┐┌────────┐┌──────────────┐  │
│  │ users  ││voice_     ││behavior││sess- ││alerts  ││risk_scores   │  │
│  │        ││profiles   ││profiles││ions  ││        ││              │  │
│  ├────────┤├───────────┤├────────┤├──────┤├────────┤├──────────────┤  │
│  │incident││notifica-  ││audit_  ││system││settings││              │  │
│  │reports ││tions      ││logs    ││_logs ││        ││              │  │
│  └────────┘└───────────┘└────────┘└──────┘└────────┘└──────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Layer Responsibilities

### 4.1 Presentation Layer (Frontend)
- Renders enterprise dashboards, alerts, reports, and admin panels.
- Captures behavioral biometrics (keystroke dynamics, mouse movement, scroll patterns).
- Captures voice audio via WebRTC / MediaRecorder API.
- Communicates with backend via REST (Axios) and WebSocket (Socket.IO).
- Displays real-time trust scores, threat indicators, and SHAP explanations.

### 4.2 API Gateway Layer (NGINX)
- SSL/TLS termination.
- Rate limiting and DDoS protection.
- Request routing to Flask backend.
- Static asset serving for production builds.
- WebSocket upgrade handling.

### 4.3 Application Layer (Flask Blueprints)
- Exposes RESTful API endpoints organized by domain.
- Validates and sanitizes all incoming requests.
- Delegates business logic to the Service Layer.
- Handles JWT-based authentication and authorization.
- Manages WebSocket connections for real-time updates.

### 4.4 Service Layer
- Contains all business logic.
- Orchestrates operations across multiple repositories and ML models.
- Implements the Trust Engine decision pipeline.
- Generates AI-based explanations using SHAP.
- Produces incident reports and forensic data.

### 4.5 ML Inference Layer
- Loads and manages pre-trained models.
- Performs speaker verification, deepfake detection, and anomaly detection.
- Extracts audio features (MFCCs, spectrograms) via Librosa.
- Provides explainability via SHAP values.
- Returns confidence scores and classification results.

### 4.6 Data Access Layer (Repositories)
- Abstracts all database operations behind repository interfaces.
- Each collection has a dedicated repository class.
- Implements query builders, pagination, and filtering.
- Handles data serialization/deserialization via MongoEngine.

### 4.7 Persistence Layer (MongoDB)
- Stores all structured and semi-structured data.
- Supports TTL indexes for session and log expiry.
- Provides compound indexes for query performance.
- Enables change streams for real-time event propagation.

---

## 5. Communication Patterns

| Pattern | Usage |
|---|---|
| **REST API** | CRUD operations, report generation, user management, configuration. |
| **WebSocket (Socket.IO)** | Real-time trust score updates, alert notifications, live dashboard feeds. |
| **Event-Driven** | Internal service-to-service communication via an in-process event bus. |
| **Request-Response** | ML inference calls from services to model wrappers. |

---

## 6. Cross-Cutting Concerns

### 6.1 Authentication & Authorization
- JWT access tokens (short-lived, 15 min) + refresh tokens (long-lived, 7 days).
- Role-Based Access Control (RBAC): `super_admin`, `admin`, `analyst`, `user`.
- Every API endpoint protected by middleware.
- Trust-gated endpoints that require minimum trust score.

### 6.2 Logging & Observability
- Structured JSON logging via Python `logging` module.
- Three log categories: **Application Logs**, **Audit Logs**, **Security Logs**.
- Correlation IDs propagated across service calls.
- All trust decisions logged with full context.

### 6.3 Error Handling
- Global exception handler middleware.
- Standardized error response format: `{ error_code, message, details, timestamp, correlation_id }`.
- Domain-specific exception hierarchy: `EchoGuardException` → `AuthException`, `VoiceException`, `TrustException`, etc.
- Fail-secure: errors default to session restriction.

### 6.4 Configuration Management
- Hierarchical config: defaults → `.env` → environment variables → runtime overrides.
- Separate configs per environment: `development`, `staging`, `production`.
- Secrets managed via environment variables (never committed to VCS).
- Feature flags for gradual rollout.

---

## 7. Deployment Architecture

```
┌──────────────────────────────────────────────────┐
│                Docker Compose                     │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  NGINX   │  │  Flask   │  │   MongoDB     │   │
│  │ (Proxy)  │──│ (Gunicorn│──│  (Persistent  │   │
│  │ :80/:443 │  │  + WSGI) │  │   Volume)     │   │
│  │          │  │  :5000   │  │   :27017      │   │
│  └──────────┘  └──────────┘  └──────────────┘   │
│                                                   │
│  ┌──────────────────────────────────────────┐    │
│  │        Frontend (Static Build)           │    │
│  │        Served by NGINX                   │    │
│  └──────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

**Containers:**

| Container | Image | Purpose |
|---|---|---|
| `echoguard-nginx` | nginx:alpine | Reverse proxy, SSL, static files |
| `echoguard-api` | python:3.11-slim | Flask API + Gunicorn + ML models |
| `echoguard-db` | mongo:7 | MongoDB persistence |

---

## 8. Technology Justification

| Technology | Category | Justification |
|---|---|---|
| **React** | Frontend | Component-based architecture, massive ecosystem, enterprise adoption. |
| **Vite** | Build Tool | Lightning-fast HMR, native ES module support, superior DX over CRA/Webpack. |
| **Tailwind CSS** | Styling | Utility-first approach enables rapid prototyping of complex enterprise UIs. |
| **Chart.js** | Visualization | Lightweight, responsive charts with animation support for trust score dashboards. |
| **Framer Motion** | Animation | Declarative animations for premium feel — alert transitions, score gauges, card reveals. |
| **Flask** | Backend | Lightweight, extensible, ideal for ML-heavy applications where fine control is needed. |
| **Flask Blueprints** | Routing | Modular API organization — each domain gets its own blueprint, enabling microservice extraction. |
| **Flask-JWT-Extended** | Auth | Production-grade JWT handling with token refresh, blocklists, and custom claims. |
| **Flask-SocketIO** | Realtime | Enables WebSocket communication for live trust score streaming and alert push. |
| **MongoDB** | Database | Schema flexibility for evolving biometric data; native JSON document storage; horizontal scaling. |
| **MongoEngine** | ODM | Pythonic document modeling with validation, signals, and query building. |
| **Resemblyzer** | Speaker Verification | Pre-trained d-vector model for speaker embedding extraction. Lightweight, production-ready. |
| **SpeechBrain** | Speaker Verification (Alt) | State-of-the-art ECAPA-TDNN model. Higher accuracy, slightly heavier. |
| **Librosa** | Audio Processing | Industry-standard Python library for audio feature extraction (MFCCs, spectrograms). |
| **Isolation Forest** | Anomaly Detection | Unsupervised anomaly detection ideal for behavioral drift; no labeled data required. |
| **SHAP** | Explainability | Model-agnostic explanations for trust decisions — critical for enterprise compliance. |
| **Docker / Compose** | Deployment | Consistent environments, one-command deployment, production parity. |
| **NGINX** | Gateway | High-performance reverse proxy with SSL termination and rate limiting. |
| **Gunicorn** | WSGI Server | Production-grade multi-worker WSGI server for Flask. |
