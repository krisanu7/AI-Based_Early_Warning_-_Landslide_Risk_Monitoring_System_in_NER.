from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional, Dict, Any
from app.database import get_collection
from app.models.schemas import RiskPredictRequest, RiskPredictResponse
from app.ml.model import ml_engine
from app.ml.cluster_detector import cluster_engine
from datetime import datetime

router = APIRouter(prefix="", tags=["AI Risk & Interactive GIS Map"])

@router.post("/risk/predict", response_model=RiskPredictResponse)
async def predict_outbreak_risk(req: RiskPredictRequest):
    pred = ml_engine.predict_risk(
        cases_current=req.cases_current_period,
        cases_previous=req.cases_previous_period,
        rainfall_mm=req.rainfall_mm,
        flood_status=req.flood_status,
        water_quality=req.water_quality,
        turbidity_ntu=req.turbidity_ntu,
        sanitation_status=req.sanitation_status,
        population=req.population,
        symptoms=req.symptoms
    )
    return RiskPredictResponse(**pred)

@router.get("/map/risk")
async def get_live_map_data(
    state: Optional[str] = Query(None, description="Filter by Northeast State"),
    risk_level: Optional[str] = Query(None, description="Filter by Risk Level"),
    district: Optional[str] = Query(None, description="Filter by District")
):
    """
    Returns live geospatial risk nodes for Northeast India for rendering on Leaflet map.
    Live updates reflect case reports, environmental changes, and authority confirmations.
    """
    locations_col = get_collection("locations")
    alerts_col = get_collection("alerts")
    warnings_col = get_collection("public_warnings")
    
    query = {}
    if state and state != "ALL": query["state"] = state
    if district and district != "ALL": query["district"] = district
    if risk_level and risk_level != "ALL": query["risk_level"] = risk_level
    
    locations = await locations_col.find(query)
    alerts = await alerts_col.find({"status": {"$in": ["HIGH", "INVESTIGATION", "CONFIRMED"]}})
    confirmed_warnings = await warnings_col.find({"status": "ACTIVE"})
    
    # Calculate regional overview summary
    all_locs = await locations_col.find()
    total_villages = len(all_locs)
    high_risk_count = sum(1 for l in all_locs if l.get("risk_level") in ["HIGH", "VERY HIGH"])
    med_risk_count = sum(1 for l in all_locs if l.get("risk_level") == "MEDIUM")
    low_risk_count = sum(1 for l in all_locs if l.get("risk_level") == "LOW")
    confirmed_count = sum(1 for l in all_locs if l.get("alert_status") == "CONFIRMED")
    
    return {
        "summary": {
            "total_monitored_villages": total_villages,
            "high_risk_villages": high_risk_count,
            "medium_risk_villages": med_risk_count,
            "low_risk_villages": low_risk_count,
            "confirmed_outbreaks": confirmed_count,
            "active_alerts_count": len(alerts),
            "last_synced_at": datetime.utcnow().isoformat(),
            "region": "Northeast India (NER)"
        },
        "locations": locations,
        "active_alerts": alerts,
        "public_warnings": confirmed_warnings
    }

@router.get("/clusters")
async def get_suspected_clusters():
    cases_col = get_collection("case_reports")
    all_cases = await cases_col.find()
    clusters = cluster_engine.detect_clusters(all_cases)
    return clusters

@router.post("/risk/simulate-surge")
async def simulate_outbreak_surge(village: str = "Garamur", district: str = "Majuli", state: str = "Assam"):
    """
    Live Demonstration Utility for Judges:
    Simulates a sudden monsoon flood surge & case spike in the specified Northeast village,
    immediately updating the AI risk score to HIGH/VERY HIGH and refreshing the live map.
    """
    locations_col = get_collection("locations")
    alerts_col = get_collection("alerts")
    cases_col = get_collection("case_reports")
    
    # Add spike case report
    spike_case = {
        "state": state,
        "district": district,
        "village": village,
        "date": datetime.utcnow().strftime("%Y-%m-%d"),
        "symptoms": ["Acute Watery Diarrhea", "Severe Vomiting", "Dehydration & Lethargy"],
        "approx_cases": 18,
        "age_group": "0-5",
        "water_source": "River/Stream",
        "sanitation_status": "Poor Sanitation",
        "water_environment_notes": "SIMULATED SURGE: Extreme monsoon flood waterlogging, tube well submerged.",
        "reporter_name": "Simulated Live Feed",
        "reporter_role": "ASHA",
        "latitude": 26.9634,
        "longitude": 94.2144,
        "created_at": datetime.utcnow().isoformat()
    }
    await cases_col.insert_one(spike_case)
    
    # Run ML prediction with extreme surge parameters
    pred = ml_engine.predict_risk(
        cases_current=28,
        cases_previous=3,
        rainfall_mm=135.0,
        flood_status="Severe Flood",
        water_quality="Highly Contaminated",
        turbidity_ntu=48.0,
        sanitation_status="Poor Sanitation",
        population=4200,
        symptoms=["Acute Watery Diarrhea", "Severe Vomiting", "Dehydration & Lethargy"]
    )
    
    # Update location to VERY HIGH
    await locations_col.update_one(
        {"village": village, "district": district},
        {"$set": {
            "active_cases": 28,
            "case_growth": 8.33,
            "rainfall_mm": 135.0,
            "flood_status": "Severe Flood",
            "water_quality": "Highly Contaminated",
            "turbidity_ntu": 48.0,
            "risk_score": pred["risk_score"],
            "risk_level": pred["risk_level"],
            "contributing_factors": pred["contributing_factors"],
            "alert_status": "HIGH",
            "last_updated": datetime.utcnow().isoformat()
        }}
    )
    
    # Insert new high alert
    alert_id = f"ALT-{district[:3].upper()}-SIM-{datetime.utcnow().strftime('%M%S')}"
    new_alert = {
        "id": alert_id,
        "title": f"🚨 LIVE SURGE ALERT: Acute Outbreak Signal in {village}, {district}",
        "state": state,
        "district": district,
        "village": village,
        "severity": "HIGH",
        "status": "INVESTIGATION",
        "risk_score": pred["risk_score"],
        "risk_level": pred["risk_level"],
        "total_cases": 28,
        "contributing_factors": pred["contributing_factors"],
        "investigator_name": None,
        "investigation_notes": "Live simulation trigger: Rapid water contamination & case surge detected.",
        "confirmed_by": None,
        "public_warning_issued": False,
        "created_at": datetime.utcnow().isoformat()
    }
    await alerts_col.insert_one(new_alert)
    
    return {
        "status": "SUCCESS",
        "village": village,
        "new_risk_score": pred["risk_score"],
        "new_risk_level": pred["risk_level"],
        "alert_id": alert_id,
        "message": f"Simulated outbreak surge applied! Live map and public warnings reflect High Risk."
    }

@router.post("/risk/simulate-reset")
async def simulate_reset_to_normal(village: str = "Garamur", district: str = "Majuli"):
    """Reset a village back to normal baseline."""
    locations_col = get_collection("locations")
    await locations_col.update_one(
        {"village": village, "district": district},
        {"$set": {
            "active_cases": 2,
            "case_growth": 0.0,
            "rainfall_mm": 20.0,
            "flood_status": "Normal",
            "water_quality": "Clean",
            "turbidity_ntu": 3.5,
            "risk_score": 18,
            "risk_level": "LOW",
            "contributing_factors": ["Baseline environmental and health parameters normal"],
            "alert_status": "LOW",
            "last_updated": datetime.utcnow().isoformat()
        }}
    )
    return {"status": "SUCCESS", "message": f"{village} reset to baseline low risk."}
