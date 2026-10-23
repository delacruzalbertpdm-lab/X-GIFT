# 🎁 Krismon — Exchange Gift System (Secret Santa / Kris Kringle)

A modern, high-aesthetic web application for organizing Gift Exchanges. Built with **Django REST Framework** (backend) and **React.js + Vite** (frontend), pre-configured for seamless deployment with **Supabase PostgreSQL**.

---

## 🌟 Key Features

### 👤 1. User Experience & Flow
1. **Instant Lucky Number Assignment**:
   - Every participant who registers is automatically assigned a unique, random draw number (e.g., `#4682`, `#8999`).
   - The user immediately sees their assigned number on their celebratory registration banner and official draw ticket.
2. **Wishlist Management**:
   - Participants can add as many wishlist items as they wish.
   - Each item includes: **Title**, **Priority Level** (🌟 Top Priority, ✨ Nice to Have, 🎁 Alternative), **Target Budget / Price Range**, and **Store URL** (Shopee, Lazada, Amazon, etc.).
   - Edit and delete items anytime.
3. **Interactive Lucky Draw**:
   - Once a user adds at least 1 wishlist item, the Lucky Draw unlocks.
   - Features a thrilling **roulette number spinner** and **celebratory confetti**.
   - The system randomly selects another registered participant's number (guaranteed not oneself).
   - Instantly reveals the drawn user's **number** and **their full wishlist** so the giver knows exactly what to buy!

### 👑 2. Admin Monitoring Center
- **Live Statistics**:
  - Total registered users
  - Total wishlist items listed
  - Matched / drawn participants
  - Pending / unmatched participants
- **Roster & Wishlist Inspection**:
  - Table of all participants with their assigned lucky numbers.
  - "Inspect Wishlist" button to view any participant's wishes in a modal without leaving the dashboard.
  - See who is giving gifts to whom.
- **Admin Controls**:
  - 🎲 **Auto-Match All**: Automatically runs a circular derangement algorithm (Secret Santa closed loop) matching everyone fairly with zero self-picks.
  - 🔄 **Reset Matches**: Reset matches individually or for all participants at once.
  - 🗑️ **Delete Participant**: Remove test or inactive users.

---

## 🚀 Quick Start (Local Development)

### 1. Active Workspace Recommendation
Open the project directory in your IDE:
```
C:\Users\USER1\.gemini\antigravity-ide\scratch\exchange-gift-system
```

### 2. Backend (Django)
```powershell
cd C:\Users\USER1\.gemini\antigravity-ide\scratch\exchange-gift-system\backend
..\venv\Scripts\activate

# Run database migrations
python manage.py migrate

# Seed sample demo users & admin (Optional)
python manage.py seed_demo_data

# Start the backend server (runs on port 8000)
python manage.py runserver 127.0.0.1:8000
```

### 3. Frontend (React.js + Vite)
```powershell
cd C:\Users\USER1\.gemini\antigravity-ide\scratch\exchange-gift-system\frontend

# Install dependencies (already installed)
npm install

# Start Vite dev server (runs on port 5173)
npm run dev
```

Visit **http://127.0.0.1:5173/** in your browser.

---

## 🔑 Demo Accounts

| Role | Username | Password | Notes |
|---|---|---|---|
| **Admin** | `admin` | `admin123` | Full access to Admin Monitor |
| **Participant** | `maria_s` | `password123` | Seeded with 3 wishlist items |
| **Participant** | `juan_d` | `password123` | Seeded with 2 wishlist items |
| **Participant** | `claire_r` | `password123` | Seeded with 3 wishlist items |
| **Participant** | `mark_b` | `password123` | Seeded with 2 wishlist items |
| **New Users** | *(Any)* | *(Any)* | Register to get your own fresh lucky number! |

---

## ⚡ Connecting to Supabase (Production)

The backend is built with `dj-database-url` and `psycopg-binary`, so switching from local SQLite to Supabase PostgreSQL requires **zero code changes**:

1. Log into your [Supabase Dashboard](https://supabase.com).
2. Create a new project (e.g. `krismon-gift-exchange`).
3. Go to **Project Settings** ➡️ **Database** ➡️ **Connection URI**.
4. Select **Session Pooler** or **Transaction Pooler** and copy the URI:
   ```
   postgresql://postgres.[REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
   ```
5. In `backend/.env` (or in your production environment variables like Render/Railway/Fly.io):
   ```env
   DEBUG=False
   SECRET_KEY=your-secure-production-key
   ALLOWED_HOSTS=yourdomain.com,localhost
   DATABASE_URL=postgresql://postgres.[REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
   ```
6. Run migrations to initialize the Supabase tables:
   ```bash
   python manage.py migrate
   ```
7. Done! All participant numbers, wishlists, and matches will now be stored directly in Supabase PostgreSQL.
