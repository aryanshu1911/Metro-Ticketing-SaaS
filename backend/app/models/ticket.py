from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from ..database.db import Base
from ..models.station import Station

class Ticket(Base):
    __tablename__ = "tickets"

    ticket_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    source_station_id = Column(UUID(as_uuid=True), ForeignKey("stations.id"), nullable=False)
    destination_station_id = Column(UUID(as_uuid=True), ForeignKey("stations.id"), nullable=False)
    passengers = Column(Integer, default=1)
    journey_type = Column(String, default="single")
    fare = Column(Integer, nullable=False)
    qr_code = Column(String, nullable=False)
    entry_scanned = Column(Boolean, default=False)
    exit_scanned = Column(Boolean, default=False)
    booked_at = Column(DateTime(timezone=True), server_default=func.now())
    valid_till = Column(DateTime(timezone=True), nullable=False)