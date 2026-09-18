from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import connect_db, close_db
from app.database_pg import init_postgis_db, close_postgis_db
from app.routers import auth, dashboard, map, field_reports, alerts, infrastructure, evacuation, analytics, sync, prediction, health, gis_postgis, rag_advisor, visual_inspector

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Based Early Warning & Landslide Risk Monitoring System for Northeast India (SIH 2026)",
    docs_url="/docs",
    redoc_url="/redoc"
)

import os

# CORS Middleware supporting local dev, custom origins, and all Vercel deployments
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
custom_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
origins = list(set(default_origins + custom_origins)) if custom_origins else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    import traceback
    print(f"[ERROR] {request.method} {request.url.path}: {exc}")
    traceback.print_exc()
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "detail": str(exc), "path": request.url.path}
    )

@app.on_event("startup")
async def startup_event():
    connect_db() # MongoDB initialization
    await init_postgis_db() # PostgreSQL + PostGIS initialization
    print("NER Landslide AI Backend & PostGIS Mapping Started Successfully.")

@app.on_event("shutdown")
async def shutdown_event():
    close_db()
    await close_postgis_db()

# Mount API Routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_PREFIX)
app.include_router(map.router, prefix=settings.API_PREFIX)
app.include_router(gis_postgis.router, prefix=settings.API_PREFIX)
app.include_router(field_reports.router, prefix=settings.API_PREFIX)
app.include_router(alerts.router, prefix=settings.API_PREFIX)
app.include_router(infrastructure.router, prefix=settings.API_PREFIX)
app.include_router(evacuation.router, prefix=settings.API_PREFIX)
app.include_router(analytics.router, prefix=settings.API_PREFIX)
app.include_router(sync.router, prefix=settings.API_PREFIX)
app.include_router(prediction.router, prefix=settings.API_PREFIX)
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(rag_advisor.router, prefix=settings.API_PREFIX)
app.include_router(visual_inspector.router, prefix=settings.API_PREFIX)



@app.get("/")
def root():
    return {
        "project": "NER Landslide AI (SafeSlope NER)",
        "purpose": "AI-Based Early Warning & Landslide Risk Monitoring System in NER — Smart India Hackathon (SIH 2026)",
        "status": "OPERATIONAL",
        "docs": "/docs",
        "version": settings.VERSION
    }
