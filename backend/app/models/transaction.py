from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid
from ..database.db import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # 'TOP_UP' or 'TICKET_BOOKING'
    type = Column(String(50), nullable=False)
    
    amount = Column(Float, nullable=False)
    
    # Simple description like "Wallet Recharge" or "Ghatkopar ➔ Versova"
    description = Column(Text, nullable=True)
    
    # Optional: For future Razorpay/Stripe integration
    payment_id = Column(String(255), nullable=True)
    
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "type": self.type,
            "amount": self.amount,
            "description": self.description,
            "payment_id": self.payment_id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }
