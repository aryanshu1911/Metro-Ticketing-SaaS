from sqlalchemy import text
from app.database.db import engine

def migrate_extra():
    with engine.connect() as conn:
        print("Adding new columns to tickets...")
        conn.execute(text("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS passengers INTEGER DEFAULT 1"))
        conn.execute(text("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS journey_type VARCHAR DEFAULT 'single'"))
        conn.commit()
        print("SUCCESS")

if __name__ == "__main__":
    migrate_extra()
