from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional, List
from app.database import get_field_reports_col, get_locations_col, get_alerts_col, get_audit_logs_col
from app.schemas import FieldReportCreate, FieldReportResponse
from datetime import datetime

router = APIRouter(prefix="/field-reports", tags=["Field Reports"])

@router.get("", response_model=List[dict])
async def list_field_reports(
    district: Optional[str] = Query(None),
    village: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    district_str = district if isinstance(district, str) else None
    village_str = village if isinstance(village, str) else None
    status_str = status if isinstance(status, str) else None

    reports_col = get_field_reports_col()
    query = {}
    if district_str and district_str != "ALL":
        query["district"] = district_str
    if village_str and village_str != "ALL":
        query["village"] = village_str
    if status_str and status_str != "ALL":
        query["status"] = status_str

    reports = await reports_col.find(query)
    if not reports:
        from app.seed_data import get_inmemory_seed_data
        reports = list(get_inmemory_seed_data().get("field_reports", []))
        if district_str and district_str != "ALL":
            reports = [r for r in reports if r.get("district", "").lower() == district_str.lower()]
        if village_str and village_str != "ALL":
            reports = [r for r in reports if r.get("village", "").lower() == village_str.lower()]
        if status_str and status_str != "ALL":
            reports = [r for r in reports if r.get("status") == status_str]

    # Sort newest first
    reports.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return reports

@router.post("", response_model=dict)
async def create_field_report(report: FieldReportCreate):
    reports_col = get_field_reports_col()
    locs_col = get_locations_col()
    audit_col = get_audit_logs_col()

    report_dict = report.model_dump()
    report_dict["status"] = "PENDING_VERIFICATION"
    report_dict["created_at"] = datetime.utcnow().isoformat()
    report_dict["verified_by"] = None
    report_dict["verified_at"] = None
    report_dict["id"] = f"RPT-NER-{int(datetime.utcnow().timestamp()*1000)}"

    result = await reports_col.insert_one(report_dict)
    if result and hasattr(result, "inserted_id") and result.inserted_id:
        report_dict["id"] = str(result.inserted_id)

    # If severe/critical signs reported, elevate the corresponding location risk in real time
    if report.visible_cracks or report.soil_mud_movement or report.rockfall_observed or report.road_blocked:
        loc = await locs_col.find_one({"village": report.village})
        if loc:
            current_risk = loc.get("risk_score", 45)
            new_risk = min(98, current_risk + 25)
            new_level = "CRITICAL" if new_risk >= 81 else "HIGH"
            await locs_col.update_one(
                {"village": report.village},
                {"$set": {
                    "risk_score": new_risk,
                    "risk_level": new_level,
                    "last_field_incident": f"Visible cracks / mudflow reported on {report.observation_date}"
                }}
            )

    # Log audit entry
    await audit_col.insert_one({
        "user": report.reporter_name or "Ground Surveyor",
        "role": report.reporter_role or "FIELD_WORKER",
        "action": f"Submitted field landslide report at {report.village}, {report.district}",
        "timestamp": datetime.utcnow().isoformat(),
        "target": f"field_report:{report_id}"
    })

    return {
        "success": True,
        "message": "Field landslide observation report submitted successfully to district surveillance queue.",
        "report_id": report_id,
        "status": "PENDING_VERIFICATION"
    }

@router.patch("/{report_id}/verify")
async def verify_field_report(report_id: str, payload: dict):
    reports_col = get_field_reports_col()
    audit_col = get_audit_logs_col()

    officer_name = payload.get("officer_name", "DDMA Officer")
    verification_status = payload.get("status", "VERIFIED") # VERIFIED, FALSE_ALARM, RESOLVED
    notes = payload.get("notes", "Field evidence inspected and verified by Disaster Response Officer.")

    report = await reports_col.find_one({"_id": report_id})
    if not report:
        report = await reports_col.find_one({"id": report_id})

    if not report:
        raise HTTPException(status_code=404, detail="Field report not found")

    await reports_col.update_one(
        {"id": report.get("id")},
        {"$set": {
            "status": verification_status,
            "verified_by": officer_name,
            "verification_notes": notes,
            "verified_at": datetime.utcnow().isoformat()
        }}
    )

    await audit_col.insert_one({
        "user": officer_name,
        "role": "DISTRICT_OFFICER",
        "action": f"Verified field report {report_id} as {verification_status}",
        "timestamp": datetime.utcnow().isoformat(),
        "target": f"field_report:{report_id}"
    })

    return {
        "success": True,
        "message": f"Report {report_id} status updated to {verification_status}.",
        "verified_by": officer_name
    }
