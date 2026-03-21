from sqlalchemy import Column, String, Integer, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
import uuid
from ..database.db import Base

class Station(Base):
    __tablename__ = "stations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    line = Column(String(50), nullable=True) # Line 1, Line 2A, Line 7, Line 3.
    order_index = Column(Integer, nullable=False)  # For distance-based fare calculation

    __table_args__ = (
        UniqueConstraint('name', 'line', name='_name_line_uc'),
    )
