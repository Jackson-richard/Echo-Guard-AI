# EchoGuard AI — Security Architecture

> **Version:** 1.0.0  
> **Classification:** Internal — Security Blueprint

---

## 1. Zero Trust Security Model

EchoGuard AI implements a **Zero Trust Architecture (ZTA)** based on the NIST SP 800-207 framework.

### Core Principles Applied

| Principle | Implementation |
|---|---|
| **Never Trust, Always Verify** | Every API request is authenticated via JWT. Every session is continuously evaluated via Trust Score. |
| **Least Privilege** | RBAC enforces minimum required permissions. Trust-gated endpoints restrict access based on dynamic score. |
| **Assume Breach** | Behavioral anomaly detection, deepfake detection, and contextual risk analysis continuously monitor for compromise. |
| **Micro-Segmentation** | API Blueprints isolate domain boundaries. Each module has independent authorization rules. |
| **Continuous Monitoring** | Trust Score recomputed on every significant user action. No implicit trust persists from initial login. |

---

## 2. Authentication Architecture

### 2.1 Multi-Layer Authentication Flow

```
Layer 1: CREDENTIAL AUTHENTICATION (Login)
  ├── Email + Password (bcrypt hashed)
  ├── Optional: MFA via TOTP
  └── Result: JWT Access + Refresh Token pair

Layer 2: VOICE BIOMETRIC ENROLLMENT (Onboarding)
  ├── 3x voice sample collection
  ├── Speaker embedding generation (Resemblyzer/SpeechBrain)
  └── Result: Voice profile stored for continuous verification

Layer 3: BEHAVIORAL BASELINE (Onboarding)
  ├── 7-day learning period
  ├── Keystroke dynamics + mouse patterns + session behavior
  └── Result: Behavioral profile (Isolation Forest model)

Layer 4: CONTINUOUS AUTHENTICATION (Active Session)
  ├── Periodic voice verification (configurable interval)
  ├── Real-time behavioral analysis
  ├── Deepfake detection on every voice sample
  ├── Contextual risk assessment (IP, device, location)
  └── Result: Dynamic Trust Score → Access Decision
```

### 2.2 JWT Token Strategy

| Token Type | Lifetime | Storage | Purpose |
|---|---|---|---|
| Access Token | 15 min | Memory (React state) | API authorization |
| Refresh Token | 7 days | HttpOnly Secure Cookie | Silent token rotation |

**Token Claims:**
```json
{
  "sub": "user_id",
  "role": "analyst",
  "org": "org_id",
  "session_id": "session_uuid",
  "trust_level": "high",
  "iat": 1720000000,
  "exp": 1720000900
}
```

### 2.3 Token Security
- **Rotation:** Refresh tokens are rotated on every use (one-time use).
- **Blocklist:** Revoked tokens stored in MongoDB with TTL expiry.
- **Fingerprinting:** Token bound to device fingerprint; mismatch triggers re-auth.

---

## 3. Authorization Model (RBAC)

| Role | Permissions |
|---|---|
| `super_admin` | Full system access. User/role management. System configuration. Model management. |
| `admin` | Organization management. Alert management. Incident management. Report generation. |
| `analyst` | View dashboards. Manage alerts. View incidents. Generate reports. |
| `user` | View own trust score. View own alerts. Update own settings. Voice enrollment. |

### Trust-Gated Access

Certain sensitive operations require both the correct role AND a minimum trust score:

| Operation | Min Trust Score | Role Required |
|---|---|---|
| View Dashboard | 30 | any |
| Export Reports | 60 | analyst+ |
| Manage Users | 70 | admin+ |
| System Configuration | 80 | super_admin |
| Override Trust Score | 90 | super_admin |

---

## 4. Data Security

### 4.1 Encryption

| Layer | Method |
|---|---|
| **Transport** | TLS 1.3 via NGINX (HTTPS + WSS) |
| **Password Storage** | bcrypt with work factor 12 |
| **Voice Embeddings** | AES-256 encryption at rest |
| **JWT Signing** | HMAC-SHA256 (HS256) |
| **Sensitive Settings** | AES-256 encryption in database |

### 4.2 Input Validation & Sanitization
- All API inputs validated via schema validation (request validators).
- SQL injection N/A (NoSQL), but NoSQL injection mitigated via MongoEngine parameterized queries.
- XSS prevention via React's default escaping + Content-Security-Policy headers.
- CSRF protection via SameSite cookies + custom headers.
- File upload validation: audio format whitelist (WAV, WebM, OGG), max 10MB, MIME type check.

### 4.3 Security Headers (NGINX)

```
Strict-Transport-Security: max-age=31536000; includeSubdomains
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: microphone=(self), camera=()
```

---

## 5. Threat Model

| Threat | Detection Method | Automated Response |
|---|---|---|
| **Deepfake Voice Attack** | Deepfake detection model on every voice sample | Alert (critical) → Session terminate |
| **Voice Impersonation** | Speaker verification score below threshold | Alert (high) → Re-authentication required |
| **Account Takeover** | Behavioral anomaly + contextual risk signals | Alert (critical) → Session restrict → Admin notify |
| **Session Hijacking** | Device fingerprint mismatch, IP change mid-session | Alert (high) → Session terminate |
| **Insider Threat** | Behavioral drift, unusual access patterns, off-hours activity | Alert (medium-high) → Trust score reduction |
| **Brute Force** | Failed login threshold (5 in 15 min) | Account lock (30 min) → Alert → Audit log |
| **Impossible Travel** | Geolocation jump exceeding physical travel speed | Alert (high) → Re-authentication required |
| **Token Theft** | Refresh token reuse detection | All user tokens revoked → Force re-login |

---

## 6. Audit & Compliance

### 6.1 Audit Trail Requirements
- **Immutability:** `audit_logs` collection is append-only. No application-level updates or deletes.
- **Completeness:** Every authentication, authorization, and data access event is logged.
- **Non-Repudiation:** Logs include user ID, IP, timestamp, and action details.
- **Retention:** 1 year minimum for audit logs.

### 6.2 Compliance Readiness

| Framework | Relevant Controls |
|---|---|
| **SOC 2** | Access control, monitoring, incident management, audit trails. |
| **GDPR** | Data minimization (retention TTLs), right to erasure (user data deletion pipeline). |
| **HIPAA** | Continuous auth, encryption at rest/transit, audit logs, access controls. |
| **NIST 800-63B** | Multi-factor biometric authentication, continuous auth, session management. |

---

## 7. Rate Limiting Strategy

| Endpoint Category | Rate Limit | Window |
|---|---|---|
| Login | 5 requests | 15 minutes |
| Token Refresh | 10 requests | 15 minutes |
| Voice Upload | 3 requests | 5 minutes |
| API (Authenticated) | 100 requests | 1 minute |
| API (Admin) | 200 requests | 1 minute |
| WebSocket Messages | 60 messages | 1 minute |
