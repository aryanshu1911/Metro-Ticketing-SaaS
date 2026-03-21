from sqlalchemy import text
from app.database.db import engine

def clear_data():
    with engine.connect() as conn:
        print("Clearing tickets and transactions...")
        
        # Disable foreign key checks isn't needed for these two as they don't depend on each other,
        # but they depend on users and stations.
        # We just want to empty them.
        
        conn.execute(text("DELETE FROM tickets"))
        conn.execute(text("DELETE FROM transactions"))
        conn.execute(text("UPDATE users SET wallet_balance = 0"))
        
        conn.commit()
        print("SUCCESS: All tickets, transactions, and wallet balances have been cleared.")

if __name__ == "__main__":
    clear_data()
