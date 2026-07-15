import time
import numpy as np
from sklearn.ensemble import IsolationForest

class BehaviorAnomalyDetector:
    def __init__(self):
        # We will use an Isolation Forest
        self.model = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
        # Seed with initial "normal" baseline data
        self.baseline_data = [
            [300, 100, 150, 200, 50, 10],   # typical user
            [350, 110, 140, 250, 60, 12],
            [250, 90, 160, 180, 40, 8],
            [280, 95, 145, 190, 45, 9],
            [320, 120, 130, 220, 55, 15]
        ]
        self.model.fit(self.baseline_data)
        
    def analyze(self, features):
        """
        features is a dict:
        {
            "typing_speed": float,
            "dwell_time": float,
            "flight_time": float,
            "mouse_velocity": float,
            "mouse_acceleration": float,
            "click_frequency": float
        }
        """
        # Feature vector
        vector = [
            features.get("typing_speed", 0.0),
            features.get("dwell_time", 0.0),
            features.get("flight_time", 0.0),
            features.get("mouse_velocity", 0.0),
            features.get("mouse_acceleration", 0.0),
            features.get("click_frequency", 0.0)
        ]
        
        # We dynamically append to baseline to allow the model to adapt loosely
        self.baseline_data.append(vector)
        if len(self.baseline_data) > 200:
            self.baseline_data.pop(0)
            
        # Re-fit every 10 samples (simple online-ish learning)
        if len(self.baseline_data) % 10 == 0:
            self.model.fit(self.baseline_data)
        
        X = np.array(vector).reshape(1, -1)
        
        # decision_function returns raw anomaly score
        # The lower, the more abnormal.
        score = float(self.model.decision_function(X)[0])
        
        # Convert -0.5..0.5 to 0..100
        # typical score range is mostly around -0.2 to 0.2
        mapped_score = min(100, max(0, int((score + 0.3) * 200)))
        
        risk = "low"
        if mapped_score < 40:
            risk = "critical"
        elif mapped_score < 70:
            risk = "elevated"
            
        reason = "Normal behavioral biometrics detected."
        if risk != "low":
            # Determine which feature is most anomalous by comparing deviations from mean
            means = np.mean(self.baseline_data, axis=0)
            stds = np.std(self.baseline_data, axis=0) + 1e-5
            z_scores = np.abs((vector - means) / stds)
            max_idx = np.argmax(z_scores)
            
            feauture_names = [
                "Typing speed", "Dwell time", "Flight time", 
                "Mouse velocity", "Mouse acceleration", "Click frequency"
            ]
            
            reason = f"{feauture_names[max_idx]} deviated significantly from your established baseline (Z-Score: {z_scores[max_idx]:.2f})."
            
        return {
            "behavior_score": mapped_score,
            "risk_level": risk,
            "reason": reason,
            "raw_score": score
        }

detector = BehaviorAnomalyDetector()

def process_behavior(data: dict):
    return detector.analyze(data)
