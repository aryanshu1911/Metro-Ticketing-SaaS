from sqlalchemy import Column, String, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from ..database.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone = Column(String(15), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    mpin = Column(String(128), nullable=True)  # hashed mPIN
    email_otp = Column(String(6), nullable=True)
    otp_expires_at = Column(DateTime(timezone=True), nullable=True)
    wallet_balance = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())