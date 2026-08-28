from fastapi import APIRouter
from app.ml.model import landslide_ml_engine
from app.schemas import LandslidePredictRequest, LandslidePredictResponse

router = APIRouter(prefix="/predictions", tags=["AI Landslide Predictions"])

@router.post("", response_model=LandslidePredictResponse)
async def predict_landslide(payload: LandslidePredictRequest):
    result = landslide_ml_engine.predict_landslide(
        rainfall_1h=payload.rainfall_1h,
        rainfall_6h=payload.rainfall_6h,
        rainfall_24h=payload.rainfall_24h,
        rainfall_48h=payload.rainfall_48h,
        rainfall_72h=payload.rainfall_72h,
        slope_degrees=payload.slope_degrees,
        elevation_m=payload.elevation_m,
        soil_moisture_pct=payload.soil_moisture_pct,
        pore_water_pressure_kpa=payload.pore_water_pressure_kpa,
        distance_to_road_m=payload.distance_to_road_m,
        distance_to_river_m=payload.distance_to_river_m,
        historical_landslides_count=payload.historical_landslides_count,
        vegetation_ndvi=payload.vegetation_ndvi
    )
    return LandslidePredictResponse(**result)

@router.get("/metrics")
async def get_model_evaluation_metrics():
    return {
        "model_version": landslide_ml_engine.model_version,
        "algorithm": "RandomForestClassifier (n_estimators=100, max_depth=10)",
        "total_training_samples": landslide_ml_engine.total_training_samples,
        "last_trained": landslide_ml_engine.last_training_time,
        "metrics": landslide_ml_engine.metrics,
        "feature_importances": landslide_ml_engine.feature_importances_
    }
