# EchoGuard AI - Backend Architecture

## 1. Executive Summary & Design Principles

The EchoGuard AI backend is designed as an enterprise-grade, high-performance, and secure service. It operates primarily on **Python 3.11+, Flask, MongoDB (via MongoEngine), and WebSockets**.

### Core Architecture Styles:
- **Clean Architecture:** Separation of concerns using routing (Controllers/Blueprints), Business Logic (Services), and Data Access (Repositories).
- **Service Layer Pattern:** Controllers contain zero business logic. They only handle HTTP request parsing, input validation, and calling the appropriate Service layer function.
- **Repository Pattern:** Abstraction over MongoEngine to prevent database leakage into the business logic.
- **SOLID Principles:** Modules must have a single responsibility. Large files (God classes) are strictly forbidden.
- **Dependency Injection:** Loosely coupled services to improve testability.

---

## 2. Professional Folder Structure

```text
backend/
├── app.py                      # Application entry point & Factory Runner
├── config/                     # Configuration management by environment
│   ├── __init__.py
│   ├── base.py                 # Common settings
│   ├── development.py
│   ├── production.py
│   └── testing.py
├── api/                        # Flask Blueprints / Route definitions (Controllers)
│   ├── __init__.py
│   ├── v1/
│   │   ├── auth_routes.py
│   │   ├── user_routes.py
│   │   ├── voice_routes.py
│   │   ├── behavior_routes.py
│   │   ├── deepfake_routes.py
│   │   └── dashboard_routes.py
├── controllers/                # Request validation and orchestration, calls Services
│   ├── auth_controller.py
│   └── ...
├── services/                   # Pure business logic (The core of the application)
│   ├── auth_service.py
│   ├── trust_engine_service.py
│   ├── deepfake_service.py
│   └── ...
├── repositories/               # Data access abstraction (MongoEngine queries)
│   ├── user_repository.py
│   ├── trust_score_repository.py
│   └── ...
├── models/                     # MongoEngine Document schemas
│   ├── user.py
│   ├── role.py
│   ├── trust_score.py
│   └── ...
├── middleware/                 # Intercept requests/responses
│   ├── jwt_middleware.py
│   ├── rbac_middleware.py
│   └── rate_limiter.py
├── security/                   # Core security utilities
│   ├── hashing.py
│   ├── token_manager.py
│   └── sanitization.py
├── socket/                     # Socket.IO handlers and namespaces
│   ├── __init__.py
│   ├── events.py
│   └── emitters.py
├── events/                     # Internal Event-Driven architecture (Pub/Sub)
│   ├── event_bus.py
│   └── listeners/
├── utils/                      # Helper functions
│   ├── responses.py
│   └── helpers.py
├── validators/                 # Request payload validation (Marshmallow/Pydantic)
│   ├── auth_schemas.py
│   └── ...
├── exceptions/                 # Custom error handling
│   ├── error_handlers.py
│   └── custom_exceptions.py
├── logs/                       # Logging configuration & output
│   └── logger.py
├── database/                   # Initializers & Migrations/Seeders
│   └── connection.py
├── tests/                      # Pytest suite
│   ├── unit/
│   ├── integration/
│   └── security/
├── wsgi.py                     # Gunicorn entry point
├── Dockerfile                  # Containerization
├── requirements.txt            # Dependencies
└── .env                        # Environment Secrets (Not in VCS)
```

---

## 3. Database Schema Design (MongoDB)

All schemas use MongoEngine with strict validation, default timestamps, and appropriate indexing to support fast dashboard queries.

### 1. `users`
**Purpose:** Stores identity and core profile parameters.
- **Fields:** `id`, `email`, `password_hash`, `first_name`, `last_name`, `role_id` (Ref), `is_active`, `mfa_enabled`, `last_login`, `created_at`, `updated_at`.
- **Indexes:** Unique `email`.
- **Relationships:** Belongs to one `role`.

### 2. `roles` & 3. `permissions`
**Purpose:** Granular RBAC (Admin, Security Analyst, Viewer).
- **Fields (Roles):** `name` (e.g., ADMIN), `description`, `permissions` (List of Refs).
- **Fields (Permissions):** `action` (e.g., READ_ALERTS), `resource`.
- **Indexes:** Unique `name`.

### 4. `voice_profiles`
**Purpose:** Maintains immutable acoustic features for a user.
- **Fields:** `user_id`, `embedding_vector`, `sample_count`, `last_enrolled_at`, `quality_score`.

### 5. `behavior_profiles`
**Purpose:** Tracks baseline metadata (typing rhythm, mouse biometrics).
- **Fields:** `user_id`, `baseline_metrics` (Dict), `confidence_level`.

### 6. `sessions`
**Purpose:** Secures active login sessions and handles token revocation.
- **Fields:** `session_id`, `user_id`, `ip_address`, `user_agent`, `device_fingerprint`, `is_revoked`, `expires_at`.
- **Indexes:** TTL index on `expires_at`.

### 7. `trust_scores`
**Purpose:** Real-time continuous authentication score.
- **Fields:** `user_id`, `current_score` (0-100), `risk_level` (LOW, MEDIUM, HIGH, CRITICAL), `last_evaluation_reason`, `updated_at`.
- **Indexes:** Scaled index on `user_id`.

### 8. `deepfake_results`, 9. `voice_results`, 10. `behavior_results`
**Purpose:** Event logs for individual AI modality checks.
- **Fields:** `session_id`, `user_id`, `confidence_score`, `analysis_metadata` (Dict), `flagged`, `timestamp`.

### 11. `alerts` & 12. `incident_reports`
**Purpose:** Threat tracking for the security dashboard.
- **Fields (Alerts):** `title`, `severity`, `user_id`, `session_id`, `status` (OPEN, INVESTIGATING, RESOLVED), `details`, `created_at`.
- **Indexes:** `severity`, `status`, `created_at` (desc).

### 13. `audit_logs` & 14. `system_logs`
**Purpose:** Immutable ledger of actions for enterprise compliance.
- **Fields:** `actor_id`, `action`, `resource`, `ip_address`, `timestamp`.

---

## 4. API Architecture (RESTful)

APIs are routed through blueprints grouped by entity. Controllers only perform DTO validation.

**Authentication & Sessions:**
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login` - Computes JWTs.
- `POST /api/v1/auth/logout` - Revokes session.
- `POST /api/v1/auth/refresh` - Issues new access token using non-expired refresh token.

**Modality & AI Integrations:**
- `POST /api/v1/voice/enroll` / `POST /api/v1/voice/verify`
- `POST /api/v1/behavior/start` / `POST /api/v1/behavior/analyze`
- `POST /api/v1/deepfake/upload` / `POST /api/v1/deepfake/live`

**Continuous Trust Engine:**
- `GET /api/v1/trust/score` (Current User Context)
- `GET /api/v1/trust/history`

**Security Operations (SecOps):**
- `GET /api/v1/alerts` (Filters: severity, status)
- `GET /api/v1/incidents`
- `GET /api/v1/reports`, `POST /api/v1/reports/export/{pdf|csv}`
- `GET /api/v1/dashboard/metrics`

---

## 5. Security & Authentication Strategy

- **Password Hashing:** `bcrypt` using strong salt rounds (e.g., 12 minimum).
- **Tokens:** Short-lived access tokens (15m), Long-lived HttpOnly secure refresh tokens (7d).
- **Session Layer:** All JWTs map to an active document in `sessions`. Terminating a session revokes the JWT before its expiration.
- **Protection:**
    - Explicit CORS origins (No `*`).
    - Mongo Injection Protection (Using MongoEngine parameterized querying naturally against injection).
    - Rate Limiting via `Flask-Limiter` + Redis.
    - CSRF Protection via Header Checks & Double Submit Cookies.

---

## 6. Socket.IO Real-Time Architecture

The backend streams events instantly to the client and dashboard administrators via `Flask-SocketIO`.

**Namespaces:** `/user` (Personal monitoring), `/secops` (Admin dashboard streaming).

**Key Emission Events:**
- `trust_score_updated` (Fired continuously as behavior validates).
- `deepfake_detected` (Critical alert emission).
- `session_blocked` (Forces client logout).
- `alert_created` / `notification_received`.

---

## 7. Middleware Interceptors

1. **JWT Validation:** Ensures `Authorization: Bearer <token>` exists, is signed correctly, and is not explicitly revoked in the DB.
2. **RBAC Authorization:** `require_role('Admin')` decorator ensuring the user's role matches API requirements.
3. **Trust Score Validation:** Middleware on sensitive routes (e.g., changing password) dynamically checking if `Trust Score > 80`. If lower, drops the request with a step-up auth requirement.
4. **Exception Handling:** Global `@app.errorhandler` capturing all unexpected system crashes, logging securely, and returning standard formatted JSON avoiding stack-trace leakage.
5. **Rate Limiting:** Prevents brute force on `/login` and API endpoints.

---

## 8. Enterprise Error Handling & Standard Responses

No Flask stack traces. The system returns standard JSON models.

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Retrieval successful",
  "meta": { "req_id": "req-1234..." }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_FAILED",
    "message": "Invalid credentials provided.",
    "details": [] 
  },
  "meta": { "req_id": "req-1234..." }
}
```
HTTP Status Codes: 200, 201 (Created), 400 (Validation), 401 (Auth Error), 403 (Permission), 404 (Not Found), 429 (Rate Limit), 500 (Internal).

---

## 9. Core Business Workflows

**1. Login Flow:**
User sends credentials -> Controller validates format -> AuthService fetches UserRepo -> verifies Bcrypt hash -> checks `security/` limits -> clears old sessions -> writes to SessionRepo -> issues Access/Refresh JWT -> Logs to AuditRepo -> Returns tokens.

**2. Voice Verification Flow:**
Client sends audio blob -> Controller limits size -> VoiceService extracts features (mock) -> Repository fetches VoiceProfile -> Service computes similarity -> Service updates TrustScoreRepo -> `trust_score_updated` event emitted via SocketIO -> Alert generated if similarity is poor.

**3. Session Blocking Flow (Zero Trust):**
Trust Score drops below 30 -> TrustEngineService flags session -> Updates SessionDb `is_revoked: True` -> Emits `session_blocked` Socket event -> Client immediately redirected to login -> SecOps Alert generated.

---

## 10. Logging Strategy

Logging strictly separated by handlers (File, Console, ELK ready):
1. **Security Logs:** Failed logins, CSRF attempts, Rate limit hits (Stored in `/logs/security.log`).
2. **Audit Logs:** All admin actions (Stored in DB `audit_logs`).
3. **Application Logs:** System errors, Bootup, Reconnections (`/logs/system.log`).
*No PII or Passwords will ever be logged. Scrubbing filters applied beforehand.*

---

## 11. Testing & Code Quality Strategy

1. **Unit Tests (PyTest):** Targeting Business Logic (Services) heavily using mock Repositories to simulate DB.
2. **Integration Tests:** Verifying API route -> Controller -> DB round trip (using `mongomock`).
3. **Security Testing:** Pytest scenarios purposely injecting invalid tokens, bad roles, and expired sessions to assert 401/403 blocks.
4. **CI/CD Quality:** Flake8, Black, Bandit (to scan for security flaws in python), and test coverage minimums (90%+).

---

## 12. Development Roadmap (Backend)

* **Phase 1 (Foundation):** Setup Flask Factory, MongoEngine schemas, Configs, Repo Pattern base classes.
* **Phase 2 (Auth Security):** Complete JWT lifecycle, RBAC middleware, Login/Logout, and Session DB tracking.
* **Phase 3 (Core APIs & WebSockets):** User CRUD, Trust Engine API, Socket.IO namespaces, basic real-time emission.
* **Phase 4 (AI Modality Hooks):** Construct Voice, Behavior, and Deepfake service stubs simulating the integration of AI models.
* **Phase 5 (Reporting & Monitoring):** SecOps endpoints, Alert lifecycle, PDF/CSV generation, rate-limiter, production Gunicorn deployment setup.
