from fastapi import APIRouter
from app.ml.model import landslide_ml_engine
from app.schemas import LandslidePredictRequest, LandslidePredictResponse
from app.database import get_landslide_risk_col
from datetime import datetime

router = APIRouter(prefix="/predictions", tags=["AI Landslide Predictions"])

@router.post("", response_model=LandslidePredictResponse)
async def predict_landslide(payload: LandslidePredictRequest):
    result = landslide_ml_engine.predict_landslide(
        Rainfall_mm=payload.Rainfall_mm,
        Slope_Angle=payload.Slope_Angle,
        Soil_Saturation=payload.Soil_Saturation,
        Vegetation_Cover=payload.Vegetation_Cover,
        Earthquake_Activity=payload.Earthquake_Activity,
        Proximity_to_Water=payload.Proximity_to_Water,
        Soil_Type_Gravel=payload.Soil_Type_Gravel,
        Soil_Type_Sand=payload.Soil_Type_Sand,
        Soil_Type_Silt=payload.Soil_Type_Silt,
        Soil_Type=payload.Soil_Type
    )
    
    # Permanently store detection record in MongoDB (landslide_risk collection)
    try:
        risk_col = get_landslide_risk_col()
        mongo_doc = {
            "created_at": datetime.utcnow().isoformat(),
            "risk_score": result["risk_score"],
            "risk_level": result["risk_level"],
            "risk_level_code": result.get("risk_level_code", "MODERATE"),
            "model_confidence": result.get("model_confidence", 90.0),
            "active_triggers": result.get("active_triggers", []),
            "input_parameters": result.get("input_parameters", {}),
            "model_version": result.get("model_version", "landslide_model.pkl"),
            "detected_by": "Public User / Field Surveyor"
        }
        await risk_col.insert_one(mongo_doc)
    except Exception as e:
        print(f"[Warning] Failed to persist risk record to MongoDB: {e}")

    return LandslidePredictResponse(**result)

@router.get("/records")
async def list_stored_landslide_risk_records(limit: int = 50):
    try:
        risk_col = get_landslide_risk_col()
        records = await risk_col.find()
        records.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return records[:limit]
    except Exception as e:
        print(f"Error fetching landslide_risk records: {e}")
        return []

@router.delete("/records")
async def clear_stored_landslide_risk_records():
    try:
        risk_col = get_landslide_risk_col()
        await risk_col.delete_many({})
        return {"status": "SUCCESS", "message": "Cleared all landslide risk records from MongoDB"}
    except Exception as e:
        print(f"Error clearing landslide_risk records: {e}")
        return {"status": "ERROR", "message": str(e)}


@router.get("/metrics")
async def get_model_evaluation_metrics():
    return {
        "model_version": landslide_ml_engine.model_version,
        "algorithm": "RandomForestClassifier Pipeline (landslide_model.pkl)",
        "total_training_samples": landslide_ml_engine.total_training_samples,
        "last_trained": landslide_ml_engine.last_training_time,
        "metrics": landslide_ml_engine.metrics,
        "feature_importances": landslide_ml_engine.feature_importances_
    }


