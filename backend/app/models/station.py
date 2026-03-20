from sqlalchemy import Column, String, Integer
from sqlalchemy.dialects.postgresql import UUID
import uuid
from ..database.db import Base

class Station(Base):
    __tablename__ = "stations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    order_index = Column(Integer, nullable=False)  # For distance-based fare calculation
