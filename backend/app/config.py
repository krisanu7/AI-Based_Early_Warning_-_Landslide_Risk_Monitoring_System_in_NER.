import os

class Settings:
    PROJECT_NAME: str = "SwasthyaJal NER - Water-Borne Disease Early Warning System"
    VERSION: str = "1.0.0"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "sih-2026-swasthya-jal-ner-super-secret-key-32chars")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "swasthya_jal_db")
    
    # Northeast India Focus Coordinates
    NE_CENTER_LAT: float = 26.2006
    NE_CENTER_LNG: float = 92.9376
    
    # Risk Thresholds
    RISK_LOW_MAX: int = 30
    RISK_MED_MAX: int = 60
    RISK_HIGH_MAX: int = 80
    # 81-100 is VERY HIGH

settings = Settings()
