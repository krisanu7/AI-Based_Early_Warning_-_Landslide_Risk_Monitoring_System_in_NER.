from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Optional, Dict, Any
from app.database import get_collection, get_mongodb_stats, sync_db
from app.auth import get_required_user, require_roles
from app.models.schemas import UserRole
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["System Administrator Control Center"])

@router.get("/db-stats")
async def get_db_cluster_stats(user: dict = Depends(get_required_user)):
    """Live MongoDB cluster health and collection metrics."""
    if user.get("role") != UserRole.ADMIN and user.get("role") != UserRole.AUTHORITY:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required.")
    return get_mongodb_stats()

@router.get("/all-data")
async def get_all_system_data(user: dict = Depends(get_required_user)):
    """
    Super Admin Feature:
    Returns complete data from all collections:
    - users
    - case_reports
    - water_observations
    - locations / risk nodes
    - clusters
    - alerts
    - investigations
    - public_warnings
    - health_guidelines
    - audit_logs
    """
    if user.get("role") != UserRole.ADMIN and user.get("role") != UserRole.AUTHORITY:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required.")

    users_col = get_collection("users")
    cases_col = get_collection("case_reports")
    water_col = get_collection("water_observations")
    locations_col = get_collection("locations")
    alerts_col = get_collection("alerts")
    investigations_col = get_collection("investigations")
    warnings_col = get_collection("public_warnings")
    guidelines_col = get_collection("health_guidelines")
    audit_col = get_collection("audit_logs")

    users = await users_col.find()
    # Strip passwords for safety
    safe_users = []
    for u in users:
        u_copy = dict(u)
        u_copy.pop("password", None)
        safe_users.append(u_copy)

    cases = await cases_col.find(sort=[("created_at", -1)], limit=200)
    water_obs = await water_col.find(sort=[("created_at", -1)], limit=200)
    locations = await locations_col.find(sort=[("risk_score", -1)])
    alerts = await alerts_col.find(sort=[("created_at", -1)])
    investigations = await investigations_col.find(sort=[("investigated_at", -1)])
    warnings = await warnings_col.find(sort=[("created_at", -1)])
    guidelines = await guidelines_col.find()
    audit_logs = await audit_col.find(sort=[("timestamp", -1)], limit=100)

    # Log audit entry for admin access
    await audit_col.insert_one({
        "event": "ADMIN_FULL_DATA_ACCESS",
        "user_id": user.get("id"),
        "user_name": user.get("name"),
        "timestamp": datetime.utcnow().isoformat(),
        "ip_address": "127.0.0.1"
    })

    return {
        "mongodb_stats": get_mongodb_stats(),
        "users": safe_users,
        "case_reports": cases,
        "water_observations": water_obs,
        "locations_risk": locations,
        "alerts": alerts,
        "investigations": investigations,
        "public_warnings": warnings,
        "health_guidelines": guidelines,
        "audit_logs": audit_logs,
        "retrieved_at": datetime.utcnow().isoformat()
    }

@router.put("/users/{user_id}/role")
async def update_user_role(user_id: str, new_role: str, user: dict = Depends(get_required_user)):
    """System admin changes user role."""
    if user.get("role") != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
        
    users_col = get_collection("users")
    audit_col = get_collection("audit_logs")
    
    await users_col.update_one({"id": user_id}, {"$set": {"role": new_role.upper()}})
    await audit_col.insert_one({
        "event": "USER_ROLE_UPDATED",
        "target_user_id": user_id,
        "new_role": new_role.upper(),
        "performed_by": user.get("name"),
        "timestamp": datetime.utcnow().isoformat()
    })
    return {"status": "SUCCESS", "message": f"User role updated to {new_role.upper()}"}

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, user: dict = Depends(get_required_user)):
    """System admin deletes user."""
    if user.get("role") != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
        
    users_col = get_collection("users")
    await users_col.delete_one({"id": user_id})
    return {"status": "SUCCESS", "message": "User deleted."}

@router.delete("/records/{collection_name}/{record_id}")
async def delete_generic_record(collection_name: str, record_id: str, user: dict = Depends(get_required_user)):
    """System admin removes an erroneous record from any collection."""
    if user.get("role") != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
        
    col = get_collection(collection_name)
    deleted = await col.delete_one({"id": record_id})
    return {"status": "SUCCESS", "deleted": deleted, "message": f"Record {record_id} removed from {collection_name}."}
