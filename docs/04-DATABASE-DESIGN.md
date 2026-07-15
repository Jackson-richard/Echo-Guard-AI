# EchoGuard AI — Database Design

> **Version:** 1.0.0  
> **Database:** MongoDB 7.x  
> **ODM:** MongoEngine  

---

## 1. Collection Overview

| Collection | Purpose | Estimated Growth | Retention |
|---|---|---|---|
| `users` | User accounts and profiles | Low (enterprise scale) | Permanent |
| `voice_profiles` | Speaker embeddings and enrollment data | Low | Permanent |
| `behavior_profiles` | User behavioral baselines | Low | Updated continuously |
| `sessions` | Active and historical sessions | High | 90 days (TTL) |
| `alerts` | Security alerts and threat events | High | 1 year |
| `risk_scores` | Historical trust/risk score snapshots | Very High | 30 days (TTL) |
| `incident_reports` | Security incident records | Medium | Permanent |
| `notifications` | User notification queue | High | 30 days (TTL) |
| `audit_logs` | Immutable audit trail | Very High | 1 year |
| `system_logs` | Application operational logs | Very High | 7 days (TTL) |
| `settings` | System and user configuration | Low | Permanent |

---

## 2. Collection Schemas

### 2.1 `users`

```json
{
  "_id": "ObjectId",
  "employee_id": "string (unique, indexed)",
  "email": "string (unique, indexed)",
  "username": "string (unique, indexed)",
  "password_hash": "string",
  "first_name": "string",
  "last_name": "string",
  "role": "enum: super_admin | admin | analyst | user",
  "department": "string",
  "organization": "string",
  "is_active": "boolean (default: true)",
  "is_locked": "boolean (default: false)",
  "lock_reason": "string | null",
  "mfa_enabled": "boolean (default: false)",
  "mfa_secret": "string | null",
  "voice_enrolled": "boolean (default: false)",
  "behavior_enrolled": "boolean (default: false)",
  "profile_image_url": "string | null",
  "last_login_at": "datetime | null",
  "last_login_ip": "string | null",
  "failed_login_count": "integer (default: 0)",
  "preferences": {
    "theme": "enum: dark | light | system",
    "notification_email": "boolean",
    "notification_push": "boolean",
    "language": "string (default: en)"
  },
  "created_at": "datetime",
  "updated_at": "datetime"
}
```
**Indexes:** `email` (unique), `username` (unique), `employee_id` (unique), `organization + role` (compound), `is_active`

---

### 2.2 `voice_profiles`

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId (ref: users, indexed)",
  "embedding_vector": "binary (d-vector, 256-dim float array)",
  "enrollment_samples": [
    {
      "sample_id": "string (UUID)",
      "file_path": "string",
      "duration_seconds": "float",
      "quality_score": "float (0-1)",
      "recorded_at": "datetime"
    }
  ],
  "enrollment_status": "enum: pending | partial | complete | expired",
  "samples_required": "integer (default: 3)",
  "samples_collected": "integer",
  "model_version": "string",
  "verification_threshold": "float (default: 0.75)",
  "last_verified_at": "datetime | null",
  "last_verification_score": "float | null",
  "total_verifications": "integer (default: 0)",
  "avg_verification_score": "float | null",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```
**Indexes:** `user_id` (unique), `enrollment_status`, `updated_at`

---

### 2.3 `behavior_profiles`

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId (ref: users, indexed)",
  "profile_status": "enum: learning | active | stale",
  "baseline_features": {
    "keystroke": {
      "avg_dwell_time_ms": "float",
      "avg_flight_time_ms": "float",
      "typing_speed_wpm": "float",
      "error_rate": "float",
      "rhythm_signature": "[float] (pattern vector)"
    },
    "mouse": {
      "avg_velocity": "float",
      "avg_acceleration": "float",
      "click_frequency": "float",
      "movement_entropy": "float",
      "scroll_speed": "float"
    },
    "session": {
      "avg_session_duration_min": "float",
      "typical_active_hours": "[integer] (0-23)",
      "typical_page_transitions": "[string]",
      "avg_idle_time_sec": "float"
    }
  },
  "model_params": "binary (serialized Isolation Forest)",
  "training_samples_count": "integer",
  "last_training_at": "datetime | null",
  "anomaly_threshold": "float (default: -0.5)",
  "confidence_level": "float (0-1)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```
**Indexes:** `user_id` (unique), `profile_status`, `last_training_at`

---

### 2.4 `sessions`

```json
{
  "_id": "ObjectId",
  "session_token": "string (unique, indexed)",
  "user_id": "ObjectId (ref: users, indexed)",
  "status": "enum: active | restricted | re_auth_required | terminated | expired",
  "ip_address": "string",
  "user_agent": "string",
  "device_fingerprint": "string",
  "geo_location": {
    "country": "string",
    "city": "string",
    "latitude": "float",
    "longitude": "float"
  },
  "current_trust_score": "float (0-100)",
  "trust_level": "enum: high | medium | low | critical",
  "trust_history": [
    {
      "score": "float",
      "level": "string",
      "timestamp": "datetime",
      "trigger": "string"
    }
  ],
  "restrictions": ["string"],
  "termination_reason": "string | null",
  "started_at": "datetime",
  "last_activity_at": "datetime",
  "terminated_at": "datetime | null",
  "expires_at": "datetime (TTL index)"
}
```
**Indexes:** `session_token` (unique), `user_id + status` (compound), `expires_at` (TTL), `started_at`, `current_trust_score`

---

### 2.5 `alerts`

```json
{
  "_id": "ObjectId",
  "alert_id": "string (UUID, unique, indexed)",
  "user_id": "ObjectId (ref: users, indexed)",
  "session_id": "ObjectId (ref: sessions) | null",
  "alert_type": "enum: deepfake_detected | voice_mismatch | behavior_anomaly | session_hijack | impossible_travel | brute_force | trust_threshold | account_takeover",
  "severity": "enum: critical | high | medium | low | info",
  "title": "string",
  "description": "string",
  "details": {
    "confidence": "float (0-1)",
    "model_output": "object (raw model response)",
    "contributing_factors": ["string"],
    "shap_values": "object | null"
  },
  "status": "enum: new | acknowledged | investigating | resolved | false_positive",
  "assigned_to": "ObjectId (ref: users) | null",
  "resolution_notes": "string | null",
  "auto_action_taken": "enum: none | re_auth | restrict | terminate",
  "acknowledged_at": "datetime | null",
  "resolved_at": "datetime | null",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```
**Indexes:** `alert_id` (unique), `user_id`, `severity + status` (compound), `alert_type`, `created_at`, `status`

---

### 2.6 `risk_scores`

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId (ref: users, indexed)",
  "session_id": "ObjectId (ref: sessions, indexed)",
  "overall_score": "float (0-100)",
  "trust_level": "enum: high | medium | low | critical",
  "component_scores": {
    "voice_verification": { "score": "float", "weight": "float", "confidence": "float" },
    "deepfake_detection": { "score": "float", "weight": "float", "confidence": "float" },
    "behavior_analysis": { "score": "float", "weight": "float", "confidence": "float" },
    "contextual_risk": { "score": "float", "weight": "float", "confidence": "float" },
    "session_integrity": { "score": "float", "weight": "float", "confidence": "float" }
  },
  "decision": "enum: continue | challenge | restrict | terminate",
  "explanation": "string (human-readable AI explanation)",
  "shap_summary": {
    "top_positive_factors": [{ "factor": "string", "impact": "float" }],
    "top_negative_factors": [{ "factor": "string", "impact": "float" }]
  },
  "computed_at": "datetime",
  "expires_at": "datetime (TTL index)"
}
```
**Indexes:** `user_id + computed_at` (compound), `session_id`, `trust_level`, `expires_at` (TTL)

---

### 2.7 `incident_reports`

```json
{
  "_id": "ObjectId",
  "incident_id": "string (UUID, unique, indexed)",
  "title": "string",
  "description": "string",
  "severity": "enum: critical | high | medium | low",
  "status": "enum: open | investigating | contained | resolved | closed",
  "category": "enum: deepfake_attack | account_takeover | insider_threat | session_hijack | brute_force | anomalous_behavior | other",
  "affected_user_id": "ObjectId (ref: users)",
  "affected_session_ids": ["ObjectId (ref: sessions)"],
  "related_alert_ids": ["ObjectId (ref: alerts)"],
  "timeline": [
    {
      "timestamp": "datetime",
      "event": "string",
      "actor": "string",
      "details": "string"
    }
  ],
  "evidence": {
    "trust_scores": ["ObjectId (ref: risk_scores)"],
    "audio_samples": ["string (file paths)"],
    "behavior_snapshots": ["object"],
    "network_data": { "ip": "string", "geo": "object", "user_agent": "string" }
  },
  "response_actions": [
    {
      "action": "string",
      "performed_by": "string",
      "performed_at": "datetime",
      "result": "string"
    }
  ],
  "assigned_to": "ObjectId (ref: users) | null",
  "root_cause": "string | null",
  "lessons_learned": "string | null",
  "created_at": "datetime",
  "updated_at": "datetime",
  "closed_at": "datetime | null"
}
```
**Indexes:** `incident_id` (unique), `severity + status` (compound), `affected_user_id`, `category`, `created_at`

---

### 2.8 `notifications`

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId (ref: users, indexed)",
  "type": "enum: alert | incident | system | re_auth | info",
  "title": "string",
  "message": "string",
  "severity": "enum: critical | high | medium | low | info",
  "is_read": "boolean (default: false)",
  "action_url": "string | null",
  "metadata": "object | null",
  "created_at": "datetime",
  "expires_at": "datetime (TTL index)"
}
```
**Indexes:** `user_id + is_read` (compound), `created_at`, `expires_at` (TTL)

---

### 2.9 `audit_logs`

```json
{
  "_id": "ObjectId",
  "correlation_id": "string (UUID, indexed)",
  "user_id": "ObjectId (ref: users) | null",
  "session_id": "ObjectId (ref: sessions) | null",
  "action": "string (e.g., 'user.login', 'voice.verify', 'trust.evaluate')",
  "category": "enum: authentication | authorization | data_access | admin | security | system",
  "resource_type": "string",
  "resource_id": "string",
  "details": "object (action-specific payload)",
  "result": "enum: success | failure | error",
  "ip_address": "string",
  "user_agent": "string",
  "risk_level": "enum: none | low | medium | high",
  "created_at": "datetime"
}
```
**Indexes:** `correlation_id`, `user_id + created_at` (compound), `action`, `category`, `created_at`, `result`

> **Note:** Audit logs are append-only. No update or delete operations are permitted on this collection.

---

### 2.10 `system_logs`

```json
{
  "_id": "ObjectId",
  "level": "enum: DEBUG | INFO | WARNING | ERROR | CRITICAL",
  "module": "string",
  "message": "string",
  "stack_trace": "string | null",
  "correlation_id": "string | null",
  "metadata": "object | null",
  "created_at": "datetime",
  "expires_at": "datetime (TTL index, 7 days)"
}
```
**Indexes:** `level + module` (compound), `correlation_id`, `expires_at` (TTL), `created_at`

---

### 2.11 `settings`

```json
{
  "_id": "ObjectId",
  "scope": "enum: system | organization | user",
  "scope_id": "string | null (org ID or user ID)",
  "key": "string (indexed)",
  "value": "mixed",
  "value_type": "enum: string | integer | float | boolean | json",
  "description": "string",
  "is_sensitive": "boolean (default: false)",
  "updated_by": "ObjectId (ref: users)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```
**Indexes:** `scope + scope_id + key` (compound unique), `key`

---

## 3. Index Strategy

| Strategy | Purpose |
|---|---|
| **TTL Indexes** | Automatic expiry for sessions (90d), risk_scores (30d), notifications (30d), system_logs (7d). |
| **Compound Indexes** | Optimized for common query patterns (e.g., `user_id + status`, `severity + status`). |
| **Unique Indexes** | Enforce uniqueness on email, username, session_token, alert_id, incident_id. |
| **Sparse Indexes** | On nullable fields that are frequently queried when present (e.g., `assigned_to`). |
| **Text Indexes** | On `description` fields in alerts and incidents for full-text search. |

---

## 4. Data Relationships

```
users ──1:1──▶ voice_profiles
users ──1:1──▶ behavior_profiles
users ──1:N──▶ sessions
users ──1:N──▶ alerts
users ──1:N──▶ notifications
users ──1:N──▶ audit_logs
sessions ──1:N──▶ risk_scores
sessions ──1:N──▶ alerts
alerts ──N:1──▶ incident_reports
incident_reports ──N:N──▶ risk_scores (via evidence)
```

> **Design Decision:** MongoDB is a document database. Relationships are maintained via `ObjectId` references rather than JOINs. The repository layer handles reference resolution when needed. Embedded documents are used for frequently co-accessed data (e.g., `trust_history` in sessions, `enrollment_samples` in voice_profiles).
