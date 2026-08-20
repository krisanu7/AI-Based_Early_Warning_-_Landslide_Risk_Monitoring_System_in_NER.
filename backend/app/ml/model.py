import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from app.ml.synthetic_data import generate_synthetic_dataset

MODEL_PATH = os.path.join(os.path.dirname(__file__), "outbreak_rf_model.pkl")

class OutbreakRiskEngine:
    def __init__(self):
        self.regressor: RandomForestRegressor = None
        self.classifier: RandomForestClassifier = None
        self.feature_names = [
            "cases", "case_growth", "rainfall_mm", "flood_status_code",
            "turbidity_ntu", "coliform_presence", "sanitation_code", "population"
        ]
        self._ensure_trained()

    def _encode_flood(self, flood_status: str) -> float:
        mapping = {"Normal": 0.0, "Waterlogging": 1.0, "Severe Flood": 2.0}
        return mapping.get(flood_status, 0.0)

    def _encode_sanitation(self, sanitation: str) -> float:
        # Lower score = worse sanitation
        mapping = {"Poor Sanitation": 0.0, "Pit Latrine": 1.0, "Open Defecation Free": 2.0}
        return mapping.get(sanitation, 1.0)

    def _train(self):
        print("Training Random Forest Outbreak Risk Model on Northeast India dataset...")
        df = generate_synthetic_dataset(num_samples=1500)
        
        X = pd.DataFrame()
        X["cases"] = df["cases"]
        X["case_growth"] = df["case_growth"]
        X["rainfall_mm"] = df["rainfall_mm"]
        X["flood_status_code"] = df["flood_status"].apply(self._encode_flood)
        X["turbidity_ntu"] = df["turbidity_ntu"]
        X["coliform_presence"] = df["coliform_presence"]
        X["sanitation_code"] = df["sanitation_status"].apply(self._encode_sanitation)
        X["population"] = df["population"]
        
        y_score = df["risk_score"]
        y_level = df["risk_level"]
        
        self.regressor = RandomForestRegressor(n_estimators=100, random_state=42, max_depth=8)
        self.regressor.fit(X, y_score)
        
        self.classifier = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=8)
        self.classifier.fit(X, y_level)
        
        # Save model package
        try:
            joblib.dump({"regressor": self.regressor, "classifier": self.classifier}, MODEL_PATH)
            print("Random Forest Model successfully trained and saved.")
        except Exception as e:
            print(f"Model persist notice: {e}")

    def _ensure_trained(self):
        if os.path.exists(MODEL_PATH):
            try:
                data = joblib.load(MODEL_PATH)
                self.regressor = data["regressor"]
                self.classifier = data["classifier"]
                return
            except Exception:
                pass
        self._train()

    def predict_risk(
        self,
        cases_current: int,
        cases_previous: int,
        rainfall_mm: float,
        flood_status: str,
        water_quality: str,
        turbidity_ntu: float,
        sanitation_status: str,
        population: int = 2500,
        symptoms: List[str] = None
    ) -> Dict[str, Any]:
        symptoms = symptoms or []
        case_growth = (cases_current - cases_previous) / max(cases_previous, 1)
        coliform = 1 if "Contaminated" in water_quality or turbidity_ntu > 12.0 else 0
        
        flood_code = self._encode_flood(flood_status)
        sanitation_code = self._encode_sanitation(sanitation_status)
        
        features = np.array([[
            cases_current,
            case_growth,
            rainfall_mm,
            flood_code,
            turbidity_ntu,
            coliform,
            sanitation_code,
            population
        ]])
        
        pred_score = int(np.clip(self.regressor.predict(features)[0], 5, 99))
        
        # Risk level determination based on standard government health thresholds
        if pred_score <= 30:
            risk_level = "LOW"
        elif pred_score <= 60:
            risk_level = "MEDIUM"
        elif pred_score <= 80:
            risk_level = "HIGH"
        else:
            risk_level = "VERY HIGH"
            
        # Determine human-interpretable contributing factors
        factors = []
        if case_growth > 0.5:
            factors.append(f"Rapid 48h case growth (+{int(case_growth * 100)}%)")
        elif cases_current > 10:
            factors.append(f"Elevated community case load ({cases_current} active cases)")
            
        if rainfall_mm > 60:
            factors.append(f"Heavy precipitation ({rainfall_mm:.1f} mm/24h)")
            
        if flood_status in ["Severe Flood", "Waterlogging"]:
            factors.append(f"Active inundation / {flood_status}")
            
        if turbidity_ntu > 10.0 or coliform:
            factors.append(f"High water turbidity ({turbidity_ntu:.1f} NTU) & presumptive bacterial contamination")
            
        if sanitation_status == "Poor Sanitation":
            factors.append("Vulnerable village sanitation / surface runoff risk")
            
        if any("Watery Diarrhea" in s or "Dehydration" in s for s in symptoms):
            factors.append("Syndromic cluster: Acute dehydration & watery diarrhea profile")
            
        if not factors:
            factors.append("Baseline environmental and community health parameters normal")
            
        # Action recommendation for public health authorities
        if risk_level in ["HIGH", "VERY HIGH"]:
            action = "Dispatch Rapid Response Medical Team (RRT), initiate emergency well chlorination, and activate targeted field investigation."
        elif risk_level == "MEDIUM":
            action = "Increase ASHA house-to-house syndromic surveillance, distribute chlorine tablets/ORS packets, test village drinking sources."
        else:
            action = "Routine weekly environmental surveillance and safe drinking water awareness."
            
        return {
            "risk_score": pred_score,
            "risk_level": risk_level,
            "contributing_factors": factors,
            "case_growth_rate": round(case_growth, 2),
            "recommended_action": action,
            "disclaimer": "AI provides outbreak-risk signals for authorized investigation. It does not provide medical diagnosis or medicine prescriptions."
        }

# Global singleton
ml_engine = OutbreakRiskEngine()
