from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from ..database.db import Base

class FailedTransaction(Base):
    __tablename__ = "failed_transactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    original_tx_id = Column(String(255), nullable=True) # Gateway ref if any
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    endpoint = Column(String(255), nullable=False) # e.g., '/tickets/book'
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
