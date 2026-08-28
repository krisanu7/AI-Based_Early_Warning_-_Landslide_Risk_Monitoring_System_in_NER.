from app.ml.cluster import haversine_distance_km

def analyze_cascading_impact(target_loc: dict, all_locations: list, all_infrastructure: list, all_shelters: list, impact_radius_km: float = 15.0) -> dict:
    """
    Given a high-risk landslide epicentre, calculates cascading exposure
    within the impact radius (surrounding villages, highways, bridges, hospitals, shelters).
    """
    t_lat = target_loc.get("latitude") or target_loc.get("lat") or 0.0
    t_lon = target_loc.get("longitude") or target_loc.get("lng") or 0.0
    
    nearby_villages = []
    total_exposed_population = target_loc.get("population", 0)

    for loc in all_locations:
        loc_village = loc.get("village")
        if loc_village == target_loc.get("village"):
            continue
        
        l_lat = loc.get("latitude") or loc.get("lat") or 0.0
        l_lon = loc.get("longitude") or loc.get("lng") or 0.0
        dist = haversine_distance_km(t_lat, t_lon, l_lat, l_lon)

        if dist <= impact_radius_km:
            pop = loc.get("population", 0)
            total_exposed_population += pop
            nearby_villages.append({
                "village": loc_village,
                "district": loc.get("district"),
                "state": loc.get("state"),
                "distance_km": round(dist, 1),
                "population": pop,
                "current_risk": loc.get("risk_score", 0)
            })

    nearby_infra = []
    for infra in all_infrastructure:
        i_lat = infra.get("latitude", 0.0)
        i_lon = infra.get("longitude", 0.0)
        dist = haversine_distance_km(t_lat, t_lon, i_lat, i_lon)

        if dist <= impact_radius_km:
            nearby_infra.append({
                "name": infra.get("name"),
                "type": infra.get("type", "Road"), # Road, Bridge, School, Hospital, Railway
                "distance_km": round(dist, 1),
                "criticality": infra.get("criticality", "HIGH"),
                "status": infra.get("status", "OPERATIONAL"),
                "alternative_route": infra.get("alternative_route", "Bypass road available")
            })

    nearby_safe_shelters = []
    for shelter in all_shelters:
        s_lat = shelter.get("latitude", 0.0)
        s_lon = shelter.get("longitude", 0.0)
        dist = haversine_distance_km(t_lat, t_lon, s_lat, s_lon)

        if dist <= impact_radius_km + 10.0: # allow shelters slightly farther
            nearby_safe_shelters.append({
                "name": shelter.get("name"),
                "type": shelter.get("type", "Community Hall"),
                "capacity": shelter.get("capacity", 500),
                "current_occupancy": shelter.get("current_occupancy", 0),
                "distance_km": round(dist, 1),
                "contact": shelter.get("contact", "112 / District Control Room")
            })

    # Sort shelters by distance
    nearby_safe_shelters.sort(key=lambda x: x["distance_km"])
    nearby_infra.sort(key=lambda x: x["distance_km"])
    nearby_villages.sort(key=lambda x: x["distance_km"])

    return {
        "epicentre_village": target_loc.get("village"),
        "district": target_loc.get("district"),
        "state": target_loc.get("state"),
        "risk_score": target_loc.get("risk_score", 0),
        "risk_level": target_loc.get("risk_level", "MODERATE"),
        "impact_radius_km": impact_radius_km,
        "total_population_exposed": total_exposed_population,
        "affected_villages_count": len(nearby_villages) + 1,
        "nearby_villages": nearby_villages[:6],
        "nearby_infrastructure": nearby_infra[:8],
        "nearby_evacuation_shelters": nearby_safe_shelters[:5],
        "recommended_action": (
            "Immediate District Disaster Management Authority (DDMA) verification required. "
            "Deploy emergency road clearance equipment along vulnerable National Highway segments "
            "and prepare nearby cyclone/flood shelters for potential pre-emptive evacuation."
            if target_loc.get("risk_score", 0) >= 61 else
            "Maintain standard slope monitoring and automated rainfall radar tracking."
        )
    }
