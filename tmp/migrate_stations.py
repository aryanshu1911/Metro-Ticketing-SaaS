from app.database.db import engine
from sqlalchemy import text

def add_is_interchange_column():
    with engine.connect() as conn:
        try:
            # Check if column already exists (basic check)
            conn.execute(text("ALTER TABLE stations ADD COLUMN is_interchange BOOLEAN DEFAULT FALSE"))
            conn.commit()
            print("Successfully added is_interchange column.")
            
            # Set default true for known interchanges
            interchanges = ['D.N. Nagar', 'Marol Naka', 'Dahisar East', 'Andheri', 'Ghatkopar']
            for name in interchanges:
                conn.execute(text(f"UPDATE stations SET is_interchange = TRUE WHERE name = '{name}'"))
            conn.commit()
            print("Updated known interchanges.")
            
        except Exception as e:
            print(f"Error (column might already exist): {e}")

if __name__ == "__main__":
    add_is_interchange_column()
