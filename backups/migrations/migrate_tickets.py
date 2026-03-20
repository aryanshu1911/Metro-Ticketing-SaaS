from sqlalchemy import text
from app.database.db import engine

def migrate_tickets():
    with engine.connect() as conn:
        print("Ensuring tickets table exists...")
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS tickets (
                ticket_id UUID PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES users(id),
                qr_code VARCHAR NOT NULL,
                entry_scanned BOOLEAN DEFAULT FALSE,
                exit_scanned BOOLEAN DEFAULT FALSE,
                booked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                valid_till TIMESTAMP WITH TIME ZONE NOT NULL
            )
        """))
        
        print("Adding route-specific columns...")
        conn.execute(text("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS source_station_id UUID REFERENCES stations(id)"))
        conn.execute(text("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS destination_station_id UUID REFERENCES stations(id)"))
        conn.execute(text("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS fare INTEGER"))
        conn.commit()
        print("SUCCESS: Ticket migration complete.")

if __name__ == "__main__":
    migrate_tickets()
