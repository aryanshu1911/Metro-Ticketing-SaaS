import sys
import os
from sqlalchemy import text
from app.database.db import engine

def migrate_and_seed():
    lines = {
        "Line 1": ["Ghatkopar", "Jagruti Nagar", "Asalpha", "Saki Naka", "Marol Naka", "Airport Road", "Chakala", "Western Express Highway", "Andheri", "Azad Nagar", "D.N. Nagar", "Versova"],
        "Line 2A": ["Dahisar East", "Anand Nagar", "Kandarpada", "Mandapeshwar", "Eksar", "Borivali West", "Pahadi Eksar", "Kandivali West", "Dhanukarwadi", "Valnai", "Mith Chowki", "Lower Malad", "Lower Oshiwara", "Oshiwara", "Goregaon West", "Bangur Nagar", "D.N. Nagar"],
        "Line 7": ["Dahisar East", "Ovaripada", "National Park", "Devipada", "Magathane", "Poisar", "Akurli", "Kurar", "Dindoshi", "Aarey", "JVLR", "Shankarwadi", "Mogra", "Gundavali"],
        "Line 3": ["Aarey Colony", "SEEPZ", "MIDC", "Marol Naka", "CSMIA T2", "Sahar Road", "CSMIA T1", "Santacruz", "Vidyanagari", "BKC", "Dharavi", "Shitladevi", "Dadar", "Siddhivinayak", "Worli", "Acharya Atre Chowk", "Science Museum", "Mahalaxmi", "Mumbai Central", "Grant Road", "Girgaon", "Kalbadevi", "CSMT", "Hutatma Chowk", "Churchgate", "Vidhan Bhavan", "Cuffe Parade"]
    }

    with engine.connect() as conn:
        print("Skipping schema migration (already done).")

        print("Seeding stations for all lines...")
        import uuid
        for line_name, station_list in lines.items():
            for i, name in enumerate(station_list):
                # Check by name and line
                res = conn.execute(text("SELECT id FROM stations WHERE name = :name AND line = :line"), {"name": name, "line": line_name})
                row = res.fetchone()
                
                if row:
                    # Station exists with this name and line, update order_index if needed
                    conn.execute(text("UPDATE stations SET order_index = :idx WHERE id = :id"), {"idx": i, "id": row[0]})
                else:
                    # Try to find by (line, order_index) to handle RENAMES
                    res = conn.execute(text("SELECT id, name FROM stations WHERE line = :line AND order_index = :idx"), {"line": line_name, "idx": i})
                    row = res.fetchone()
                    if row:
                        old_name = row[1]
                        print(f"Renaming station: {old_name} -> {name} ({line_name})")
                        conn.execute(text("UPDATE stations SET name = :name WHERE id = :id"), {"name": name, "id": row[0]})
                    else:
                        # New station
                        print(f"Adding station: {name} ({line_name})")
                        conn.execute(text(
                            "INSERT INTO stations (id, name, line, order_index) VALUES (:id, :name, :line, :idx)"
                        ), {"id": str(uuid.uuid4()), "name": name, "line": line_name, "idx": i})
        
        # Finally, delete old orphans that are no longer in our 'lines' dict
        # (This is safer than a full truncate)
        # For now, we skip it to be safe about FKs, or we can just leave them.
        
        conn.commit()
        print("SUCCESS: Comprehensive station seeding complete.")

if __name__ == "__main__":
    migrate_and_seed()
