from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from sqlalchemy import select, func
from app.database import get_locations_col, get_infrastructure_col, get_evacuation_centers_col, get_alerts_col
from app.database_pg import AsyncSessionLocal
from app.models.spatial_models import SpatialLocation, SpatialInfrastructure, SpatialEvacuationShelter, SpatialRiskZone
from app.ml.cluster import detect_hotspot_clusters
from app.ml.cascading import analyze_cascading_impact

router = APIRouter(prefix="/map", tags=["GIS Map"])

@router.get("/risk")
async def get_map_risk_nodes(
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    min_risk: Optional[int] = Query(0)
):
    """
    Returns spatial GIS risk nodes. Tries PostgreSQL + PostGIS first for real-time GIS spatial querying,
    falling back to MongoDB if PostgreSQL is offline.
    """
    from app.database_pg import get_pg_engine, AsyncSessionLocal
    get_pg_engine()

    if AsyncSessionLocal:
        try:
            async with AsyncSessionLocal() as session:
                query = select(SpatialLocation)
                if state and state != "ALL":
                    query = query.where(func.lower(SpatialLocation.state) == state.lower())
                if district and district != "ALL":
                    query = query.where(func.lower(SpatialLocation.district) == district.lower())
                if min_risk > 0:
                    query = query.where(SpatialLocation.risk_score >= min_risk)

                res = await session.execute(query)
                spatial_nodes = res.scalars().all()
                postgis_locations = [node.to_dict() for node in spatial_nodes]
                if len(postgis_locations) > 0:
                    data_source = "PostgreSQL / PostGIS"
        except Exception as e:
            print(f"[Map Router] PostGIS query fallback to MongoDB: {e}")

    # If PostGIS returned data, use it; otherwise fallback to Mongo
    if postgis_locations:
        locs = postgis_locations
    else:
        locations_col = get_locations_col()
        locs = await locations_col.find()
        if state and state != "ALL":
            locs = [l for l in locs if l.get("state", "").lower() == state.lower()]
        if district and district != "ALL":
            locs = [l for l in locs if l.get("district", "").lower() == district.lower()]
        if min_risk > 0:
            locs = [l for l in locs if l.get("risk_score", 0) >= min_risk]

    # Fetch infra & shelters
    infra_col = get_infrastructure_col()
    shelters_col = get_evacuation_centers_col()
    all_infra = await infra_col.find()
    all_shelters = await shelters_col.find()

    clusters = detect_hotspot_clusters(locs, radius_km=25.0)

    return {
        "locations": locs,
        "clusters": clusters,
        "infrastructure": all_infra,
        "evacuation_centers": all_shelters,
        "total_nodes": len(locs),
        "hotspot_clusters_detected": len(clusters),
        "data_source": data_source
    }

@router.get("/cascading/{location_id}")
async def get_location_cascading_impact(location_id: str):
    locations_col = get_locations_col()
    infra_col = get_infrastructure_col()
    shelters_col = get_evacuation_centers_col()

    locs = await locations_col.find()
    all_infra = await infra_col.find()
    all_shelters = await shelters_col.find()

    target = None
    for l in locs:
        if str(l.get("id")) == str(location_id) or l.get("village", "").lower() == location_id.lower():
            target = l
            break

    if not target and locs:
        target = locs[0]

    if not target:
        raise HTTPException(status_code=404, detail="Location node not found")

    impact_data = analyze_cascading_impact(target, locs, all_infra, all_shelters, impact_radius_km=15.0)
    return impact_data

@router.get("/clusters")
async def get_clusters_list():
    locations_col = get_locations_col()
    locs = await locations_col.find()
    clusters = detect_hotspot_clusters(locs, radius_km=25.0)
    return {"clusters": clusters, "count": len(clusters)}
