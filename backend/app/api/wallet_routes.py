from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.db import get_db
from ..models.user import User
from pydantic import BaseModel

from ..models.transaction import Transaction

router = APIRouter(prefix="/wallet", tags=["wallet"])

class TopUpSchema(BaseModel):
    phone: str
    amount: int

@router.get("/balance/{phone}")
def get_balance(phone: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"phone": phone, "balance": user.wallet_balance}

@router.post("/top-up")
def top_up(data: TopUpSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == data.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="Top-up amount must be greater than zero")
    
    user.wallet_balance += data.amount
    
    # Record transaction
    new_tx = Transaction(
        user_id=user.id,
        type="TOP_UP",
        amount=float(data.amount),
        description="Wallet Recharge (Top-up)"
    )
    db.add(new_tx)
    db.commit()
    db.refresh(user)
    return {"message": "Top-up successful", "new_balance": user.wallet_balance}

@router.get("/transactions/{phone}")
def get_transactions(phone: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    txs = db.query(Transaction).filter(Transaction.user_id == user.id).order_by(Transaction.timestamp.desc()).all()
    return [tx.to_dict() for tx in txs]
