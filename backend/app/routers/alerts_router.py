from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from app.database import get_collection
from app.auth import get_required_user, require_roles
from app.models.schemas import AlertInvestigateRequest, AlertConfirmRequest, AlertRejectRequest, UserRole
from datetime import datetime

router = APIRouter(prefix="/alerts", tags=["Alert Investigation & Outbreak Confirmation"])

@router.get("")
async def list_alerts(status_filter: Optional[str] = None, state: Optional[str] = None):
    alerts_col = get_collection("alerts")
    query = {}
    if status_filter and status_filter != "ALL": query["status"] = status_filter
    if state and state != "ALL": query["state"] = state
    return await alerts_col.find(query, sort=[("created_at", -1)])

@router.post("/investigate")
async def investigate_alert(req: AlertInvestigateRequest, user: dict = Depends(get_required_user)):
    """PHC / CHC Medical Staff or Surveillance Officer investigates alert."""
    if user.get("role") not in [UserRole.MEDICAL_STAFF, UserRole.AUTHORITY, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Medical Staff, Health Authority, or Admin can conduct alert investigations."
        )
        
    alerts_col = get_collection("alerts")
    investigations_col = get_collection("investigations")
    
    alert = await alerts_col.find_one({"id": req.alert_id})
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found.")
        
    # Log investigation audit record
    inv_record = {
        "alert_id": req.alert_id,
        "investigator_id": user.get("id"),
        "investigator_name": req.investigator_name or user.get("name"),
        "investigator_role": user.get("role"),
        "investigator_notes": req.investigator_notes,
        "field_findings": req.field_findings,
        "recommended_next_step": req.recommended_next_step,
        "investigated_at": datetime.utcnow().isoformat()
    }
    await investigations_col.insert_one(inv_record)
    
    # Update alert status
    new_status = "INVESTIGATION"
    if req.recommended_next_step == "CONFIRM":
        new_status = "INVESTIGATION" # Still needs final Authority confirmation
    elif req.recommended_next_step == "REJECT":
        new_status = "REJECTED"
        
    await alerts_col.update_one(
        {"id": req.alert_id},
        {"$set": {
            "status": new_status,
            "investigator_name": req.investigator_name or user.get("name"),
            "investigation_notes": req.investigator_notes,
            "field_findings": req.field_findings,
            "updated_at": datetime.utcnow().isoformat()
        }}
    )
    
    return {"status": "SUCCESS", "message": "Investigation details logged successfully.", "alert_status": new_status}

@router.post("/confirm")
async def confirm_alert(req: AlertConfirmRequest, user: dict = Depends(get_required_user)):
    """Only authorized District/State Health Authority or Admin can confirm an outbreak and issue Public Warning."""
    if user.get("role") not in [UserRole.AUTHORITY, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only District/State Health Authorities or Admin can officially confirm an outbreak."
        )
        
    alerts_col = get_collection("alerts")
    locations_col = get_collection("locations")
    warnings_col = get_collection("public_warnings")
    
    alert = await alerts_col.find_one({"id": req.alert_id})
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found.")
        
    # Mark alert CONFIRMED
    await alerts_col.update_one(
        {"id": req.alert_id},
        {"$set": {
            "status": "CONFIRMED",
            "confirmed_by": req.authority_name or user.get("name"),
            "official_action": req.official_action,
            "public_warning_issued": True,
            "confirmed_at": datetime.utcnow().isoformat()
        }}
    )
    
    # Update location map marker to CONFIRMED
    await locations_col.update_one(
        {"village": alert.get("village"), "district": alert.get("district")},
        {"$set": {
            "alert_status": "CONFIRMED",
            "last_updated": datetime.utcnow().isoformat()
        }}
    )
    
    # Issue verified Public Warning
    warning_text = req.public_warning_text or (
        f"Confirmed water-borne disease outbreak signal in {alert.get('village')}, {alert.get('district')}. "
        "Residents are advised to use strictly boiled or chlorinated drinking water, avoid unverified surface water, "
        "and immediately seek medical assistance at the local PHC/CHC if dehydration or gastrointestinal symptoms develop."
    )
    
    warning_doc = {
        "id": f"PUB-WARN-{datetime.utcnow().strftime('%Y%m%d-%H%M')}",
        "alert_id": req.alert_id,
        "state": alert.get("state"),
        "district": alert.get("district"),
        "area_covered": f"{alert.get('village')}, {alert.get('district')}",
        "headline": f"OFFICIAL PUBLIC HEALTH WARNING: Outbreak Signal in {alert.get('village')}",
        "message": warning_text,
        "emergency_contact": f"District Health Control Room: 104 / +91 {alert.get('district')} PHC",
        "approved_by": req.authority_name or user.get("name"),
        "issue_date": datetime.utcnow().strftime("%Y-%m-%d"),
        "status": "ACTIVE",
        "created_at": datetime.utcnow().isoformat()
    }
    await warnings_col.insert_one(warning_doc)
    
    return {
        "status": "SUCCESS",
        "message": "Outbreak signal officially confirmed and verified Public Health Warning published.",
        "warning_id": warning_doc["id"]
    }

@router.post("/reject")
async def reject_alert(req: AlertRejectRequest, user: dict = Depends(get_required_user)):
    """Reject false alarm or resolved signal."""
    if user.get("role") not in [UserRole.AUTHORITY, UserRole.ADMIN, UserRole.MEDICAL_STAFF]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")
        
    alerts_col = get_collection("alerts")
    locations_col = get_collection("locations")
    
    await alerts_col.update_one(
        {"id": req.alert_id},
        {"$set": {
            "status": "REJECTED",
            "rejection_reason": req.rejection_reason,
            "rejected_by": req.authority_name or user.get("name"),
            "closed_at": datetime.utcnow().isoformat()
        }}
    )
    
    alert = await alerts_col.find_one({"id": req.alert_id})
    if alert:
        await locations_col.update_one(
            {"village": alert.get("village"), "district": alert.get("district")},
            {"$set": {"alert_status": "LOW"}}
        )
        
    return {"status": "SUCCESS", "message": "Alert rejected / closed."}

@router.get("/warnings")
async def get_public_warnings():
    """Public accessible verified health warnings."""
    warnings_col = get_collection("public_warnings")
    return await warnings_col.find({"status": "ACTIVE"}, sort=[("created_at", -1)])
