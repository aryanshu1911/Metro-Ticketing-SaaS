import os
from fastapi import Depends, HTTPException, status, Header
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from ..models.admin import AdminAccount
from ..database.db import get_db

ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY", "fallback_admin_secret_key_change_in_production")
ALGORITHM = "HS256"

def get_current_admin(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = authorization.split(" ")[1]
    
    try:
        payload = jwt.decode(token, ADMIN_SECRET_KEY, algorithms=[ALGORITHM])
        admin_id: str = payload.get("sub")
        if admin_id is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
        
    admin = db.query(AdminAccount).filter(AdminAccount.id == admin_id, AdminAccount.is_active == True).first()
    if admin is None:
        raise HTTPException(status_code=401, detail="Admin account is deactivated or not found")
        
    return admin

def require_mfa(x_mfa_token: str = Header(None)):
    """
    Middleware dependency to enforce re-authentication for critical actions.
    Stub implementation for the MVP upgrade.
    """
    if not x_mfa_token:
         raise HTTPException(
             status_code=status.HTTP_403_FORBIDDEN, 
             detail="MFA required for this action. Please provide X-MFA-Token."
         )
    # Verification logic would validate the short-lived MFA token against the admin session.
    # We return dummy success for now
    return True
