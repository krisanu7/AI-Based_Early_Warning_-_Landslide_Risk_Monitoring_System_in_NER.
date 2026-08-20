from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from app.database import get_collection
from app.auth import get_required_user, require_roles
from app.models.schemas import HealthGuideline, UserRole
from datetime import datetime

router = APIRouter(prefix="/guidelines", tags=["Disease Safety Guide (🛡️)"])

@router.get("", response_model=List[HealthGuideline])
async def get_all_guidelines():
    """Retrieve all approved public-health disease safety guidelines."""
    guidelines_col = get_collection("health_guidelines")
    docs = await guidelines_col.find({"is_active": True})
    return [HealthGuideline(**d) for d in docs]

@router.get("/{disease}", response_model=HealthGuideline)
async def get_disease_guideline(disease: str):
    guidelines_col = get_collection("health_guidelines")
    doc = await guidelines_col.find_one({"disease": disease})
    if not doc:
        # Fallback to general guidance
        doc = await guidelines_col.find_one({"disease": "Other Water-Borne Diseases"})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guideline not found.")
    return HealthGuideline(**doc)

@router.post("", response_model=HealthGuideline)
async def create_or_update_guideline(guideline: HealthGuideline, user: dict = Depends(get_required_user)):
    """Authority or Admin updates/creates disease guidance."""
    if user.get("role") not in [UserRole.AUTHORITY, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Health Authorities and System Administrators can modify Disease Safety Guidelines."
        )
        
    guidelines_col = get_collection("health_guidelines")
    data = guideline.dict()
    data["approved_by"] = user.get("name") + " (" + user.get("role") + ")"
    data["updated_at"] = datetime.utcnow().strftime("%Y-%m-%d")
    
    existing = await guidelines_col.find_one({"disease": guideline.disease})
    if existing:
        await guidelines_col.update_one({"disease": guideline.disease}, {"$set": data})
    else:
        await guidelines_col.insert_one(data)
        
    return HealthGuideline(**data)

@router.delete("/{disease}")
async def delete_guideline(disease: str, user: dict = Depends(get_required_user)):
    if user.get("role") != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    guidelines_col = get_collection("health_guidelines")
    await guidelines_col.delete_one({"disease": disease})
    return {"status": "SUCCESS", "message": f"Guideline for {disease} deleted."}
