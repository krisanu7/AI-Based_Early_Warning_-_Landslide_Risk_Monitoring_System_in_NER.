from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional, Dict, Any
from app.database import get_collection
from app.auth import get_required_user, require_roles
from app.models.schemas import CaseReportCreate, UserRole
from app.ml.model import ml_engine
from app.ml.cluster_detector import cluster_engine
from datetime import datetime

router = APIRouter(prefix="/cases", tags=["Case Reporting & Surveillance"])

async def _process_case_and_update_risk(case_data: dict, current_user: Optional[dict] = None) -> dict:
    cases_col = get_collection("case_reports")
    locations_col = get_collection("locations")
    alerts_col = get_collection("alerts")
    
    # Enrich reporter info
    if current_user:
        case_data["reporter_name"] = current_user.get("name", "Health Worker")
        case_data["reporter_role"] = current_user.get("role", "ASHA")
    
    case_data["created_at"] = datetime.utcnow().isoformat()
    res = await cases_col.insert_one(case_data)
    case_data["id"] = res.inserted_id

    village_name = case_data.get("village")
    state_name = case_data.get("state")
    district_name = case_data.get("district")
    approx_cases = case_data.get("approx_cases", 1)
    symptoms = case_data.get("symptoms", [])

    # Fetch or create location node
    loc = await locations_col.find_one({"village": village_name, "district": district_name})
    if not loc:
        loc = {
            "state": state_name,
            "district": district_name,
            "village": village_name,
            "latitude": case_data.get("latitude", 26.2006),
            "longitude": case_data.get("longitude", 92.9376),
            "population": 2500,
            "water_source": case_data.get("water_source", "Handpump"),
            "active_cases": 0,
            "previous_7day_cases": 2,
            "rainfall_mm": 35.0,
            "flood_status": "Normal",
            "turbidity_ntu": 5.0,
            "water_quality": "Clean",
            "sanitation_status": case_data.get("sanitation_status", "Pit Latrine")
        }

    # Aggregate active cases for this village in recent window
    all_village_cases = await cases_col.find({"village": village_name, "district": district_name})
    total_active = sum(c.get("approx_cases", 0) for c in all_village_cases[-5:]) + approx_cases
    prev_cases = loc.get("previous_7day_cases", 3)

    # ML Outbreak Risk Calculation
    pred = ml_engine.predict_risk(
        cases_current=total_active,
        cases_previous=prev_cases,
        rainfall_mm=loc.get("rainfall_mm", 40.0),
        flood_status=loc.get("flood_status", "Normal"),
        water_quality=loc.get("water_quality", "Moderately Contaminated"),
        turbidity_ntu=loc.get("turbidity_ntu", 14.0),
        sanitation_status=case_data.get("sanitation_status", "Poor Sanitation"),
        population=loc.get("population", 3000),
        symptoms=symptoms
    )

    # Update location
    update_fields = {
        "active_cases": total_active,
        "case_growth": pred["case_growth_rate"],
        "risk_score": pred["risk_score"],
        "risk_level": pred["risk_level"],
        "contributing_factors": pred["contributing_factors"],
        "recommended_action": pred["recommended_action"],
        "last_updated": datetime.utcnow().isoformat()
    }
    if pred["risk_level"] in ["HIGH", "VERY HIGH"]:
        update_fields["alert_status"] = "HIGH"
    elif pred["risk_level"] == "MEDIUM":
        update_fields["alert_status"] = "MEDIUM"
    else:
        update_fields["alert_status"] = "LOW"

    await locations_col.update_one({"village": village_name, "district": district_name}, {"$set": update_fields})

    # Cluster Detection across recent reports
    all_recent = await cases_col.find()
    detected_clusters = cluster_engine.detect_clusters(all_recent)
    
    # If high risk or cluster detected, create or elevate alert
    if pred["risk_level"] in ["HIGH", "VERY HIGH"]:
        alert_id = f"ALT-{district_name[:3].upper()}-{datetime.utcnow().strftime('%m%d%H%M')}"
        existing_alert = await alerts_col.find_one({"village": village_name, "status": {"$in": ["HIGH", "INVESTIGATION", "CONFIRMED"]}})
        if not existing_alert:
            new_alert = {
                "id": alert_id,
                "title": f"High Outbreak Risk Signal: {village_name}, {district_name}",
                "state": state_name,
                "district": district_name,
                "village": village_name,
                "severity": "HIGH",
                "status": "INVESTIGATION",
                "risk_score": pred["risk_score"],
                "risk_level": pred["risk_level"],
                "total_cases": total_active,
                "contributing_factors": pred["contributing_factors"],
                "investigator_name": None,
                "investigation_notes": "Automated AI risk threshold exceeded. Awaiting PHC Medical Officer field triage.",
                "confirmed_by": None,
                "public_warning_issued": False,
                "created_at": datetime.utcnow().isoformat()
            }
            await alerts_col.insert_one(new_alert)

    return {
        "case_id": case_data.get("id"),
        "risk_score": pred["risk_score"],
        "risk_level": pred["risk_level"],
        "contributing_factors": pred["contributing_factors"],
        "clusters_detected": len(detected_clusters),
        "message": "Case reported successfully and AI surveillance pipeline refreshed."
    }

@router.post("/report")
async def report_case(case_in: CaseReportCreate, user: dict = Depends(get_required_user)):
    # Public cannot report outbreak cases
    if user.get("role") == UserRole.PUBLIC:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Public users are not authorized to submit outbreak reports."
        )
    return await _process_case_and_update_risk(case_in.dict(), user)

@router.post("/sync")
async def sync_offline_reports(batch: List[CaseReportCreate], user: dict = Depends(get_required_user)):
    """Synchronize offline queued case reports recorded by ASHA/ANM workers."""
    if user.get("role") == UserRole.PUBLIC:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")
    
    results = []
    for item in batch:
        res = await _process_case_and_update_risk(item.dict(), user)
        results.append(res)
        
    return {
        "synced_count": len(results),
        "status": "SUCCESS",
        "details": results
    }

@router.get("")
async def list_cases(state: Optional[str] = None, district: Optional[str] = None, limit: int = 50):
    cases_col = get_collection("case_reports")
    query = {}
    if state and state != "ALL": query["state"] = state
    if district and district != "ALL": query["district"] = district
    
    results = await cases_col.find(query, sort=[("created_at", -1)], limit=limit)
    return results
