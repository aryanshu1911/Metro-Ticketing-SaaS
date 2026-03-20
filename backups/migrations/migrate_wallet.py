from sqlalchemy import text
from app.database.db import engine

def migrate_wallet():
    with engine.connect() as conn:
        print("Adding wallet_balance to users if not exists...")
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_balance INTEGER DEFAULT 0"))
        conn.commit()
        print("SUCCESS: Wallet migration complete.")

if __name__ == "__main__":
    migrate_wallet()
