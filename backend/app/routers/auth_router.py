from fastapi import APIRouter, HTTPException, status, Depends
from app.database import get_collection
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user, get_required_user
from app.models.schemas import UserRegister, UserLogin, Token, UserResponse
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
async def register(user_in: UserRegister):
    users_col = get_collection("users")
    existing = await users_col.find_one({"email": user_in.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
        
    doc = {
        "name": user_in.name,
        "email": user_in.email.lower(),
        "password": get_password_hash(user_in.password),
        "role": user_in.role.upper(),
        "state": user_in.state,
        "district": user_in.district,
        "village": user_in.village,
        "phone": user_in.phone,
        "facility_name": user_in.facility_name,
        "created_at": datetime.utcnow().isoformat()
    }
    
    res = await users_col.insert_one(doc)
    doc["id"] = res.inserted_id
    
    token = create_access_token(data={"sub": doc["id"], "role": doc["role"], "email": doc["email"]})
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=doc["id"],
            name=doc["name"],
            email=doc["email"],
            role=doc["role"],
            state=doc["state"],
            district=doc["district"],
            village=doc.get("village"),
            phone=doc.get("phone"),
            facility_name=doc.get("facility_name"),
            created_at=doc.get("created_at")
        )
    )

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    users_col = get_collection("users")
    user = await users_col.find_one({"email": credentials.email.lower()})
    if not user or not verify_password(credentials.password, user.get("password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
        
    token = create_access_token(data={"sub": user["id"], "role": user["role"], "email": user["email"]})
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            role=user["role"],
            state=user.get("state", "Assam"),
            district=user.get("district", "Majuli"),
            village=user.get("village"),
            phone=user.get("phone"),
            facility_name=user.get("facility_name"),
            created_at=user.get("created_at")
        )
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(user: dict = Depends(get_required_user)):
    return UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
        state=user.get("state", "Assam"),
        district=user.get("district", "Majuli"),
        village=user.get("village"),
        phone=user.get("phone"),
        facility_name=user.get("facility_name"),
        created_at=user.get("created_at")
    )
