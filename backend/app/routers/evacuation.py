from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from app.database import get_evacuation_centers_col, get_locations_col
from app.ml.cluster import haversine_distance_km
import math

router = APIRouter(tags=["Evacuation & Response Logistics"])

@router.get("/evacuation-centers", response_model=List[dict])
async def list_evacuation_centers(
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None)
):
    from app.seed_data import get_inmemory_seed_data
    seed = get_inmemory_seed_data()

    state_str = state if isinstance(state, str) else None
    district_str = district if isinstance(district, str) else None

    shelters_col = get_evacuation_centers_col()
    query = {}
    if state_str and state_str != "ALL":
        query["state"] = state_str
    if district_str and district_str != "ALL":
        query["district"] = district_str

    shelters = await shelters_col.find(query)
    if not shelters:
        shelters = list(seed.get("evacuation_centers", []))
        if state_str and state_str != "ALL":
            shelters = [s for s in shelters if s.get("state", "").lower() == state_str.lower()]
        if district_str and district_str != "ALL":
            shelters = [s for s in shelters if s.get("district", "").lower() == district_str.lower()]

    return shelters

@router.get("/evacuation-centers/nearest")
async def find_nearest_evacuation_center(
    lat: float = Query(...),
    lon: float = Query(...),
    limit: int = Query(3)
):
    from app.seed_data import get_inmemory_seed_data
    shelters_col = get_evacuation_centers_col()
    shelters = await shelters_col.find()
    if not shelters:
        shelters = list(get_inmemory_seed_data().get("evacuation_centers", []))

    enriched = []
    for s in shelters:
        s_lat = s.get("latitude", 0.0)
        s_lon = s.get("longitude", 0.0)
        dist = haversine_distance_km(lat, lon, s_lat, s_lon)
        s_copy = dict(s)
        s_copy["distance_km"] = round(dist, 1)
        enriched.append(s_copy)

    enriched.sort(key=lambda x: x["distance_km"])
    return {"nearest_shelters": enriched[:limit]}

@router.get("/response/logistics-plan")
async def calculate_disaster_response_logistics(
    village: Optional[str] = Query(None),
    district: Optional[str] = Query(None)
):
    """
    Calculates AI/Rule-based emergency response requirements for disaster planning.
    Clearly labelled as AI/Rule-based planning estimates rather than deployment orders.
    """
    locations_col = get_locations_col()
    locs = await locations_col.find()

    target_loc = None
    if village:
        for l in locs:
            if l.get("village", "").lower() == village.lower():
                target_loc = l
                break
    if not target_loc and locs:
        # Default to highest risk location
        locs_sorted = sorted(locs, key=lambda x: x.get("risk_score", 0), reverse=True)
        target_loc = locs_sorted[0]

    pop = target_loc.get("population", 3500)
    risk = target_loc.get("risk_score", 75)
    
    # Heuristic Disaster Response Planning Estimator
    evac_rate = 0.40 if risk >= 81 else (0.25 if risk >= 61 else 0.10)
    pop_to_evacuate = int(pop * evac_rate)
    shelter_capacity_needed = pop_to_evacuate
    
    # 1 Rescue Team (SDRF/NDRF) per 500 at-risk individuals in high risk zone
    rescue_teams = max(2, math.ceil(pop_to_evacuate / 450)) if risk >= 61 else 1
    
    # Evacuation vehicles (standard 40-seater buses)
    evac_vehicles = math.ceil(pop_to_evacuate / 35)
    
    # Heavy Earth-Moving Equipment (JCBs / Excavators for debris clearance on roads)
    earthmovers = 4 if risk >= 81 else (2 if risk >= 61 else 1)
    
    # Relief packets (7-day dry ration + bottled water)
    relief_packets = pop_to_evacuate * 3 # 3 per person
    
    # Medical triage units
    medical_units = max(1, math.ceil(pop_to_evacuate / 1000))

    return {
        "location": {
            "village": target_loc.get("village"),
            "district": target_loc.get("district"),
            "state": target_loc.get("state"),
            "total_population": pop,
            "risk_score": risk,
            "risk_level": target_loc.get("risk_level", "HIGH")
        },
        "logistics_estimates": {
            "estimated_population_at_risk": pop,
            "estimated_evacuation_requirement": pop_to_evacuate,
            "shelter_capacity_required": shelter_capacity_needed,
            "recommended_rescue_teams_sdrf_ndrf": rescue_teams,
            "evacuation_buses_required": evac_vehicles,
            "heavy_earthmovers_jcbs_required": earthmovers,
            "emergency_relief_packets_7day": relief_packets,
            "mobile_medical_triage_units": medical_units,
            "satellite_communication_sets": max(1, math.ceil(rescue_teams / 2))
        },
        "planning_status": "AI_GENERATED_RECOMMENDATION",
        "disclaimer": "These values are automated AI/Rule-based planning estimates for preparation. Authorized DDMA / SDMA commanders make final official deployment orders."
    }
