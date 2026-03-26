import asyncio
from sqlalchemy.orm import Session
from ..models.transaction import Transaction
from ..models.ticket import Ticket
from ..models.refund import Refund
from ..database.db import SessionLocal

async def reconcile_daily_transactions():
    """
    Finds debit transactions that do not have a corresponding Ticket.
    Auto-flags them for Refund.
    Runs asynchronously.
    """
    db: Session = SessionLocal()
    try:
        orphaned_txs = db.query(Transaction).outerjoin(Ticket, Transaction.id == Ticket.transaction_id)\
                         .filter(Transaction.type == "TICKET_BOOKING", 
                                 Transaction.amount < 0,
                                 Ticket.ticket_id == None, 
                                 Transaction.reconciled == False).all()
                         
        for tx in orphaned_txs:
            # Create a pending refund automatically if it doesn't exist
            existing_refund = db.query(Refund).filter(Refund.transaction_id == tx.id).first()
            if not existing_refund:
                refund = Refund(transaction_id=tx.id, user_id=tx.user_id, amount=abs(tx.amount), reason="Auto-reconciliation: Ticket generation failed")
                db.add(refund)
            # Reconcile so it's not checked again
            tx.reconciled = True
            
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Reconciliation Job Failed: {e}")
    finally:
        db.close()
