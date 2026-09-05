from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional, List
from app.database import get_alerts_col, get_locations_col, get_audit_logs_col
from app.schemas import AlertResponse, AlertVerifyRequest
from datetime import datetime

router = APIRouter(prefix="/alerts", tags=["Alerts & Early Warnings"])

@router.get("", response_model=List[dict])
async def list_alerts(
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    alerts_col = get_alerts_col()
    query = {}
    if state and state != "ALL":
        query["state"] = state
    if district and district != "ALL":
        query["district"] = district
    if status and status != "ALL":
        query["status"] = status

    alerts = await alerts_col.find(query)
    alerts.sort(key=lambda x: x.get("risk_score", 0), reverse=True)
    return alerts

@router.get("/public")
async def get_public_active_warnings():
    """Returns alerts that have been verified and approved for public broadcast."""
    alerts_col = get_alerts_col()
    alerts = await alerts_col.find()
    
    # Filter public-facing alerts
    public_alerts = [
        a for a in alerts
        if a.get("public_warning_issued") is True or a.get("status") in ["WARNING", "CRITICAL", "VERIFIED_LANDSLIDE"]
    ]
    public_alerts.sort(key=lambda x: x.get("risk_score", 0), reverse=True)
    return {"active_public_warnings": public_alerts, "total": len(public_alerts)}

@router.patch("/{alert_id}/broadcast")
async def broadcast_official_warning(alert_id: str, payload: AlertVerifyRequest):
    alerts_col = get_alerts_col()
    audit_col = get_audit_logs_col()

    alert = await alerts_col.find_one({"id": alert_id})
    if not alert:
        alert = await alerts_col.find_one({"_id": alert_id})

    if not alert:
        raise HTTPException(status_code=404, detail="Alert record not found")

    new_status = "CRITICAL" if payload.evacuation_recommended else "WARNING"

    headline = payload.public_warning_headline or f"OFFICIAL LANDSLIDE WARNING: Heavy Slope Instability at {alert.get('village')}, {alert.get('district')}"
    message = payload.public_warning_message or (
        f"State/District Disaster Management Authority warns residents of {alert.get('village')} "
        f"and surrounding transport corridors of high landslide potential due to heavy continuous precipitation. "
        f"Avoid vulnerable slope zones and remain alert for official evacuation instructions."
    )

    update_fields = {
        "status": new_status,
        "public_warning_issued": True,
        "public_warning_headline": headline,
        "public_warning_message": message,
        "evacuation_recommended": payload.evacuation_recommended,
        "road_closure_ordered": payload.road_closure_ordered,
        "verified_by": payload.officer_name,
        "broadcast_timestamp": datetime.utcnow().isoformat()
    }

    await alerts_col.update_one({"id": alert.get("id")}, {"$set": update_fields})

    await audit_col.insert_one({
        "user": payload.officer_name,
        "role": "AUTHORITY",
        "action": f"Issued official public landslide warning for {alert.get('village')}, {alert.get('district')}",
        "timestamp": datetime.utcnow().isoformat(),
        "target": f"alert:{alert_id}"
    })

    return {
        "success": True,
        "message": f"Official warning successfully published to Public Emergency Broadcast Grid.",
        "alert_id": alert_id,
        "status": new_status
    }

