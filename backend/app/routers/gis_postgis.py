import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from geoalchemy2.functions import ST_AsGeoJSON, ST_DWithin, ST_Distance, ST_SetSRID, ST_MakePoint, ST_Contains
from typing import Optional, List
from pydantic import BaseModel

from app.database_pg import get_pg_db
from app.models.spatial_models import (
    SpatialLocation,
    SpatialInfrastructure,
    SpatialRiskZone,
    SpatialEvacuationShelter
)

router = APIRouter(prefix="/gis/postgis", tags=["PostGIS Spatial Mapping"])


class CreateLocationSchema(BaseModel):
    village: str
    district: str
    state: str
    latitude: float
    longitude: float
    risk_score: Optional[float] = 0.0
    risk_level: Optional[str] = "LOW"
    slope_angle: Optional[float] = 0.0
    rainfall_24h_mm: Optional[float] = 0.0
    soil_moisture_pct: Optional[float] = 0.0
    water_ph: Optional[float] = 7.0
    turbidity_ntu: Optional[float] = 1.0


@router.get("/geojson")
async def get_postgis_geojson(
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    min_risk: Optional[float] = Query(0.0),
    db: AsyncSession = Depends(get_pg_db)
):
    """
    Returns spatial location nodes formatted as standard GeoJSON FeatureCollection,
    leveraging PostGIS native ST_AsGeoJSON().
    """
    query = select(
        SpatialLocation,
        ST_AsGeoJSON(SpatialLocation.geom).label("geojson_str")
    )

    if state and state != "ALL":
        query = query.where(func.lower(SpatialLocation.state) == state.lower())
    if district and district != "ALL":
        query = query.where(func.lower(SpatialLocation.district) == district.lower())
    if min_risk > 0:
        query = query.where(SpatialLocation.risk_score >= min_risk)

    result = await db.execute(query)
    rows = result.all()

    features = []
    for loc, geojson_str in rows:
        geometry = json.loads(geojson_str) if geojson_str else {
            "type": "Point",
            "coordinates": [loc.longitude, loc.latitude]
        }
        features.append({
            "type": "Feature",
            "geometry": geometry,
            "properties": loc.to_dict()
        })

    return {
        "type": "FeatureCollection",
        "features": features,
        "count": len(features),
        "spatial_engine": "PostGIS"
    }


@router.get("/nearby")
async def get_nearby_nodes_postgis(
    lat: float = Query(..., description="Latitude of target point"),
    lng: float = Query(..., description="Longitude of target point"),
    radius_km: float = Query(25.0, description="Radius in kilometers"),
    db: AsyncSession = Depends(get_pg_db)
):
    """
    PostGIS Spatial Radius Query using ST_DWithin and ST_Distance (Geography casting).
    Fast, spatial-index-backed calculation of all nodes within radius_km.
    """
    radius_meters = radius_km * 1000.0

    # PostGIS Geography query for meter-accurate WGS84 calculations
    target_point = func.ST_SetSRID(func.ST_MakePoint(lng, lat), 4326)
    
    query = select(
        SpatialLocation,
        (func.ST_Distance(
            func.cast(SpatialLocation.geom, text("geography")),
            func.cast(target_point, text("geography"))
        ) / 1000.0).label("distance_km")
    ).where(
        func.ST_DWithin(
            func.cast(SpatialLocation.geom, text("geography")),
            func.cast(target_point, text("geography")),
            radius_meters
        )
    ).order_by("distance_km")

    result = await db.execute(query)
    rows = result.all()

    nearby_results = []
    for loc, dist_km in rows:
        loc_dict = loc.to_dict()
        loc_dict["distance_km"] = round(float(dist_km), 2)
        nearby_results.append(loc_dict)

    return {
        "target": {"latitude": lat, "longitude": lng},
        "radius_km": radius_km,
        "nodes_found": len(nearby_results),
        "results": nearby_results,
        "spatial_engine": "PostGIS (ST_DWithin)"
    }


@router.get("/risk-zones")
async def get_postgis_risk_zones(db: AsyncSession = Depends(get_pg_db)):
    """
    Fetches spatial hazard risk polygons and returns GeoJSON features.
    """
    query = select(
        SpatialRiskZone,
        ST_AsGeoJSON(SpatialRiskZone.geom).label("geojson_str")
    )
    result = await db.execute(query)
    rows = result.all()

    features = []
    for zone, geojson_str in rows:
        geometry = json.loads(geojson_str) if geojson_str else None
        features.append({
            "type": "Feature",
            "geometry": geometry,
            "properties": zone.to_dict()
        })

    return {
        "type": "FeatureCollection",
        "features": features,
        "count": len(features)
    }


@router.post("/location")
async def create_postgis_location(
    data: CreateLocationSchema,
    db: AsyncSession = Depends(get_pg_db)
):
    """
    Inserts a new spatial point into PostGIS with auto-generated geometry.
    """
    point_geom = func.ST_SetSRID(func.ST_MakePoint(data.longitude, data.latitude), 4326)
    
    new_loc = SpatialLocation(
        village=data.village,
        district=data.district,
        state=data.state,
        latitude=data.latitude,
        longitude=data.longitude,
        risk_score=data.risk_score,
        risk_level=data.risk_level,
        slope_angle=data.slope_angle,
        rainfall_24h_mm=data.rainfall_24h_mm,
        soil_moisture_pct=data.soil_moisture_pct,
        water_ph=data.water_ph,
        turbidity_ntu=data.turbidity_ntu,
        geom=point_geom
    )
    
    db.add(new_loc)
    await db.commit()
    await db.refresh(new_loc)

    return {
        "status": "SUCCESS",
        "message": "Spatial location feature added to PostGIS",
        "data": new_loc.to_dict()
    }
