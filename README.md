# Metro Ticketing SaaS

A modern, full-stack Metro Ticketing System designed as a Software as a Service (SaaS). It provides a seamless experience for users to book tickets, manage their digital wallet, and use QR-based e-tickets for metro travel.

## 🚀 Key Features

- **Hardened Digital Wallet**: Strictly validated top-ups with integrated UPI fallback and backend-led transaction logging.
- **Precision E-Tickets**: "Official Digital Pass" tickets with dynamic QR generation, Mumbai Metro sync, and 1-hour validity.
- **Interactive Network Map**: Real-time, multi-line map with Terminal/Interchange indicators and professional transit aesthetics.
- **Unified Activity Passbook**: A centralized dashboard for tracking both Travel Logs (Tickets) and Financial Records (Top-ups).
- **Secure Authentication**: Robust JWT-based registration system with mandatory secondary mPIN protection.
- **Premium UI/UX**: High-contrast, mobile-first design system with Glassmorphism and seamless light/dark mode support.

## 🛠️ Tech Stack

| Layer          | Technology                          | Key Purpose / Feature                   |
|----------------|-------------------------------------|-----------------------------------------|
| **Backend**    | FastAPI (Python 3.10+)              | High-performance asynchronous API       |
| **Database**   | PostgreSQL                          | Robust Relational Data Storage         |
| **ORM**        | SQLAlchemy                          | Secure Database Interaction & Models   |
| **Security**   | Python-JOSE & Passlib               | JWT Authentication & mPIN Hashing      |
| **Frontend**   | React.js (Vite)                     | Modern, Reactive User Interface        |
| **Animation**  | Framer Motion                       | Premium Micro-animations & Transitions |
| **Styling**    | Custom CSS                          | Glassmorphism & System Theme Support   |
| **API Client** | Axios / Custom Wrapper              | Standardized Backend Communication     |

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

