import os
try:
    from dotenv import load_dotenv
    # Explicitly load .env from the backend root or project root
    _backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    _backend_env = os.path.join(_backend_dir, ".env")
    if os.path.exists(_backend_env):
        load_dotenv(dotenv_path=_backend_env)
    else:
        load_dotenv()
except ImportError:
    pass

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
    
    # MongoDB (Credentials loaded via MONGODB_URL environment variable / .env)
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "ner_landslide_db")
    
    # PostgreSQL + PostGIS (Hybrid Mapping DB)
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "127.0.0.1")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "swasthya_jal_postgis")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    @property
    def POSTGRES_URL_ASYNC(self) -> str:
        if self.DATABASE_URL:
            url = self.DATABASE_URL.strip()
            if url.startswith("postgres://"):
                return url.replace("postgres://", "postgresql+asyncpg://", 1)
            elif url.startswith("postgresql://"):
                return url.replace("postgresql://", "postgresql+asyncpg://", 1)
            return url
        import urllib.parse
        escaped_pwd = urllib.parse.quote_plus(self.POSTGRES_PASSWORD)
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{escaped_pwd}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def POSTGRES_URL_SYNC(self) -> str:
        if self.DATABASE_URL:
            url = self.DATABASE_URL.strip()
            if url.startswith("postgres://"):
                return url.replace("postgres://", "postgresql://", 1)
            return url
        import urllib.parse
        escaped_pwd = urllib.parse.quote_plus(self.POSTGRES_PASSWORD)
        return f"postgresql://{self.POSTGRES_USER}:{escaped_pwd}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"


    
    # JWT Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Gemini AI & RAG Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Landslide Risk Thresholds
    RAINFALL_TRIGGER_24H_MM: float = 100.0   # Trigger threshold for 24h rainfall
    RAINFALL_TRIGGER_48H_MM: float = 160.0   # Trigger threshold for 48h rainfall
    SLOPE_CRITICAL_DEGREES: float = 35.0     # Critical slope angle for instability
    SOIL_MOISTURE_CRITICAL_PCT: float = 80.0 # Saturation threshold
    PORE_PRESSURE_CRITICAL_KPA: float = 25.0 # Pore-water pressure threshold
    HOTSPOT_CLUSTER_RADIUS_KM: float = 25.0  # Spatial cluster radius

settings = Settings()
