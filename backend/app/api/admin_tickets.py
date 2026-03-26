from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.db import get_db
from ..models.ticket import Ticket
from ..models.user import User
from ..utils.admin_auth import get_current_admin, require_mfa
from sqlalchemy.orm import aliased
from ..models.station import Station

router = APIRouter(prefix="/admin/tickets", tags=["admin-tickets"], dependencies=[Depends(get_current_admin)])

@router.get("/")
def get_all_tickets(db: Session = Depends(get_db), limit: int = 50, status: str = None):
    Source = aliased(Station)
    Dest = aliased(Station)
    
    query = db.query(
        Ticket.ticket_id, 
        Ticket.booked_at, 
        Ticket.valid_till, 
        Ticket.transaction_id,
        Ticket.fare,
        Ticket.exit_scanned,
        Ticket.is_revoked,
        User.phone.label("user_phone"),
        Source.name.label("origin"),
        Dest.name.label("destination")
    ).join(User, Ticket.user_id == User.id)\
     .join(Source, Ticket.source_station_id == Source.id)\
     .join(Dest, Ticket.destination_station_id == Dest.id)
     
    from datetime import datetime
    import pytz
    
    total_count = query.count()
    tickets = query.order_by(Ticket.booked_at.desc()).limit(limit).all()
    
    results = []
    now = datetime.utcnow().replace(tzinfo=pytz.UTC)
    for t in tickets:
        parsed_status = "active"
        if t.is_revoked:
            parsed_status = "revoked"
        elif t.exit_scanned:
            parsed_status = "used"
        elif t.valid_till and t.valid_till < now:
            parsed_status = "expired"
            
        if status and parsed_status != status:
            continue
            
        results.append({
            "id": str(t.ticket_id),
            "user_phone": t.user_phone,
            "origin": t.origin,
            "destination": t.destination,
            "fare": t.fare,
            "status": parsed_status,
            "created_at": str(t.booked_at),
            "expires_at": str(t.valid_till),
            "transaction_id": str(t.transaction_id) if t.transaction_id else None
        })
        
    return {"total": total_count, "tickets": results}

@router.post("/{ticket_id}/revoke")
def revoke_ticket(ticket_id: str, db: Session = Depends(get_db), mfa: bool = Depends(require_mfa)):
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    if ticket.exit_scanned:
         raise HTTPException(status_code=400, detail="Cannot revoke an already scanned/used ticket")
         
    # Backwards compatibility check incase Alembic migration isn't run yet
    if hasattr(ticket, 'is_revoked'):
        ticket.is_revoked = True
        
    db.commit()
    return {"message": "Ticket revoked successfully"}
