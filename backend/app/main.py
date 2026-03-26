from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth_routes import router as auth_router
from app.api.station_routes import router as station_router
from app.api.wallet_routes import router as wallet_router
from app.api.ticket_routes import router as ticket_router
from app.api.admin_users import router as admin_users_router
from app.api.admin_refunds import router as admin_refunds_router
from app.api.admin_transactions import router as admin_tx_router
from app.api.admin_auth_routes import router as admin_auth_router
from app.api.admin_tickets import router as admin_tickets_router
from app.api.admin_stations import router as admin_stations_router

from app.database.db import engine, Base
from app.models.user import User
from app.models.ticket import Ticket
from app.models.station import Station
from app.models.transaction import Transaction
from app.models.admin import AdminAccount, AuditLog
from app.models.refund import Refund
from app.models.failed_transaction import FailedTransaction

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(station_router)
app.include_router(wallet_router)
app.include_router(ticket_router)
app.include_router(admin_users_router)
app.include_router(admin_refunds_router)
app.include_router(admin_tx_router)
app.include_router(admin_auth_router)
app.include_router(admin_tickets_router)
app.include_router(admin_stations_router)

@app.get("/")
def root():
    return {"message": "Metro Ticketing API Running"}