from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from app.database import get_collection
from app.auth import get_required_user
from app.models.schemas import WaterObservationCreate, EnvironmentalDataCreate, UserRole
from app.ml.model import ml_engine
from datetime import datetime

router = APIRouter(prefix="/water", tags=["Water & Environmental Surveillance"])

@router.post("/observation")
async def log_water_observation(obs: WaterObservationCreate, user: dict = Depends(get_required_user)):
    if user.get("role") == UserRole.PUBLIC:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")
        
    water_col = get_collection("water_observations")
    locations_col = get_collection("locations")
    
    doc = obs.dict()
    doc["submitted_by"] = user.get("name")
    doc["submitted_by_role"] = user.get("role")
    doc["created_at"] = datetime.utcnow().isoformat()
    
    # Assess water safety label
    is_contaminated = obs.coliform_presence or obs.turbidity_ntu > 15.0 or obs.is_flood_affected
    doc["water_quality_rating"] = "Highly Contaminated" if (obs.coliform_presence and obs.turbidity_ntu > 15.0) else ("Moderately Contaminated" if is_contaminated else "Clean")
    
    res = await water_col.insert_one(doc)
    
    # Update location environmental snapshot
    loc = await locations_col.find_one({"village": obs.village, "district": obs.district})
    if loc:
        cases_cur = loc.get("active_cases", 2)
        prev_cases = loc.get("previous_7day_cases", 2)
        flood_status = "Waterlogging" if obs.is_flood_affected else loc.get("flood_status", "Normal")
        
        pred = ml_engine.predict_risk(
            cases_current=cases_cur,
            cases_previous=prev_cases,
            rainfall_mm=loc.get("rainfall_mm", 30.0),
            flood_status=flood_status,
            water_quality=doc["water_quality_rating"],
            turbidity_ntu=obs.turbidity_ntu,
            sanitation_status=loc.get("sanitation_status", "Pit Latrine"),
            population=loc.get("population", 2500)
        )
        
        await locations_col.update_one(
            {"village": obs.village, "district": obs.district},
            {"$set": {
                "turbidity_ntu": obs.turbidity_ntu,
                "water_quality": doc["water_quality_rating"],
                "flood_status": flood_status,
                "risk_score": pred["risk_score"],
                "risk_level": pred["risk_level"],
                "contributing_factors": pred["contributing_factors"],
                "last_updated": datetime.utcnow().isoformat()
            }}
        )
        
    return {
        "id": res.inserted_id,
        "water_quality_rating": doc["water_quality_rating"],
        "message": "Water observation recorded and location risk updated."
    }

@router.get("/observations")
async def list_water_observations(village: Optional[str] = None, district: Optional[str] = None, limit: int = 50):
    water_col = get_collection("water_observations")
    query = {}
    if village: query["village"] = village
    if district: query["district"] = district
    return await water_col.find(query, sort=[("created_at", -1)], limit=limit)
