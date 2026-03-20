from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database.db import get_db
from ..models.station import Station

router = APIRouter(prefix="/stations", tags=["stations"])

@router.get("/")
def get_stations(db: Session = Depends(get_db)):
    stations = db.query(Station).order_by(Station.order_index).all()
    return stations
