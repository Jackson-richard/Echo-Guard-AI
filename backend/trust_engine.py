import datetime

class TrustEngine:
    def __init__(self, db):
        self.db = db

    def evaluate_behavior(self, user_id, current_telemetry):
        # Retrieve baseline from DB
        baseline = self.db.user_baselines.find_one({"user_id": user_id})
        
        # If no baseline, we are in Learning Mode
        if not baseline or baseline.get("session_count", 0) < 5:
            self._update_learning_baseline(user_id, current_telemetry, baseline)
            # Cannot enforce yet, assume neutral behavior
            return {"risk_modifier": 0, "status": "learning"}

        # Enforced mode - Compare current telemetry to baseline
        # (Mocking PCA delta evaluation for the ideathon)
        deviation = self._calculate_deviation(baseline, current_telemetry)
        
        if deviation < 20: 
            modifier = 0  # Match
        elif deviation < 50:
            modifier = -10 # Slight deviation
        elif deviation < 80:
            modifier = -30 # High deviation
        else:
            modifier = -50 # Alien behavior

        return {"risk_modifier": modifier, "status": "enforced", "deviation": deviation}

    def _update_learning_baseline(self, user_id, telemetry, baseline):
        if not baseline:
            self.db.user_baselines.insert_one({
                "user_id": user_id,
                "session_count": 1,
                "features": [telemetry]
            })
        else:
            self.db.user_baselines.update_one(
                {"user_id": user_id},
                {
                    "$inc": {"session_count": 1},
                    "$push": {"features": telemetry}
                }
            )

    def _calculate_deviation(self, baseline, current_telemetry):
        # Mock deviation calculation
        # In reality, this would use Isolation Forest or PCA clustering
        return 25 # mock slight deviation

    def check_action_risk(self, user_id, action_type):
        session = self.db.active_sessions.find_one({"user_id": user_id})
        current_trust = session.get("trust_score", 100) if session else 100
        
        # Action thresholds
        thresholds = {
            "view_dashboard": 50,
            "download_confidential": 75,
            "admin_privilege": 90,
            "wire_transfer": 90
        }
        
        required_trust = thresholds.get(action_type, 80)
        
        if current_trust < required_trust:
            return {"allow": False, "requires_challenge": True, "current_trust": current_trust, "required": required_trust}
        return {"allow": True, "requires_challenge": False, "current_trust": current_trust}

