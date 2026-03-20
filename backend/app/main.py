from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth_routes import router as auth_router
from app.api.station_routes import router as station_router
from app.api.wallet_routes import router as wallet_router
from app.api.ticket_routes import router as ticket_router

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

@app.get("/")
def root():
    return {"message": "Metro Ticketing API Running"}