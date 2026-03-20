import sys
import os
from sqlalchemy import text
from app.database.db import engine

def migrate_and_seed():
    stations = [
        "Versova", "D.N. Nagar", "Azad Nagar", "Andheri", 
        "Western Express Highway", "Chakala", "Airport Road", 
        "Marol Naka", "Saki Naka", "Asalpha", "Jagruti Nagar", "Ghatkopar"
    ]

    with engine.connect() as conn:
        print("Creating stations table if not exists...")
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS stations (
                id UUID PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                order_index INTEGER NOT NULL
            )
        """))
        
        print("Seeding stations...")
        for i, name in enumerate(stations):
            # Check if exists
            res = conn.execute(text("SELECT id FROM stations WHERE name = :name"), {"name": name})
            if not res.fetchone():
                import uuid
                conn.execute(text(
                    "INSERT INTO stations (id, name, order_index) VALUES (:id, :name, :idx)"
                ), {"id": str(uuid.uuid4()), "name": name, "idx": i})
                print(f"Added station: {name}")
        
        conn.commit()
        print("SUCCESS: Station migration and seeding complete.")

if __name__ == "__main__":
    migrate_and_seed()
