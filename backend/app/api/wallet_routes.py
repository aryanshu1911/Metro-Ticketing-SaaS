from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.db import get_db
from ..models.user import User
from pydantic import BaseModel

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
    
    user.wallet_balance += data.amount
    db.commit()
    db.refresh(user)
    return {"message": "Top-up successful", "new_balance": user.wallet_balance}
