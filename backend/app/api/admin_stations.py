from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database.db import get_db
from ..models.station import Station
from ..utils.admin_auth import get_current_admin, require_mfa

router = APIRouter(prefix="/admin/stations", tags=["Admin Stations"])

class StationCreate(BaseModel):
    name: str
    line: str
    order_index: int
    is_interchange: bool = False

def normalize_line(line_name: str, db: Session):
    stations = db.query(Station).filter(Station.line == line_name).order_by(Station.order_index, Station.name).all()
    for i, s in enumerate(stations):
        s.order_index = i
    db.commit()

@router.post("/")
def create_station(data: StationCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    # 1. Shift existing stations on the same line to make room
    db.query(Station).filter(
        Station.line == data.line,
        Station.order_index >= data.order_index
    ).update({Station.order_index: Station.order_index + 1})
    
    # 2. Check for duplicate Name+Line (unique constraint safety)
    existing = db.query(Station).filter(Station.name == data.name, Station.line == data.line).first()
    if existing:
        db.rollback()
        raise HTTPException(status_code=400, detail="Station already exists on this line")
    
    new_station = Station(
        name=data.name,
        line=data.line,
        order_index=data.order_index,
        is_interchange=data.is_interchange
    )
    db.add(new_station)
    db.commit()
    
    # 3. Final Normalize to resolve any pre-existing or shift-induced collisions
    normalize_line(data.line, db)
    db.refresh(new_station)
    return new_station

@router.delete("/{station_id}")
def delete_station(station_id: str, db: Session = Depends(get_db), admin=Depends(get_current_admin), mfa=Depends(require_mfa)):
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    
    line_to_fix = station.line
    db.delete(station)
    db.commit()
    
    # Normalize line after deletion to close the gap
    if line_to_fix:
        normalize_line(line_to_fix, db)
        
    return {"message": "Station deleted successfully"}
