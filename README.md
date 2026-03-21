# 🚉 Metro Ticketing SaaS

A modern, full-stack Metro Ticketing System designed for high-performance transit operations.  
Built with **FastAPI**, **React**, and **PostgreSQL**.

---

## 🚀 Key Features

- 💠 **Hardened Digital Wallet**: Strictly validated top-ups with integrated UPI fallback and backend-led transaction logging.
- 🎫 **Precision E-Tickets**: "Official Digital Pass" tickets with dynamic QR generation and 1-hour validity.
- 🗺️ **Interactive Network Map**: Real-time, multi-line map with Terminal/Interchange indicators and professional transit aesthetics.
- 📖 **Unified Activity Passbook**: A centralized dashboard for tracking both Travel Logs (Tickets) and Financial Records (Top-ups).
- 🔐 **Secure Authentication**: Robust JWT-based registration system with mandatory secondary mPIN protection.
- 🎨 **Premium UI/UX**: High-contrast, mobile-first design system with Glassmorphism and seamless light/dark mode support.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite) + Framer Motion
- **Backend**: FastAPI (Python 3.10+) 
- **Database**: PostgreSQL + SQLAlchemy 
- **Security**: JWT (JSON Web Tokens) 
- **Styling**: Vanilla CSS (Modern Glassmorphism) 
- **API Client**: Axios

---

## 📥 Installation

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Activate venv: .\venv\Scripts\activate (Windows) or source venv/bin/activate (Mac)
pip install -r requirements.txt
```
> [!IMPORTANT]
> Configure `.env` in the root directory with your PostgreSQL credentials.

### 2. Frontend Setup
```bash
cd frontend
npm install
```

---

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

---

💡 **Tip**: Full detailed project structure can be found in [structure.txt](structure.txt).
