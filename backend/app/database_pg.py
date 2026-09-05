import sys
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import text
from app.config import settings

Base = declarative_base()

pg_engine = None
AsyncSessionLocal = None

def get_pg_engine():
    global pg_engine, AsyncSessionLocal
    if pg_engine is None:
        try:
            pg_engine = create_async_engine(
                settings.POSTGRES_URL_ASYNC,
                echo=False,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20
            )
            AsyncSessionLocal = async_sessionmaker(
                pg_engine,
                expire_on_commit=False,
                class_=AsyncSession
            )
        except Exception as e:
            print(f"[PostGIS] Warning: Failed to create Async Engine: {e}", file=sys.stderr)
    return pg_engine

async def get_pg_db() -> AsyncGenerator[AsyncSession, None]:
    global AsyncSessionLocal
    if AsyncSessionLocal is None:
        get_pg_engine()
    
    if AsyncSessionLocal is None:
        raise RuntimeError("PostgreSQL engine is not initialized. Check your database connection settings.")

    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_postgis_db():
    """
    Initializes PostgreSQL connection, creates PostGIS extension if missing,
    and initializes spatial tables.
    """
    engine = get_pg_engine()
    if engine is None:
        print("[PostGIS] Skipped setup - engine could not be initialized.")
        return False

    try:
        async with engine.begin() as conn:
            # 1. Enable PostGIS Extension
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            print(f"[PostGIS] Successfully enabled PostGIS extension on {settings.POSTGRES_DB}")

            # 2. Import models so metadata is populated
            from app.models.spatial_models import Base as SpatialBase
            await conn.run_sync(SpatialBase.metadata.create_all)
            print("[PostGIS] Spatial tables initialized successfully.")
            return True
    except Exception as e:
        print(f"[PostGIS] Warning during startup initialization: {e}")
        print(f"[PostGIS] Ensure PostgreSQL is running on {settings.POSTGRES_HOST}:{settings.POSTGRES_PORT} with database '{settings.POSTGRES_DB}'.")
        return False

async def close_postgis_db():
    global pg_engine
    if pg_engine:
        await pg_engine.dispose()
        print("[PostGIS] PostgreSQL engine disposed.")
