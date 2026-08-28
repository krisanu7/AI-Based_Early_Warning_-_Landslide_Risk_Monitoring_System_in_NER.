from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.database import get_locations_col, get_infrastructure_col, get_evacuation_centers_col, get_alerts_col, get_field_reports_col
from app.ml.cluster import detect_hotspot_clusters
from app.ml.cascading import analyze_cascading_impact

router = APIRouter(prefix="/map", tags=["GIS Map"])

@router.get("/risk")
async def get_map_risk_nodes(
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    min_risk: Optional[int] = Query(0)
):
    locations_col = get_locations_col()
    infra_col = get_infrastructure_col()
    shelters_col = get_evacuation_centers_col()
    alerts_col = get_alerts_col()

    locs = await locations_col.find()
    all_infra = await infra_col.find()
    all_shelters = await shelters_col.find()
    all_alerts = await alerts_col.find()

    # Filter
    filtered = locs
    if state and state != "ALL":
        filtered = [l for l in filtered if l.get("state", "").lower() == state.lower()]
    if district and district != "ALL":
        filtered = [l for l in filtered if l.get("district", "").lower() == district.lower()]
    if min_risk > 0:
        filtered = [l for l in filtered if l.get("risk_score", 0) >= min_risk]

    clusters = detect_hotspot_clusters(locs, radius_km=25.0)

    return {
        "locations": filtered,
        "clusters": clusters,
        "infrastructure": all_infra,
        "evacuation_centers": all_shelters,
        "total_nodes": len(filtered),
        "hotspot_clusters_detected": len(clusters)
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
        if l.get("id") == location_id or l.get("village", "").lower() == location_id.lower():
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
