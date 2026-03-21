# 🚉 Metro Ticketing Platform (SaaS)

This Metro Ticketing System is a modern, all-in-one platform built to make city travel easier for everyone. Think of it as a digital companion for your daily commute. Whether you're topping up your in-app wallet, checking out the real-time Mumbai Metro map, or using a dynamic QR code to skip the ticket lines, everything is designed to be seamless. Built with reliable tech like FastAPI and React, we ensure your payments are secure and your tickets are always ready when you need them. It's not just a ticketing app; it's a complete Software-as-a-Service (SaaS) solution for a smarter, smoother city life.

---

## ✨ Key Features

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

---

## 📡 API Reference

### 🔐 Authentication
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/auth/register` | `POST` | Register a new user with phone & mPIN. |
| `/auth/token` | `POST` | Exchange credentials for a JWT. |

### 🎫 Ticketing
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/stations/` | `GET` | Fetch all stations for a specific line. |
| `/tickets/book` | `POST` | Issue a new e-ticket (debits wallet). |
| `/tickets/history/{phone}` | `GET` | Retrieve user's travel history. |

### 💳 Wallet
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/wallet/balance/{phone}` | `GET` | Get current wallet balance. |
| `/wallet/topup` | `POST` | Recharge wallet via simulated UPI. |

---

## ⚙️ Configuration

Create a `.env` file in the root directory and populate it with the following:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `POSTGRES_USER` | PostgreSQL Username | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL Password | `yourpassword` |
| `POSTGRES_DB` | Database Name | `metro_db` |
| `POSTGRES_HOST` | Database Host | `localhost` |
| `POSTGRES_PORT` | Database Port | `5432` |
| `SECRET_KEY` | JWT Secret Key | `your_super_secret_key` |
| `ALGORITHM` | JWT Hashing Algorithm | `HS256` |

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
