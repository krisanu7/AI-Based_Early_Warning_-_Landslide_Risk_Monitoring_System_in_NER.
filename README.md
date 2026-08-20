# 💧 SwasthyaJal NER — Smart Community Health & Water-Borne Early Warning System

> **Smart India Hackathon (SIH 2026)**
> *Early Warning Surveillance System for Water-Borne Diseases in Rural Northeast India*

---

## 💻 Prerequisites (What to Download on a New Device)

Before running the project on a new laptop/PC, download and install these **3 free tools**:

1. **Node.js (v18 or higher)**
   - Download from: [https://nodejs.org/](https://nodejs.org/) (Choose the LTS version)
   - *Includes `npm` automatically.*

2. **Python (v3.10 or higher)**
   - Download from: [https://www.python.org/downloads/](https://www.python.org/downloads/)
   - ⚠️ **Important during installation**: Check the box **"Add Python to PATH"**!

3. **MongoDB Community Server** (or MongoDB Compass / MongoDB Atlas)
   - Download from: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
   - Start MongoDB service (`mongodb://localhost:27017/`).

---

## 🚀 Step-by-Step Setup & Run Commands

### 1️⃣ Backend Setup (Python FastAPI + ML + MongoDB)

Open your terminal (PowerShell, Command Prompt, or VS Code Terminal) in the project root:

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. (Optional / First time) Seed the database with initial users, ML risk nodes, and guidelines
python -m app.seed_data

# 4. Start the FastAPI backend server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

> **Backend is now LIVE at:** `http://localhost:8000`  
> **Interactive Swagger API Docs:** `http://localhost:8000/docs`

---

### 2️⃣ Frontend Setup (React + Vite + Tailwind CSS + Leaflet)

Open a **second terminal tab / window**:

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

> **Frontend Web App is now LIVE at:** `http://localhost:5173`

---

## 👥 Demo Logins for Live Evaluation (SIH Presentation)

You can switch roles instantly in the top navigation bar with the **"Demo Persona"** dropdown or login with these credentials:

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **ASHA Worker** | `asha@swasthyajal.gov.in` | `password123` | Grassroots case & water quality reporting |
| **ANM Worker** | `anm@swasthyajal.gov.in` | `password123` | Sub-centre syndromic surveillance |
| **PHC Medical Officer** | `doctor@swasthyajal.gov.in` | `password123` | Clinical triage & water sample verification |
| **Health Authority / DSO** | `authority@swasthyajal.gov.in` | `password123` | Outbreak confirmation & IDSP Form-S dispatch |
| **System Admin** | `admin@swasthyajal.gov.in` | `password123` | Full system audit logs & user management |
| **Public Citizen** | `public@swasthyajal.gov.in` | `password123` | Multi-lingual advisories & safety guide |

---

## 🏆 Key Features

- **Multi-Lingual Internationalization**: Instant 1-click translation into **English**, **অসমীয়া (Assamese)**, **বাংলা (Bengali)**, and **हिंदी (Hindi)**.
- **Audio Voice Broadcast**: Reads aloud official health advisories in regional Indian languages (`as-IN`, `bn-IN`, `hi-IN`, `en-IN`) for rural accessibility.
- **Explainable AI (XAI)**: Scikit-Learn Random Forest model deconstructing Gini feature importances directly on the live Leaflet map.
- **Government IDSP Form-S Export**: 1-click printable / PDF official outbreak investigation dossiers with WHO supply calculations (ORS sachets & chlorine tablets).
- **Offline-First Resilience**: Field health worker reports queue in IndexedDB and auto-synchronize when internet returns.
- **Light & Dark Mode**: Segmented theme switch with high-contrast accessibility.
