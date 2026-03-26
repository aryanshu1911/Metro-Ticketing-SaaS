from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.db import SessionLocal
from ..models.user import User
from ..utils.jwt_handler import create_access_token
from ..services.email_otp_service import send_email_otp
from passlib.context import CryptContext
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import jwt
from ..models.admin import AdminAccount
from ..utils.admin_auth import ADMIN_SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Schemas
class RegisterSchema(BaseModel):
    phone: str
    email: str

class VerifyOtpSchema(BaseModel):
    phone: str
    otp: str

class SetMpinSchema(BaseModel):
    phone: str
    mpin: str

class LoginSchema(BaseModel):
    phone: str
    mpin: str

# Routes
@router.post("/register")
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    from sqlalchemy import or_
    existing_users = db.query(User).filter(or_(User.phone == data.phone, User.email == data.email)).all()
    
    user = None
    for eu in existing_users:
        if not eu.is_deleted and getattr(eu, "mpin", None):
            err_msg = "Phone number already registered" if eu.phone == data.phone else "Email already registered"
            raise HTTPException(status_code=400, detail=err_msg)
        if eu.is_deleted:
            user = eu

    if user:
        # Revive soft-deleted or partially registered account
        user.is_deleted = False
        user.deleted_at = None
        user.mpin = None
        user.wallet_balance = 0
        user.phone = data.phone
        user.email = data.email
    else:
        # True New User
        user = User(phone=data.phone, email=data.email)
        db.add(user)
    
    otp = send_email_otp(data.email)
    if not otp:
        raise HTTPException(status_code=500, detail="Failed to send OTP")

    user.email_otp = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=5)
    db.commit()
    return {"message": "OTP sent to email. Please verify to proceed."}

@router.post("/verify-otp")
def verify_otp(data: VerifyOtpSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == data.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Strip any database-applied timezones to prevent naive-aware comparison crashes
    safe_expires_at = user.otp_expires_at.replace(tzinfo=None) if user.otp_expires_at else datetime.utcnow()
    
    if user.email_otp != data.otp or datetime.utcnow() > safe_expires_at:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    # Clear OTP after verification
    user.email_otp = None
    user.otp_expires_at = None
    db.commit()
    return {"message": "OTP verified. Now set your mPIN."}

@router.post("/set-mpin")
def set_mpin(data: SetMpinSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == data.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.mpin = pwd_context.hash(data.mpin)
    db.commit()
    
    token = create_access_token({"user_id": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "message": "Registration complete!"}

@router.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    # 1. Magic Admin Gateway Check
    if data.phone == "0000000000" and data.mpin == "0000":
        admin = db.query(AdminAccount).filter(AdminAccount.role == "superadmin").first()
        if admin:
            expire = datetime.utcnow() + timedelta(minutes=1440)
            token = jwt.encode({"sub": str(admin.id), "exp": expire}, ADMIN_SECRET_KEY, algorithm=ALGORITHM)
            return {
                "access_token": token, 
                "token_type": "bearer", 
                "is_admin": True,
                "email": admin.email
            }

    # 2. Standard User Login Flow
    user = db.query(User).filter(User.phone == data.phone).first()
    if not user or not user.mpin or not pwd_context.verify(data.mpin, user.mpin):
        raise HTTPException(status_code=400, detail="Invalid phone or mPIN")
    
    token = create_access_token({"user_id": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "is_admin": False}
