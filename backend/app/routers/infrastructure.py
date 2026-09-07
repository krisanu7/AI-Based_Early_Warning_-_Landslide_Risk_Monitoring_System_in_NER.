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
    from app.seed_data import get_inmemory_seed_data
    seed = get_inmemory_seed_data()

    state_str = state if isinstance(state, str) else None
    type_str = type if isinstance(type, str) else None
    status_str = status if isinstance(status, str) else None

    infra_col = get_infrastructure_col()
    query = {}
    if state_str and state_str != "ALL":
        query["state"] = state_str
    if type_str and type_str != "ALL":
        query["type"] = type_str
    if status_str and status_str != "ALL":
        query["status"] = status_str

    items = await infra_col.find(query)
    if not items:
        items = list(seed.get("infrastructure", []))
        if state_str and state_str != "ALL":
            items = [i for i in items if i.get("state", "").lower() == state_str.lower()]
        if type_str and type_str != "ALL":
            items = [i for i in items if i.get("type", "").lower() == type_str.lower()]
        if status_str and status_str != "ALL":
            items = [i for i in items if i.get("status", "").lower() == status_str.lower()]

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
