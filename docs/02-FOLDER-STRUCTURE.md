# EchoGuard AI — Folder Structure & Module Responsibilities

> **Version:** 1.0.0  
> **Classification:** Internal — Architecture Blueprint

---

## 1. Complete Folder Hierarchy

```
EchoGuard-AI/
│
├── frontend/                          # React + Vite SPA
│   ├── public/                        # Static public assets
│   │   ├── favicon.ico
│   │   ├── logo.svg
│   │   └── manifest.json
│   ├── src/
│   │   ├── assets/                    # Images, icons, fonts
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── fonts/
│   │   ├── components/                # Reusable UI components
│   │   │   ├── common/                # Buttons, Modals, Cards, Loaders
│   │   │   ├── charts/                # Chart.js wrappers
│   │   │   ├── forms/                 # Input fields, form groups
│   │   │   ├── layout/                # Navbar, Sidebar, Footer, PageWrapper
│   │   │   └── feedback/              # Toasts, Alerts, Banners
│   │   ├── features/                  # Feature-based modules
│   │   │   ├── auth/                  # Login, Register, MFA
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── services/
│   │   │   │   └── pages/
│   │   │   ├── dashboard/             # Main dashboard views
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── services/
│   │   │   │   └── pages/
│   │   │   ├── voice/                 # Voice enrollment & verification UI
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── pages/
│   │   │   ├── behavior/              # Behavioral biometrics UI
│   │   │   │   ├── components/
│   │   │   │   └── hooks/
│   │   │   ├── incidents/             # Incident management views
│   │   │   │   ├── components/
│   │   │   │   └── pages/
│   │   │   ├── reports/               # Report generation views
│   │   │   │   ├── components/
│   │   │   │   └── pages/
│   │   │   ├── alerts/                # Real-time alert management
│   │   │   │   ├── components/
│   │   │   │   └── pages/
│   │   │   ├── admin/                 # Admin panel
│   │   │   │   ├── components/
│   │   │   │   └── pages/
│   │   │   ├── settings/              # User & system settings
│   │   │   │   ├── components/
│   │   │   │   └── pages/
│   │   │   └── trust/                 # Trust score visualization
│   │   │       ├── components/
│   │   │       └── hooks/
│   │   ├── hooks/                     # Global custom hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useSocket.js
│   │   │   ├── useTrustScore.js
│   │   │   └── useBehavior.js
│   │   ├── contexts/                  # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── SocketContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── services/                  # API service layer (Axios)
│   │   │   ├── api.js                 # Axios instance + interceptors
│   │   │   ├── authService.js
│   │   │   ├── voiceService.js
│   │   │   ├── dashboardService.js
│   │   │   ├── incidentService.js
│   │   │   ├── reportService.js
│   │   │   └── adminService.js
│   │   ├── utils/                     # Utility functions
│   │   │   ├── constants.js
│   │   │   ├── formatters.js
│   │   │   ├── validators.js
│   │   │   └── behaviorCollector.js   # Keystroke/mouse event capture
│   │   ├── routes/                    # Route definitions
│   │   │   ├── AppRouter.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   └── AdminRoute.jsx
│   │   ├── styles/                    # Global styles
│   │   │   ├── globals.css
│   │   │   └── animations.css
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── .env.example
│   └── .eslintrc.cjs
│
├── backend/                           # Flask Application
│   ├── app/
│   │   ├── __init__.py                # Flask app factory
│   │   ├── extensions.py             # Extension initialization (JWT, SocketIO, CORS)
│   │   ├── api/                       # API Blueprints (Controllers)
│   │   │   ├── __init__.py
│   │   │   ├── auth_bp.py            # /api/v1/auth/*
│   │   │   ├── voice_bp.py           # /api/v1/voice/*
│   │   │   ├── behavior_bp.py        # /api/v1/behavior/*
│   │   │   ├── trust_bp.py           # /api/v1/trust/*
│   │   │   ├── incident_bp.py        # /api/v1/incidents/*
│   │   │   ├── notification_bp.py    # /api/v1/notifications/*
│   │   │   ├── report_bp.py          # /api/v1/reports/*
│   │   │   ├── dashboard_bp.py       # /api/v1/dashboard/*
│   │   │   ├── admin_bp.py           # /api/v1/admin/*
│   │   │   ├── settings_bp.py        # /api/v1/settings/*
│   │   │   └── health_bp.py          # /api/v1/health/*
│   │   ├── services/                  # Business Logic Layer
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── voice_service.py
│   │   │   ├── behavior_service.py
│   │   │   ├── deepfake_service.py
│   │   │   ├── trust_engine.py        # Core Trust Score computation
│   │   │   ├── risk_engine.py         # Risk assessment & classification
│   │   │   ├── threat_intel_service.py
│   │   │   ├── incident_service.py
│   │   │   ├── notification_service.py
│   │   │   ├── report_service.py
│   │   │   ├── audit_service.py
│   │   │   ├── explain_service.py     # SHAP-based explanations
│   │   │   └── admin_service.py
│   │   ├── models/                    # MongoEngine Document Models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── voice_profile.py
│   │   │   ├── behavior_profile.py
│   │   │   ├── session.py
│   │   │   ├── alert.py
│   │   │   ├── risk_score.py
│   │   │   ├── incident_report.py
│   │   │   ├── notification.py
│   │   │   ├── audit_log.py
│   │   │   ├── system_log.py
│   │   │   └── settings.py
│   │   ├── repositories/             # Data Access Layer
│   │   │   ├── __init__.py
│   │   │   ├── base_repository.py     # Abstract base with CRUD
│   │   │   ├── user_repository.py
│   │   │   ├── voice_repository.py
│   │   │   ├── behavior_repository.py
│   │   │   ├── session_repository.py
│   │   │   ├── alert_repository.py
│   │   │   ├── incident_repository.py
│   │   │   ├── audit_repository.py
│   │   │   ├── notification_repository.py
│   │   │   └── settings_repository.py
│   │   ├── middleware/                # Request pipeline middleware
│   │   │   ├── __init__.py
│   │   │   ├── auth_middleware.py     # JWT validation
│   │   │   ├── trust_gate.py         # Trust score enforcement
│   │   │   ├── rate_limiter.py       # Per-user rate limiting
│   │   │   ├── request_logger.py     # Structured request logging
│   │   │   └── error_handler.py      # Global exception handler
│   │   ├── socket/                    # WebSocket event handlers
│   │   │   ├── __init__.py
│   │   │   ├── trust_events.py       # Real-time trust score push
│   │   │   ├── alert_events.py       # Real-time alert push
│   │   │   └── session_events.py     # Session status updates
│   │   ├── auth/                      # Authentication utilities
│   │   │   ├── __init__.py
│   │   │   ├── jwt_manager.py        # Token creation & validation
│   │   │   ├── password_manager.py   # Bcrypt hashing
│   │   │   └── rbac.py               # Role-based access decorators
│   │   ├── utils/                     # Shared utilities
│   │   │   ├── __init__.py
│   │   │   ├── validators.py         # Input validation schemas
│   │   │   ├── serializers.py        # Response serialization
│   │   │   ├── date_utils.py
│   │   │   ├── crypto_utils.py       # Encryption helpers
│   │   │   ├── correlation_id.py     # Request correlation tracking
│   │   │   └── constants.py          # Application constants
│   │   └── config/                    # Configuration management
│   │       ├── __init__.py
│   │       ├── base.py               # Base configuration
│   │       ├── development.py
│   │       ├── production.py
│   │       ├── testing.py
│   │       └── settings.py           # Config loader
│   ├── tests/                         # Test suite
│   │   ├── __init__.py
│   │   ├── conftest.py               # Pytest fixtures
│   │   ├── unit/
│   │   │   ├── test_auth_service.py
│   │   │   ├── test_trust_engine.py
│   │   │   ├── test_voice_service.py
│   │   │   └── test_behavior_service.py
│   │   ├── integration/
│   │   │   ├── test_auth_api.py
│   │   │   ├── test_voice_api.py
│   │   │   └── test_trust_api.py
│   │   └── fixtures/
│   │       ├── sample_audio/
│   │       └── sample_behavior/
│   ├── migrations/                    # Database migration scripts
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── wsgi.py                        # Gunicorn entry point
│   ├── .env.example
│   └── Makefile
│
├── ml/                                # Machine Learning Module
│   ├── __init__.py
│   ├── voice/                         # Speaker Verification & Audio
│   │   ├── __init__.py
│   │   ├── speaker_verifier.py       # Resemblyzer / SpeechBrain wrapper
│   │   ├── feature_extractor.py      # MFCC, spectrogram extraction
│   │   ├── voice_preprocessor.py     # Noise reduction, normalization
│   │   └── voice_config.py           # Model paths, thresholds
│   ├── deepfake/                      # Deepfake Voice Detection
│   │   ├── __init__.py
│   │   ├── deepfake_detector.py      # Pre-trained model wrapper
│   │   ├── audio_analyzer.py         # Spectral artifact detection
│   │   └── deepfake_config.py        # Detection thresholds
│   ├── behavior/                      # Behavioral Anomaly Detection
│   │   ├── __init__.py
│   │   ├── anomaly_detector.py       # Isolation Forest model
│   │   ├── feature_builder.py        # Keystroke/mouse feature engineering
│   │   ├── profile_builder.py        # User baseline construction
│   │   └── behavior_config.py        # Feature weights, thresholds
│   ├── explainability/                # SHAP Explanations
│   │   ├── __init__.py
│   │   ├── shap_explainer.py         # SHAP value computation
│   │   └── explanation_formatter.py  # Human-readable explanations
│   ├── models/                        # Serialized model artifacts
│   │   ├── speaker_model/
│   │   ├── deepfake_model/
│   │   └── behavior_model/
│   └── utils/
│       ├── __init__.py
│       ├── audio_utils.py            # Shared audio processing
│       └── model_loader.py           # Unified model loading
│
├── datasets/                          # Training & evaluation data
│   ├── voice_samples/
│   ├── deepfake_samples/
│   ├── behavior_logs/
│   └── README.md                      # Dataset documentation
│
├── docker/                            # Docker configuration
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── ssl/
│   └── scripts/
│       ├── entrypoint.sh
│       └── init-mongo.js
│
├── docs/                              # Project documentation
│   ├── 01-SOFTWARE-ARCHITECTURE.md
│   ├── 02-FOLDER-STRUCTURE.md
│   ├── 03-MODULE-RESPONSIBILITIES.md
│   ├── 04-DATABASE-DESIGN.md
│   ├── 05-SECURITY-ARCHITECTURE.md
│   ├── 06-DATA-FLOW.md
│   ├── 07-DEVELOPMENT-ROADMAP.md
│   ├── 08-CODING-STANDARDS.md
│   ├── API-REFERENCE.md
│   └── DEPLOYMENT-GUIDE.md
│
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
├── .gitignore
├── Makefile
├── LICENSE
└── README.md
```

---

## 2. Module Responsibility Matrix

### 2.1 Frontend Modules

| Module | Responsibility |
|---|---|
| `components/common` | Reusable atoms: Button, Card, Modal, Badge, Avatar, Spinner, Tooltip. |
| `components/charts` | Chart.js wrapper components: TrustGauge, RiskTimeline, BehaviorHeatmap, AlertDistribution. |
| `components/layout` | Page structure: Navbar, Sidebar, Footer, PageWrapper, BreadcrumbNav. |
| `features/auth` | Login, registration, MFA, voice enrollment onboarding, password reset. |
| `features/dashboard` | Aggregated security overview: trust scores, active threats, recent alerts, session status. |
| `features/voice` | Voice sample recording, enrollment progress, speaker verification status. |
| `features/behavior` | Behavioral profile visualization, typing pattern graphs, anomaly timeline. |
| `features/incidents` | Incident list, detail view, timeline, response actions, forensic evidence. |
| `features/reports` | Report generation UI, PDF export, date range filters, compliance templates. |
| `features/alerts` | Alert feed, severity filtering, acknowledgement, escalation, real-time updates. |
| `features/admin` | User management, role assignment, system configuration, model status. |
| `features/settings` | Personal preferences, security settings, notification preferences, API keys. |
| `features/trust` | Trust score gauge, historical trend, contributing factor breakdown, SHAP visualization. |
| `hooks/` | Encapsulated stateful logic: `useAuth`, `useSocket`, `useTrustScore`, `useBehavior`. |
| `contexts/` | Global state providers: authentication state, socket connection, theme preferences. |
| `services/` | Axios-based API clients with interceptors for JWT refresh and error normalization. |
| `utils/behaviorCollector` | Passive capture of keystroke dynamics, mouse movement, scroll patterns, focus events. |

### 2.2 Backend Modules

| Module | Responsibility |
|---|---|
| `api/auth_bp` | User registration, login, logout, token refresh, password reset endpoints. |
| `api/voice_bp` | Voice sample upload, enrollment, verification trigger, profile management endpoints. |
| `api/behavior_bp` | Behavioral data ingestion, profile query, anomaly history endpoints. |
| `api/trust_bp` | Trust score query, decision history, override (admin) endpoints. |
| `api/incident_bp` | Incident CRUD, status transitions, assignment, evidence attachment endpoints. |
| `api/notification_bp` | Notification list, mark-read, preferences, push subscription endpoints. |
| `api/report_bp` | Report generation, template selection, export (PDF/CSV), scheduled reports. |
| `api/dashboard_bp` | Aggregated metrics, widget data, time-series queries for dashboard rendering. |
| `api/admin_bp` | User management, role management, system health, model status, feature flags. |
| `api/settings_bp` | System-wide and per-user settings CRUD. |
| `api/health_bp` | Liveness probe, readiness probe, dependency health checks. |

### 2.3 Service Layer Modules

| Service | Responsibility |
|---|---|
| `auth_service` | Credential validation, token lifecycle, session creation, MFA orchestration. |
| `voice_service` | Orchestrates voice enrollment, triggers speaker verification via ML layer, manages voice profiles. |
| `behavior_service` | Ingests behavioral events, builds feature vectors, triggers anomaly detection. |
| `deepfake_service` | Orchestrates deepfake detection pipeline, interprets model results, raises alerts. |
| `trust_engine` | **Core module.** Aggregates signals from voice, behavior, deepfake, and context modules. Computes the Dynamic Trust Score. Makes session continuation/restriction/termination decisions. |
| `risk_engine` | Contextual risk assessment: IP geolocation, device fingerprint, login patterns, impossible travel. |
| `threat_intel_service` | IP reputation checks, known-threat correlation, threat feed integration point. |
| `incident_service` | Creates and manages security incidents, assigns severity, tracks resolution workflow. |
| `notification_service` | Multi-channel notification dispatch: in-app, email (future), WebSocket push. |
| `report_service` | Generates structured incident reports, compliance summaries, audit exports. |
| `audit_service` | Records all security-relevant events with immutable audit trail. |
| `explain_service` | Generates human-readable explanations for trust decisions using SHAP values. |
| `admin_service` | Administrative operations: user CRUD, role management, system configuration. |

### 2.4 ML Modules

| Module | Responsibility |
|---|---|
| `voice/speaker_verifier` | Wraps Resemblyzer/SpeechBrain. Generates speaker embeddings, computes cosine similarity, returns verification confidence. |
| `voice/feature_extractor` | Extracts MFCCs, mel-spectrograms, chroma features from audio using Librosa. |
| `voice/voice_preprocessor` | Audio normalization, noise reduction, silence trimming, sample rate conversion. |
| `deepfake/deepfake_detector` | Wraps pre-trained deepfake detection model. Classifies audio as genuine or synthetic. |
| `deepfake/audio_analyzer` | Detects spectral artifacts, unnatural formant patterns, and synthesis signatures. |
| `behavior/anomaly_detector` | Isolation Forest model for detecting behavioral drift from established baseline. |
| `behavior/feature_builder` | Engineers features from raw behavioral events: typing speed, dwell time, flight time, mouse velocity, click patterns. |
| `behavior/profile_builder` | Builds and updates per-user behavioral baselines over time. |
| `explainability/shap_explainer` | Computes SHAP values for trust score decisions, identifying top contributing factors. |

### 2.5 Infrastructure Modules

| Module | Responsibility |
|---|---|
| `middleware/auth_middleware` | Extracts and validates JWT from request headers, injects user context. |
| `middleware/trust_gate` | Enforces minimum trust score requirements for sensitive endpoints. |
| `middleware/rate_limiter` | Token-bucket rate limiting per user/IP. |
| `middleware/request_logger` | Logs request metadata with correlation IDs for tracing. |
| `middleware/error_handler` | Catches unhandled exceptions, formats standardized error responses. |
| `repositories/*` | Encapsulate all MongoDB queries behind clean interfaces. Enable unit testing via mocking. |
| `socket/*` | WebSocket event handlers for real-time communication channels. |
| `config/*` | Environment-specific configuration with validation and defaults. |
