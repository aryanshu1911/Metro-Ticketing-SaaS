from sqlalchemy import Column, String, Integer, Boolean, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
import uuid
from ..database.db import Base

class Station(Base):
    __tablename__ = "stations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    line = Column(String(50), nullable=True) # Line 1, Line 2A, Line 7, Line 3.
    order_index = Column(Integer, default=0)  # For distance-based fare calculation
    is_interchange = Column(Boolean, default=False)

    __table_args__ = (
        UniqueConstraint('name', 'line', name='_station_line_uc'),
    )
