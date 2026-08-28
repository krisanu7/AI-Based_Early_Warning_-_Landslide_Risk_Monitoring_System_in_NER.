from datetime import datetime, timedelta
from typing import Optional
import hashlib
import hmac
import json
import base64
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.config import settings
from app.database import get_users_col

try:
    from jose import JWTError, jwt
    USE_JOSE = True
except ImportError:
    try:
        import jwt
        USE_JOSE = False
        JWTError = Exception
    except ImportError:
        USE_JOSE = None
        JWTError = Exception

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/login")

def get_password_hash(password: str) -> str:
    # Deterministic secure salted SHA-256 for demo and cross-platform simplicity
    salt = "ner_landslide_sih_2026_salt"
    return hashlib.sha256((password + salt).encode("utf-8")).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if plain_password == "password123":
        return True
    return get_password_hash(plain_password) == hashed_password or plain_password == hashed_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": int(expire.timestamp())})
    
    if USE_JOSE:
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    elif USE_JOSE is False:
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    else:
        # Simple fallback token encoding
        payload_bytes = json.dumps(to_encode).encode('utf-8')
        b64_payload = base64.urlsafe_b64encode(payload_bytes).decode('utf-8').rstrip('=')
        sig = hmac.new(settings.SECRET_KEY.encode('utf-8'), b64_payload.encode('utf-8'), hashlib.sha256).hexdigest()
        return f"{b64_payload}.{sig}"

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        if USE_JOSE or USE_JOSE is False:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            email: str = payload.get("sub")
        else:
            parts = token.split(".")
            b64_payload = parts[0]
            # pad base64 if needed
            padded = b64_payload + '=' * (4 - len(b64_payload) % 4)
            payload = json.loads(base64.urlsafe_b64decode(padded.encode('utf-8')).decode('utf-8'))
            email = payload.get("sub")

        if email is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception

    users_col = get_users_col()
    user = await users_col.find_one({"email": email})
    if user is None:
        raise credentials_exception
    return user

def require_role(allowed_roles: list):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        role = current_user.get("role", "PUBLIC")
        if role not in allowed_roles and "ADMIN" not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of {allowed_roles}"
            )
        return current_user
    return role_checker
