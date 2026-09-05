import asyncio
import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text, select

# Adjust path so script can import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.config import settings
from app.database_pg import Base
from app.seed_data import NORTHEAST_SLOPE_LOCATIONS, DEMO_INFRASTRUCTURE, DEMO_EVACUATION_CENTERS
from app.models.spatial_models import (
    SpatialLocation,
    SpatialInfrastructure,
    SpatialRiskZone,
    SpatialEvacuationShelter
)


def ensure_postgres_database_exists():
    """
    Connects to default 'postgres' database and creates 'swasthya_jal_postgis' if missing.
    """
    print(f"[Init PostGIS] Checking local PostgreSQL database '{settings.POSTGRES_DB}' on {settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}...")
    try:
        conn = psycopg2.connect(
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            host=settings.POSTGRES_HOST,
            port=settings.POSTGRES_PORT,
            dbname="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (settings.POSTGRES_DB,))
        exists = cursor.fetchone()

        if not exists:
            print(f"[Init PostGIS] Database '{settings.POSTGRES_DB}' does not exist. Creating it now...")
            cursor.execute(f'CREATE DATABASE "{settings.POSTGRES_DB}";')
            print(f"[Init PostGIS] Database '{settings.POSTGRES_DB}' created successfully.")
        else:
            print(f"[Init PostGIS] Database '{settings.POSTGRES_DB}' already exists.")

        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"[Init PostGIS] Error checking/creating database: {e}")
        print("[Init PostGIS] Make sure PostgreSQL service is running locally on your device.")
        return False


async def seed_postgis_data(engine):
    """
    Seeds PostGIS spatial tables with ALL location nodes, infrastructure, shelters,
    and hazard polygons for Northeast India.
    """
    print("[Init PostGIS] Initializing PostGIS tables and seeding full Northeast GIS dataset...")

    async with engine.begin() as conn:
        # Enable PostGIS extension
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))

        # Drop & recreate for fresh clean sync
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy.orm import sessionmaker

    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async with async_session() as session:
        # 1. Seed ALL 20+ Spatial Location Nodes into PostGIS
        count_locs = 0
        for loc in NORTHEAST_SLOPE_LOCATIONS:
            lat = loc.get("latitude", 26.0)
            lng = loc.get("longitude", 91.0)
            
            # Simple risk calculation
            slope = loc.get("slope_degrees", 30.0)
            rain_24h = loc.get("rainfall_24h", 50.0)
            risk_score = round(min(100.0, max(10.0, (slope * 1.2) + (rain_24h * 0.25))), 1)

            if risk_score >= 80:
                risk_level = "CRITICAL"
            elif risk_score >= 60:
                risk_level = "HIGH"
            elif risk_score >= 30:
                risk_level = "MODERATE"
            else:
                risk_level = "LOW"

            geom_expr = text(f"ST_SetSRID(ST_MakePoint({lng}, {lat}), 4326)")
            spatial_node = SpatialLocation(
                village=loc.get("village", "Unknown Slope"),
                district=loc.get("district", "NER District"),
                state=loc.get("state", "NER State"),
                latitude=lat,
                longitude=lng,
                risk_score=risk_score,
                risk_level=risk_level,
                slope_angle=slope,
                rainfall_24h_mm=rain_24h,
                soil_moisture_pct=loc.get("soil_moisture_pct", 75.0),
                water_ph=7.0,
                turbidity_ntu=3.5,
                geom=geom_expr
            )
            session.add(spatial_node)
            count_locs += 1

        print(f"[Init PostGIS] Seeded {count_locs} spatial location point nodes into PostGIS.")

        # 2. Seed Multiple Polygon Risk Zones across Northeast India
        risk_zones_data = [
            {
                "name": "Aizawl High Hazard Landslide Catchment",
                "district": "Aizawl",
                "state": "Mizoram",
                "rating": "CRITICAL",
                "area": 28.5,
                "wkt": "POLYGON((92.70 23.70, 92.75 23.70, 92.75 23.75, 92.70 23.75, 92.70 23.70))"
            },
            {
                "name": "Haflong Hill Cut Instability Corridor",
                "district": "Dima Hasao",
                "state": "Assam",
                "rating": "CRITICAL",
                "area": 42.0,
                "wkt": "POLYGON((93.00 25.14, 93.06 25.14, 93.06 25.20, 93.00 25.20, 93.00 25.14))"
            },
            {
                "name": "Sohra-Mawsynram Extreme Rainfall Escarpment",
                "district": "East Khasi Hills",
                "state": "Meghalaya",
                "rating": "CRITICAL",
                "area": 55.2,
                "wkt": "POLYGON((91.55 25.25, 91.75 25.25, 91.75 25.32, 91.55 25.32, 91.55 25.25))"
            },
            {
                "name": "Gangtok-Teesta River Slope Hazard Zone",
                "district": "East Sikkim",
                "state": "Sikkim",
                "rating": "HIGH",
                "area": 31.8,
                "wkt": "POLYGON((88.58 27.30, 88.63 27.30, 88.63 27.36, 88.58 27.36, 88.58 27.30))"
            },
            {
                "name": "Kohima-Phesama Active Creep Zone",
                "district": "Kohima",
                "state": "Nagaland",
                "rating": "HIGH",
                "area": 22.4,
                "wkt": "POLYGON((94.08 25.62, 94.13 25.62, 94.13 25.68, 94.08 25.68, 94.08 25.62))"
            },
            {
                "name": "Tupul Railway Debris Hazard Polygon",
                "district": "Noney",
                "state": "Manipur",
                "rating": "CRITICAL",
                "area": 36.0,
                "wkt": "POLYGON((93.62 24.80, 93.68 24.80, 93.68 24.85, 93.62 24.85, 93.62 24.80))"
            },
            {
                "name": "Bhalukpong-Tawang Alpine Cut Zone",
                "district": "West Kameng",
                "state": "Arunachal Pradesh",
                "rating": "HIGH",
                "area": 48.0,
                "wkt": "POLYGON((92.60 27.00, 92.68 27.00, 92.68 27.06, 92.60 27.06, 92.60 27.00))"
            }
        ]

        for rz in risk_zones_data:
            risk_zone = SpatialRiskZone(
                zone_name=rz["name"],
                district=rz["district"],
                state=rz["state"],
                hazard_rating=rz["rating"],
                area_sq_km=rz["area"],
                geom=text(f"ST_SetSRID(ST_GeomFromText('{rz['wkt']}'), 4326)")
            )
            session.add(risk_zone)

        print(f"[Init PostGIS] Seeded {len(risk_zones_data)} spatial hazard risk polygons into PostGIS.")

        # 3. Infrastructure
        for inf in DEMO_INFRASTRUCTURE:
            lat = inf.get("latitude", 26.0)
            lng = inf.get("longitude", 91.0)
            geom_expr = text(f"ST_SetSRID(ST_MakePoint({lng}, {lat}), 4326)")
            infra_node = SpatialInfrastructure(
                name=inf.get("name", "Utility Pipeline"),
                type=inf.get("type", "Road"),
                district=inf.get("district", "NER District"),
                state=inf.get("state", "NER State"),
                latitude=lat,
                longitude=lng,
                status=inf.get("status", "OPERATIONAL"),
                geom=geom_expr
            )
            session.add(infra_node)

        # 4. Shelters
        for sh in DEMO_EVACUATION_CENTERS:
            lat = sh.get("latitude", 26.0)
            lng = sh.get("longitude", 91.0)
            geom_expr = text(f"ST_SetSRID(ST_MakePoint({lng}, {lat}), 4326)")
            shelter_node = SpatialEvacuationShelter(
                name=sh.get("name", "Relief Camp"),
                district=sh.get("district", "NER District"),
                state=sh.get("state", "NER State"),
                capacity=sh.get("capacity", 500),
                current_occupancy=sh.get("current_occupancy", 50),
                latitude=lat,
                longitude=lng,
                status=sh.get("status", "READY"),
                geom=geom_expr
            )
            session.add(shelter_node)

        await session.commit()
        print("[Init PostGIS] Successfully synced full Northeast GIS dataset into PostGIS database!")


async def main():
    if not ensure_postgres_database_exists():
        return

    engine = create_async_engine(settings.POSTGRES_URL_ASYNC, echo=False)
    await seed_postgis_data(engine)
    await engine.dispose()
    print("[Init PostGIS] Full initialization completed.")


if __name__ == "__main__":
    asyncio.run(main())
