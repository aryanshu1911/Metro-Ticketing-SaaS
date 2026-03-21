from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database.db import get_db
from ..models.station import Station

router = APIRouter(prefix="/stations", tags=["stations"])

@router.get("/")
def get_stations(line: str = None, db: Session = Depends(get_db)):
    query = db.query(Station)
    if line:
        query = query.filter(Station.line == line)
    return query.order_by(Station.order_index).all()
