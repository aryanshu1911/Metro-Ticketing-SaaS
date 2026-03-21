# Metro Ticketing SaaS

A modern, full-stack Metro Ticketing System designed as a Software as a Service (SaaS). It provides a seamless experience for users to book tickets, manage their digital wallet, and use QR-based e-tickets for metro travel.

## 🚀 Features

- **User Authentication**: Secure JWT-based login/registration with mPIN.
- **Digital Wallet**: In-app wallet for quick ticket payments.
- **UPI Integration**: Simulated UPI payment flow for wallet recharge and direct ticketing.
- **Smart Booking**: Select source and destination stations with automatic fare calculation.
- **E-Tickets**: Dynamic QR code generation for tickets with 1-hour validity.
- **Ticket History**: Track past bookings and transaction history.
- **Responsive Dashboard**: Beautiful UI for quick access to all features.

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Security**: Python-JOSE (JWT), Passlib (Bcrypt)
- **Utilities**: QRCode, Pydantic, Dotenv

### Frontend
- **Framework**: React.js (via Vite)
- **Routing**: React Router DOM v6
- **Icons/UI**: Custom CSS with modern aesthetics (Glassmorphism)
- **API Client**: Fetch / Custom API Wrapper

## 📥 Installation

### Prerequisites
- Python 3.10 or higher
- Node.js (v18+) and npm
- PostgreSQL

### 1. Backend Setup
1. Navigate to the backend folder: `cd backend`
2. Create a virtual environment: `python -m venv venv`
3. Activate the venv:
   - Windows: `.\venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Configure `.env` in the root directory with your PostgreSQL credentials.

### 2. Frontend Setup
1. Navigate to the frontend folder: `cd frontend`
2. Install dependencies: `npm install`

## 🏃 Running the Application

### Start Backend
```bash
cd backend
uvicorn app.main:app --reload
```

### Start Frontend
```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`.
