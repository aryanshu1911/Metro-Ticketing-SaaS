from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.db import get_db
from ..utils.admin_auth import get_current_admin
from ..models.transaction import Transaction

router = APIRouter(prefix="/admin/transactions", tags=["Admin Transactions"])

@router.get("/")
def list_transactions(reconciled: bool = None, limit: int = 100, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    query = db.query(Transaction).order_by(Transaction.timestamp.desc())
    if reconciled is not None:
        query = query.filter(Transaction.reconciled == reconciled)
        
    total = query.count()
    transactions = query.limit(limit).all()
    return {
        "total": total,
        "transactions": [tx.to_dict() for tx in transactions]
    }

@router.post("/{transaction_id}/reconcile")
def manual_reconcile(
    transaction_id: str,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    tx.reconciled = True
    db.commit()
    
    return {"msg": "Transaction reconciled manually"}
