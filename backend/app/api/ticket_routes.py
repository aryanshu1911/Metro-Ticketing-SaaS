from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.db import get_db
from ..models.ticket import Ticket
from ..models.user import User
from ..models.station import Station
from ..services.fare_service import calculate_fare
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import uuid

router = APIRouter(prefix="/tickets", tags=["tickets"])

class BookingSchema(BaseModel):
    phone: str
    source_station_id: str
    destination_station_id: str
    passengers: int = 1
    journey_type: str = "single"
    payment_method: str = "wallet"  # 'wallet' or 'upi'

@router.post("/book")
def book_ticket(data: BookingSchema, db: Session = Depends(get_db)):
    # Get user
    user = db.query(User).filter(User.phone == data.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get stations
    source = db.query(Station).filter(Station.id == data.source_station_id).first()
    dest = db.query(Station).filter(Station.id == data.destination_station_id).first()
    if not source or not dest:
        raise HTTPException(status_code=404, detail="Station not found")
    
    # Calculate fare
    base_fare = calculate_fare(source.line, source.order_index, dest.line, dest.order_index)
    total_fare = base_fare * data.passengers * (2 if data.journey_type == "return" else 1)
    
    # Check & Deduct Balance (Only if paying via wallet)
    if data.payment_method == "wallet":
        if user.wallet_balance < total_fare:
            raise HTTPException(status_code=400, detail=f"Insufficient wallet balance. Needed: {total_fare}, Current: {user.wallet_balance}")
        user.wallet_balance -= total_fare
    
    # Create ticket with 1-hour validity
    validity_duration = timedelta(hours=1)
    new_ticket = Ticket(
        user_id=user.id,
        source_station_id=source.id,
        destination_station_id=dest.id,
        passengers=data.passengers,
        journey_type=data.journey_type,
        fare=total_fare,
        qr_code=str(uuid.uuid4()),
        valid_till=datetime.now(timezone.utc) + validity_duration
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    
    return {
        "message": "Ticket booked successfully",
        "ticket_id": str(new_ticket.ticket_id),
        "fare": total_fare,
        "new_balance": user.wallet_balance,
        "qr_code": new_ticket.qr_code,
        "booked_at": new_ticket.booked_at,
        "valid_till": new_ticket.valid_till
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

@router.get("/{ticket_id}")
def get_ticket(ticket_id: str, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Get station names for convenience
    source = db.query(Station).filter(Station.id == ticket.source_station_id).first()
    dest = db.query(Station).filter(Station.id == ticket.destination_station_id).first()

    return {
        "ticket_id": str(ticket.ticket_id),
        "source_name": f"{source.line}: {source.name}" if source else "Unknown",
        "destination_name": f"{dest.line}: {dest.name}" if dest else "Unknown",
        "fare": ticket.fare,
        "qr_code": ticket.qr_code,
        "passengers": ticket.passengers,
        "journey_type": ticket.journey_type,
        "entry_scanned": ticket.entry_scanned,
        "exit_scanned": ticket.exit_scanned,
        "booked_at": ticket.booked_at,
        "valid_till": ticket.valid_till
    }

@router.get("/history/{phone}")
def get_user_history(phone: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    tickets = db.query(Ticket).filter(Ticket.user_id == user.id).order_by(Ticket.booked_at.desc()).all()
    
    res = []
    for t in tickets:
        source = db.query(Station).filter(Station.id == t.source_station_id).first()
        dest = db.query(Station).filter(Station.id == t.destination_station_id).first()
        res.append({
            "ticket_id": str(t.ticket_id),
            "source_name": f"{source.line}: {source.name}" if source else "Unknown",
            "destination_name": f"{dest.line}: {dest.name}" if dest else "Unknown",
            "fare": t.fare,
            "passengers": t.passengers,
            "journey_type": t.journey_type,
            "booked_at": t.booked_at,
            "valid_till": t.valid_till,
            "entry_scanned": t.entry_scanned
        })
    return res
