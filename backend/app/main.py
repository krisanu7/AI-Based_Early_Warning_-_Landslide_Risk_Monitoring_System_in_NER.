from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.seed_data import seed_database
from app.routers import (
    auth_router,
    cases_router,
    water_router,
    risk_router,
    alerts_router,
    analytics_router,
    guidelines_router,
    admin_router
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Seed default roles, initial NE data, and Disease Safety Guidelines into MongoDB
    try:
        await seed_database()
        print("SwasthyaJal NER MongoDB seeding complete.")
    except Exception as e:
        print(f"Database seed notice: {e}")
    yield
    print("SwasthyaJal NER backend shutdown gracefully.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Smart Community Health Monitoring and Early Warning System for Water-Borne Diseases in Rural Northeast India (Smart India Hackathon)",
    lifespan=lifespan
)

# Enable CORS for frontend local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth_router.router)
app.include_router(cases_router.router)
app.include_router(water_router.router)
app.include_router(risk_router.router)
app.include_router(alerts_router.router)
app.include_router(analytics_router.router)
app.include_router(guidelines_router.router)
app.include_router(admin_router.router)

@app.get("/")
async def root():
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "mongodb_cluster": settings.MONGODB_URL,
        "region_coverage": "Northeast India (8 States: Assam, Meghalaya, Arunachal Pradesh, Manipur, Mizoram, Nagaland, Tripura, Sikkim)",
        "core_principle": "AI detects the signal; healthcare professionals make the decision.",
        "safety_disclaimer": "AI provides outbreak-risk signals for authorized investigation. It does not provide medical diagnosis or medicine prescriptions.",
        "status": "OPERATIONAL"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
