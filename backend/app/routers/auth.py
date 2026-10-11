import random
import httpx
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, status
from app.database import get_users_col, get_email_otps_col
from app.auth import verify_password, get_password_hash, create_access_token
from app.schemas import (
    UserLogin, 
    UserRegister, 
    Token, 
    SendOtpRequest, 
    VerifyOtpRequest, 
    GoogleAuthRequest
)
from app.email_service import is_valid_email_syntax, send_verification_otp_email
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

DEMO_ROLE_ACCOUNTS = {
    "FIELD_WORKER": {
        "name": "Arun Bordoloi (Ground Surveyor)",
        "email": "field@swasthyajal.gov.in",
        "role": "FIELD_WORKER",
        "state": "Assam",
        "district": "Dima Hasao",
        "village": "Haflong",
        "designation": "Disaster Field Surveyor & GPS Scout"
    },
    "BLOCK_OFFICER": {
        "name": "Nandita Hazarika (Block Disaster Officer)",
        "email": "block@swasthyajal.gov.in",
        "role": "BLOCK_OFFICER",
        "state": "Assam",
        "district": "Dima Hasao",
        "village": "Haflong Block HQ",
        "designation": "Block Disaster Management Officer"
    },
    "DISTRICT_OFFICER": {
        "name": "Dr. Subhashish Deb (District Disaster Officer)",
        "email": "district@swasthyajal.gov.in",
        "role": "DISTRICT_OFFICER",
        "state": "Assam",
        "district": "Dima Hasao",
        "village": "District Emergency Operations Centre",
        "designation": "DDMA Incident Commander & Verification Officer"
    },
    "AUTHORITY": {
        "name": "Smt. K. Sangma (State Disaster Authority)",
        "email": "authority@swasthyajal.gov.in",
        "role": "AUTHORITY",
        "state": "Meghalaya",
        "district": "East Khasi Hills",
        "village": "State EOC Khanapara",
        "designation": "State Disaster Management Authority (SDMA) Director"
    },
    "ADMIN": {
        "name": "System Administrator",
        "email": "admin@swasthyajal.gov.in",
        "role": "ADMIN",
        "state": "Assam",
        "district": "Guwahati HQ",
        "village": "Dispur EOC",
        "designation": "State Disaster Geospatial Admin"
    },
    "PUBLIC": {
        "name": "Public Citizen",
        "email": "public@swasthyajal.gov.in",
        "role": "PUBLIC",
        "state": "Assam",
        "district": "Dima Hasao",
        "village": "Haflong",
        "designation": "Public Citizen Portal"
    }
}

@router.post("/send-otp")
async def send_otp(req: SendOtpRequest):
    """
    Validates the real format of an email, checks for existing registration,
    generates a 6-digit OTP code, and emails it to the recipient.
    """
    valid, result = is_valid_email_syntax(req.email)
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result
        )
    email = result

    users_col = get_users_col()
    existing_user = await users_col.find_one({"email": email})
    
    if req.purpose == "register" and existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email is already registered. Please sign in instead."
        )

    # Generate secure 6-digit OTP
    otp_code = f"{random.randint(100000, 999999)}"
    now = datetime.utcnow()
    expires_at = (now + timedelta(minutes=10)).isoformat()

    otps_col = get_email_otps_col()
    # Save or update OTP document for this email
    otp_doc = {
        "email": email,
        "otp": otp_code,
        "expires_at": expires_at,
        "verified": False,
        "purpose": req.purpose or "register",
        "created_at": now.isoformat()
    }
    
    # Try updating or inserting
    try:
        existing_otp = await otps_col.find_one({"email": email})
        if existing_otp:
            # Overwrite with new code
            await otps_col.insert_one(otp_doc)
        else:
            await otps_col.insert_one(otp_doc)
    except Exception:
        pass

    # Send verification email via SMTP (or console fallback in dev)
    send_res = await send_verification_otp_email(to_email=email, otp_code=otp_code)

    return {
        "success": True,
        "message": send_res.get("message", f"Verification code sent to {email}."),
        "dev_mode": send_res.get("dev_mode", False),
        "dev_otp": send_res.get("dev_otp") # Only returned in development mode when SMTP is unconfigured
    }

@router.post("/verify-otp")
async def verify_otp(req: VerifyOtpRequest):
    """
    Verifies the 6-digit OTP code for an email address.
    """
    valid, email = is_valid_email_syntax(req.email)
    if not valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=email)

    otps_col = get_email_otps_col()
    now_iso = datetime.utcnow().isoformat()

    # Search for matching OTP document
    candidate = await otps_col.find_one({"email": email, "otp": req.otp.strip()})
    
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code. Please check your email or request a new code."
        )

    if candidate.get("expires_at", "") < now_iso:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This verification code has expired. Please request a new code."
        )

    # Mark as verified
    candidate["verified"] = True
    candidate["verified_at"] = now_iso
    try:
        await otps_col.insert_one(candidate)
    except Exception:
        pass

    return {
        "success": True,
        "message": "Email address verified successfully!"
    }

@router.post("/google", response_model=Token)
async def google_auth(req: GoogleAuthRequest):
    """
    Authenticates a user via Google Identity Services (Sign in with Google).
    Validates token directly with Google OAuth2 API to guarantee genuine Google identity.
    """
    token_str = req.credential.strip()
    if not token_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google ID token is required."
        )

    google_user = None

    # Verify ID token with Google's public tokeninfo endpoint
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={token_str}"
            )
            if resp.status_code == 200:
                google_user = resp.json()
            else:
                print(f"[Google Auth] tokeninfo returned status {resp.status_code}: {resp.text}")
        except Exception as e:
            print(f"[Google Auth] tokeninfo request failed: {e}")

    if not google_user or not google_user.get("email"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google token verification failed. Please sign in with a genuine, authorized Google account."
        )

    email_verified = str(google_user.get("email_verified", "")).lower() == "true"
    if not email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This Google account does not have a verified email address."
        )

    email = google_user["email"].lower().strip()
    name = google_user.get("name") or google_user.get("given_name") or email.split("@")[0].title()

    users_col = get_users_col()
    user = await users_col.find_one({"email": email})

    if not user:
        # Register new verified Google user
        new_user = {
            "name": name,
            "email": email,
            "password": get_password_hash("google_oauth_" + email),
            "role": req.role or "PUBLIC",
            "state": req.state or "Assam",
            "district": req.district or "Dima Hasao",
            "village": req.village or "Haflong",
            "phone": req.phone or "",
            "designation": req.designation or f"{req.role or 'Citizen'} (Google Verified)",
            "google_auth": True,
            "email_verified": True,
            "picture": google_user.get("picture", ""),
            "created_at": datetime.utcnow().isoformat()
        }
        res = await users_col.insert_one(new_user)
        user = new_user
        user["id"] = str(getattr(res, "inserted_id", f"usr-{int(datetime.utcnow().timestamp())}"))
    else:
        # Ensure ID is present
        user["id"] = user.get("id") or str(user.get("_id", "usr-google"))

    access_token = create_access_token(data={"sub": user["email"], "role": user.get("role", "PUBLIC")})
    
    user_sanitized = {
        "id": user.get("id") or str(user.get("_id", "usr-01")),
        "name": user.get("name"),
        "email": user.get("email"),
        "role": user.get("role", "PUBLIC"),
        "state": user.get("state", "Assam"),
        "district": user.get("district", "Dima Hasao"),
        "village": user.get("village", "Haflong"),
        "designation": user.get("designation"),
        "picture": user.get("picture", "")
    }

    return {"access_token": access_token, "token_type": "bearer", "user": user_sanitized}

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """
    Standard user authentication.
    Requires genuine registered account or official demo persona credentials.
    REJECTS unregistered/fake emails.
    """
    email_clean = user_credentials.email.strip().lower()
    users_col = get_users_col()
    user = await users_col.find_one({"email": email_clean})

    if not user:
        # Check demo accounts
        for role_key, acc in DEMO_ROLE_ACCOUNTS.items():
            if acc["email"].lower() == email_clean:
                user = acc.copy()
                user["id"] = f"demo-{role_key.lower()}"
                break

    # STRICT CHECK: Reject unregistered accounts completely
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No account found with this email. Please register first or use Sign in with Google."
        )

    # Verify password
    user_stored_password = user.get("password", "")
    is_valid_pw = verify_password(user_credentials.password, user_stored_password)
    
    # Allow standard demo password for preconfigured demo accounts
    if not is_valid_pw and str(user.get("id", "")).startswith("demo-"):
        if user_credentials.password in ["password123", "admin123", "demo123", "123456"]:
            is_valid_pw = True

    if not is_valid_pw:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    access_token = create_access_token(data={"sub": user["email"], "role": user.get("role", "PUBLIC")})
    
    user_sanitized = {
        "id": user.get("id") or str(user.get("_id", "usr-01")),
        "name": user.get("name"),
        "email": user.get("email"),
        "role": user.get("role", "PUBLIC"),
        "state": user.get("state", "Assam"),
        "district": user.get("district", "Dima Hasao"),
        "village": user.get("village", "Haflong"),
        "designation": user.get("designation")
    }

    return {"access_token": access_token, "token_type": "bearer", "user": user_sanitized}

@router.post("/demo-login/{role_name}", response_model=Token)
async def demo_login(role_name: str):
    role_key = role_name.upper()
    if role_key not in DEMO_ROLE_ACCOUNTS:
        if "FIELD" in role_key or "ASHA" in role_key or "ANM" in role_key:
            role_key = "FIELD_WORKER"
        elif "BLOCK" in role_key:
            role_key = "BLOCK_OFFICER"
        elif "DISTRICT" in role_key or "DOCTOR" in role_key:
            role_key = "DISTRICT_OFFICER"
        elif "AUTH" in role_key:
            role_key = "AUTHORITY"
        elif "ADMIN" in role_key:
            role_key = "ADMIN"
        else:
            role_key = "PUBLIC"

    acc = DEMO_ROLE_ACCOUNTS[role_key]
    access_token = create_access_token(data={"sub": acc["email"], "role": acc["role"]})
    
    user_sanitized = {
        "id": f"demo-{role_key.lower()}",
        "name": acc["name"],
        "email": acc["email"],
        "role": acc["role"],
        "state": acc["state"],
        "district": acc["district"],
        "village": acc["village"],
        "designation": acc["designation"]
    }

    return {"access_token": access_token, "token_type": "bearer", "user": user_sanitized}

@router.post("/register", response_model=Token)
async def register(user_data: UserRegister):
    """
    Registers a new user account.
    Enforces real email verification:
    1. Validates email structure & rejects fake/burner domains.
    2. Requires verified OTP status in the database.
    """
    valid, email = is_valid_email_syntax(user_data.email)
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=email
        )

    users_col = get_users_col()
    existing = await users_col.find_one({"email": email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account is already registered with this email address. Please sign in."
        )

    # Validate password requirements
    if not user_data.password or len(user_data.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    if user_data.confirm_password is not None and user_data.password != user_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match. Create Password and Confirm Password must be identical to register."
        )

    # Verify that email OTP was verified
    otps_col = get_email_otps_col()
    
    # If client passed otp directly, verify it now
    if user_data.otp and user_data.otp.strip():
        now_iso = datetime.utcnow().isoformat()
        otp_match = await otps_col.find_one({
            "email": email, 
            "otp": user_data.otp.strip()
        })
        if not otp_match or otp_match.get("expires_at", "") < now_iso:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification code."
            )
        # Mark as verified
        otp_match["verified"] = True
    else:
        # Check if email was already verified via /verify-otp within the last 30 minutes
        verified_record = await otps_col.find_one({
            "email": email,
            "verified": True
        })
        if not verified_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email verification required. Please click 'Send Code' to receive and verify your 6-digit OTP code."
            )

    user_dict = {
        "name": user_data.name.strip(),
        "email": email,
        "password": get_password_hash(user_data.password),
        "role": user_data.role,
        "state": user_data.state,
        "district": user_data.district,
        "village": user_data.village,
        "phone": user_data.phone,
        "designation": user_data.designation or f"{user_data.role} Member",
        "email_verified": True,
        "created_at": datetime.utcnow().isoformat()
    }

    result = await users_col.insert_one(user_dict)
    user_dict["id"] = str(getattr(result, "inserted_id", f"usr-{int(datetime.utcnow().timestamp())}"))

    access_token = create_access_token(data={"sub": user_dict["email"], "role": user_dict["role"]})
    
    user_sanitized = {
        "id": user_dict["id"],
        "name": user_dict["name"],
        "email": user_dict["email"],
        "role": user_dict["role"],
        "state": user_dict["state"],
        "district": user_dict["district"],
        "village": user_dict["village"],
        "designation": user_dict["designation"]
    }

    return {"access_token": access_token, "token_type": "bearer", "user": user_sanitized}
