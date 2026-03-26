from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from ..database.db import Base

class AdminAccount(Base):
    __tablename__ = "admin_accounts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    mpin_hash = Column(String(128), nullable=True) # 2FA for critical actions
    role = Column(String(50), default="support") # superadmin, support, finance
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    admin_id = Column(UUID(as_uuid=True), ForeignKey("admin_accounts.id"), nullable=True)
    action = Column(String(255), nullable=False) 
    entity_type = Column(String(50), nullable=False) # e.g., 'user', 'refund', 'station'
    entity_id = Column(String(255), nullable=False)
    details = Column(Text, nullable=True) # JSON string of changes
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
