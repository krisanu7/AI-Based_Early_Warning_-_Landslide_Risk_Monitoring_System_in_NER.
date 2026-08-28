from fastapi import APIRouter, Query
from typing import Optional, List
from app.database import get_infrastructure_col

router = APIRouter(prefix="/infrastructure", tags=["Infrastructure Risk"])

@router.get("", response_model=List[dict])
async def list_infrastructure(
    state: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    infra_col = get_infrastructure_col()
    query = {}
    if state and state != "ALL":
        query["state"] = state
    if type and type != "ALL":
        query["type"] = type
    if status and status != "ALL":
        query["status"] = status

    items = await infra_col.find(query)
    return items

@router.patch("/{infra_id}/status")
async def update_infrastructure_status(infra_id: str, payload: dict):
    infra_col = get_infrastructure_col()
    new_status = payload.get("status", "OPERATIONAL") # OPERATIONAL, VULNERABLE, BLOCKED, DIVERTED
    notes = payload.get("notes", "Status updated by Disaster Management Control Room")

    await infra_col.update_one(
        {"id": infra_id},
        {"$set": {"status": new_status, "control_room_notes": notes}}
    )
    return {"success": True, "infra_id": infra_id, "status": new_status}
