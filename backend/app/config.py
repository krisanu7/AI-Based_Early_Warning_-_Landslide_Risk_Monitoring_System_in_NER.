import os
try:
    from pydantic_settings import BaseSettings
except ImportError:
    try:
        from pydantic import BaseSettings
    except ImportError:
        class BaseSettings:
            pass

class Settings:
    PROJECT_NAME: str = "NER Landslide AI — SafeSlope NER"
    VERSION: str = "2.0.0"
    API_PREFIX: str = "/api"
    
    # MongoDB
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "ner_landslide_db")
    
    # JWT Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ner-landslide-early-warning-sih-2026-secure-jwt-key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Landslide Risk Thresholds
    RAINFALL_TRIGGER_24H_MM: float = 100.0   # Trigger threshold for 24h rainfall
    RAINFALL_TRIGGER_48H_MM: float = 160.0   # Trigger threshold for 48h rainfall
    SLOPE_CRITICAL_DEGREES: float = 35.0     # Critical slope angle for instability
    SOIL_MOISTURE_CRITICAL_PCT: float = 80.0 # Saturation threshold
    PORE_PRESSURE_CRITICAL_KPA: float = 25.0 # Pore-water pressure threshold
    HOTSPOT_CLUSTER_RADIUS_KM: float = 25.0  # Spatial cluster radius

settings = Settings()
