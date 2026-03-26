import sys
import os
import bcrypt

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.db import SessionLocal
from app.models.admin import AdminAccount

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def seed_admin():
    db = SessionLocal()
    email = "admin@metro.com"
    password = "secureadmin123"
    
    existing = db.query(AdminAccount).filter(AdminAccount.email == email).first()
    if existing:
        print(f"Admin {email} already exists.")
        db.close()
        return

    admin = AdminAccount(
        email=email,
        password_hash=hash_password(password),
        role="superadmin"
    )
    db.add(admin)
    db.commit()
    print(f"Superadmin created successfully!\nEmail: {email}\nPassword: {password}")
    db.close()

if __name__ == "__main__":
    seed_admin()
