from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.db import get_db
from ..utils.admin_auth import get_current_admin, require_mfa
from ..models.refund import Refund
from ..models.transaction import Transaction
from ..models.admin import AuditLog
from ..models.user import User

router = APIRouter(prefix="/admin/refunds", tags=["Admin Refunds"])

@router.get("/")
def list_refunds(status: str = None, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    query = db.query(Refund)
    if status:
        query = query.filter(Refund.status == status)
    return {"refunds": query.all()}

@router.post("/{transaction_id}/process")
def process_manual_refund(
    transaction_id: str,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
    mfa=Depends(require_mfa)
):
    refund = db.query(Refund).filter(Refund.transaction_id == transaction_id).first()
    
    if not refund:
         # If refund entry doesn't exist, create it from transaction
         tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
         if not tx:
             raise HTTPException(status_code=404, detail="Transaction not found")
         refund = Refund(transaction_id=tx.id, user_id=tx.user_id, amount=tx.amount, reason="Manual admin refund")
         db.add(refund)
         db.flush()
         
    if refund.status == "completed":
        raise HTTPException(status_code=400, detail="Refund already completed")
    
    # Simulate processing gateway refund here
    gateway_success = True 
    
    if gateway_success:
        refund.status = "completed"
        # Option to refund to internal wallet instead of payment source
        user = db.query(User).filter(User.id == refund.user_id).first()
        if user:
            user.wallet_balance += refund.amount
    else:
        refund.status = "failed"
        
    refund.processed_by = admin.id
    
    audit = AuditLog(admin_id=admin.id, action=f"refund_{refund.status}", entity_type="refund", entity_id=str(refund.id))
    db.add(audit)
    db.commit()
    return {"status": refund.status, "refund": refund}
