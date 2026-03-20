from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.db import get_db
from ..models.ticket import Ticket
from ..models.user import User
from ..models.station import Station
from ..services.fare_service import calculate_fare
from pydantic import BaseModel
from datetime import datetime, timedelta
import uuid

router = APIRouter(prefix="/tickets", tags=["tickets"])

class BookingSchema(BaseModel):
    phone: str
    source_station_id: str
    destination_station_id: str

@router.post("/book")
def book_ticket(data: BookingSchema, db: Session = Depends(get_db)):
    # 1. Get user
    user = db.query(User).filter(User.phone == data.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 2. Get stations
    source = db.query(Station).filter(Station.id == data.source_station_id).first()
    dest = db.query(Station).filter(Station.id == data.destination_station_id).first()
    if not source or not dest:
        raise HTTPException(status_code=404, detail="Station not found")
    
    # 3. Calculate fare
    fare = calculate_fare(source.order_index, dest.order_index)
    
    # 4. Check balance
    if user.wallet_balance < fare:
        raise HTTPException(status_code=400, detail=f"Insufficient balance. Needed: {fare}, Current: {user.wallet_balance}")
    
    # 5. Deduct balance
    user.wallet_balance -= fare
    
    # 6. Create ticket
    new_ticket = Ticket(
        user_id=user.id,
        source_station_id=source.id,
        destination_station_id=dest.id,
        fare=fare,
        qr_code=str(uuid.uuid4()), # Simplified QR for now
        valid_till=datetime.utcnow() + timedelta(hours=3)
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    
    return {
        "message": "Ticket booked successfully",
        "ticket_id": str(new_ticket.ticket_id),
        "fare": fare,
        "new_balance": user.wallet_balance,
        "qr_code": new_ticket.qr_code
    }

@router.post("/scan-entry/{ticket_id}")
def scan_entry(ticket_id: str, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if ticket.entry_scanned:
        raise HTTPException(status_code=400, detail="Ticket already used for entry")
    
    ticket.entry_scanned = True
    db.commit()
    return {"message": "Entry scanned successfully. Welcome!"}

@router.post("/scan-exit/{ticket_id}")
def scan_exit(ticket_id: str, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if not ticket.entry_scanned:
        raise HTTPException(status_code=400, detail="Ticket must be scanned for entry first")
    if ticket.exit_scanned:
        raise HTTPException(status_code=400, detail="Ticket already used for exit")
    
    ticket.exit_scanned = True
    db.commit()
    return {"message": "Exit scanned successfully. Goodbye!"}
