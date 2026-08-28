from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import connect_db, close_db
from app.routers import auth, dashboard, map, field_reports, alerts, infrastructure, evacuation, analytics, sync, prediction, health

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Based Early Warning & Landslide Risk Monitoring System for Northeast India (SIH 2026)",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    connect_db()
    print("NER Landslide AI Backend Started Successfully.")

@app.on_event("shutdown")
async def shutdown_event():
    close_db()

# Mount API Routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_PREFIX)
app.include_router(map.router, prefix=settings.API_PREFIX)
app.include_router(field_reports.router, prefix=settings.API_PREFIX)
app.include_router(alerts.router, prefix=settings.API_PREFIX)
app.include_router(infrastructure.router, prefix=settings.API_PREFIX)
app.include_router(evacuation.router, prefix=settings.API_PREFIX)
app.include_router(analytics.router, prefix=settings.API_PREFIX)
app.include_router(sync.router, prefix=settings.API_PREFIX)
app.include_router(prediction.router, prefix=settings.API_PREFIX)
app.include_router(health.router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "project": "NER Landslide AI (SafeSlope NER)",
        "purpose": "AI-Based Early Warning & Landslide Risk Monitoring System in NER — Smart India Hackathon (SIH 2026)",
        "status": "OPERATIONAL",
        "docs": "/docs",
        "version": settings.VERSION
    }
