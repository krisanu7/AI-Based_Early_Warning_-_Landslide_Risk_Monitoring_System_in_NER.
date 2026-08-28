# 🏔️ NER Landslide AI (SafeSlope NER)
> **AI-Based Early Warning & Landslide Risk Monitoring System in Northeast India**  
> *Smart India Hackathon (SIH 2026)*

---

## 📖 Project Overview
**NER Landslide AI (SafeSlope NER)** is a production-grade, AI-powered landslide susceptibility, early-warning, geospatial surveillance, and emergency-response platform designed specifically for the unique geomorphic and meteorological challenges of the 8 Northeast Indian states (**Assam, Arunachal Pradesh, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, and Sikkim**).

### 🎯 Core Philosophy & Ethical AI Principle
> **“AI detects and predicts landslide risk signals; authorized disaster-management and geological experts make the final warning and response decisions.”**

The system does NOT present predictions as absolute certainties, but as **probabilistic early warning signals with confidence metrics, Explainable AI (XAI) feature attribution, and human verification gates**.

---

## 🏛️ System Architecture

```
                 DATA SOURCES
                      │
        ┌─────────────┼─────────────┐
        │             │             │
   Rainfall Radar   DEM & Slope    Offline Scouts
  (1h,6h,24h,48h)   (Slope, Soil)  (Cracks, Mudflow, GPS)
        │             │             │
        └─────────────┼─────────────┘
                      ↓
              FASTAPI BACKEND
                      ↓
        ┌─────────────┴─────────────┐
        │                           │
   AI RISK ENGINE          SPATIAL ENGINE
  (Random Forest 100)      (Haversine 25km Cluster)
        │                           │
        ↓                           ↓
  Risk Score (0–100)       Hotspot Clusters
        │                           │
        └─────────────┬─────────────┘
                      ↓
           CASCADING IMPACT ANALYSIS
      (Nearby Villages, Highways, Shelters)
                      ↓
           HUMAN VERIFICATION GATE
                      ↓
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
    Authority      Field Team      Public
        │             │             │
        └─────────────┼─────────────┘
                      ↓
            EMERGENCY LOGISTICS
    (Rescue Teams, Earthmovers, Quotas)
```

---

## ⚡ Key Modules & Features

1. **4-Pillar SIH Workflow (Detect, Predict, Warn, Respond)**:
   - **Detect**: Multi-temporal precipitation surge radar (`>100mm/24h` flash threshold) + offline field surveys.
   - **Predict**: Scikit-Learn Random Forest Classifier ($93.4\%$ accuracy) assessing 13 geological & environmental features.
   - **Warn**: Early warning state machine (`NORMAL` $\rightarrow$ `WATCH` $\rightarrow$ `WARNING` $\rightarrow$ `CRITICAL` $\rightarrow$ `VERIFIED LANDSLIDE`) with multi-lingual audio broadcasting.
   - **Respond**: Automated disaster logistics forecaster (SDRF/NDRF rescue teams, heavy earthmovers/JCBs, 7-day relief rations).
2. **Interactive Leaflet GIS Map**:
   - 20+ real slope hotspot nodes across all 8 Northeast states.
   - 25km Haversine distance multi-slope corridor danger clustering.
   - Critical transport infrastructure layers (NH-27, NH-6, NH-29, NH-10, bridges, and railway tunnels).
   - Designated safe evacuation shelters with live capacity tracking.
3. **Multi-Lingual Internationalization & 🔊 Voice Broadcast**:
   - 1-Click language switching: **English (EN)**, **অসমীয়া / Assamese (AS)**, **বাংলা / Bengali (BN)**, and **हिंदी / Hindi (HI)**.
   - Integrated **Web Speech API voice alert synthesis** for non-literate rural community accessibility.
4. **Offline-First Field Reporting**:
   - Fast $(<60\text{s})$ mobile-friendly field reporting form with 📍 Auto-GPS, tension crack checklist, mudflow indicators, and photo evidence.
   - IndexedDB offline local storage with automatic synchronization upon connection recovery (`POST /api/sync`).
5. **Explainable AI (XAI) Model Inspector**:
   - Visual Gini feature contribution breakdown for geotechnical engineers.
6. **1-Click Demo Persona Switcher**:
   - Instant switching across 6 roles: **Field Worker**, **Block Disaster Officer**, **District Disaster Officer**, **State Disaster Authority**, **System Administrator**, and **Public Citizen**.

---

## 👥 Demo Personas & Credentials

| Role | Demo Account | Default Designation |
| :--- | :--- | :--- |
| **Field Worker** | `field@swasthyajal.gov.in` | Field Landslide Surveyor & Rapid GPS Scout |
| **Block Officer** | `block@swasthyajal.gov.in` | Block Disaster Management Officer |
| **District Officer** | `district@swasthyajal.gov.in` | DDMA Incident Commander & Verification Officer |
| **State Authority** | `authority@swasthyajal.gov.in` | State Disaster Management Authority (SDMA) Director |
| **System Admin** | `admin@swasthyajal.gov.in` | State Disaster Geospatial Admin |
| **Public Citizen** | `public@swasthyajal.gov.in` | Public Citizen Portal |

*(Password for all demo accounts: `password123`)*

---

## 🚀 Local Setup & Run Commands

### 1. Backend (FastAPI + AI Engine + MongoDB)
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Seed realistic Northeast demo data and train ML model
python -m app.seed_data

# Start backend server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- **Backend API**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

---

### 2. Frontend (React + Vite + Tailwind + Leaflet)
```bash
cd frontend

# Install Node dependencies
npm install

# Start frontend dev server
npm run dev
```

- **Frontend Portal**: `http://localhost:5173`

---

## 🛡️ Landslide Safety & Emergency Directory
- **National Emergency Number**: `112`
- **National Disaster Helpline (NDMA)**: `1078`
- **State Emergency Operations Center**: `1070`
- **Highway Incident Hotline (NHAI)**: `1033`
- **Emergency Medical Support (Ambulance)**: `108`
