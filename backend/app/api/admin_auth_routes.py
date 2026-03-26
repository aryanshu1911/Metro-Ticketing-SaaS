from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database.db import get_db
from ..models.admin import AdminAccount
from ..utils.admin_auth import ADMIN_SECRET_KEY, ALGORITHM
from pydantic import BaseModel
from jose import jwt
from datetime import datetime, timedelta
import bcrypt

router = APIRouter(prefix="/admin/auth", tags=["Admin Auth"])

class AdminLoginSchema(BaseModel):
    email: str
    password: str

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

@router.post("/login")
def admin_login(data: AdminLoginSchema, db: Session = Depends(get_db)):
    admin = db.query(AdminAccount).filter(AdminAccount.email == data.email).first()
    
    if not admin or not admin.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials or inactive account")
        
    if not verify_password(data.password, admin.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        
    # Create JWT
    expire = datetime.utcnow() + timedelta(hours=12)
    to_encode = {"sub": str(admin.id), "role": admin.role, "exp": expire}
    
    encoded_jwt = jwt.encode(to_encode, ADMIN_SECRET_KEY, algorithm=ALGORITHM)
    
    return {
        "access_token": encoded_jwt,
        "token_type": "bearer",
        "email": admin.email,
        "role": admin.role
    }
