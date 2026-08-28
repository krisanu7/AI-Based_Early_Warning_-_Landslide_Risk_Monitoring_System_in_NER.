import math

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points on the Earth in kilometers."""
    R = 6371.0 # Earth's radius in kilometers
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = (math.sin(dLat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dLon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def detect_hotspot_clusters(locations: list, radius_km: float = 25.0, min_high_risk_nodes: int = 2) -> list:
    """
    Identifies multi-slope landslide hazard clusters where 2 or more HIGH/CRITICAL risk
    locations are within a specified geographic radius (default: 25 km).
    """
    high_risk_locs = [loc for loc in locations if loc.get("risk_score", 0) >= 61]
    clusters = []
    visited = set()

    for i, loc in enumerate(high_risk_locs):
        loc_id = loc.get("id") or loc.get("village") or str(i)
        if loc_id in visited:
            continue

        cluster_members = [loc]
        visited.add(loc_id)

        lat1 = loc.get("latitude") or loc.get("lat") or 0.0
        lon1 = loc.get("longitude") or loc.get("lng") or 0.0

        for j, other in enumerate(high_risk_locs):
            other_id = other.get("id") or other.get("village") or str(j)
            if other_id in visited:
                continue

            lat2 = other.get("latitude") or other.get("lat") or 0.0
            lon2 = other.get("longitude") or other.get("lng") or 0.0

            dist = haversine_distance_km(lat1, lon1, lat2, lon2)
            if dist <= radius_km:
                cluster_members.append(other)
                visited.add(other_id)

        if len(cluster_members) >= min_high_risk_nodes:
            # Calculate aggregate cluster telemetry
            avg_risk = sum(m.get("risk_score", 0) for m in cluster_members) / len(cluster_members)
            max_risk = max(m.get("risk_score", 0) for m in cluster_members)
            total_pop = sum(m.get("population", 0) for m in cluster_members)
            avg_rainfall = sum(m.get("rainfall_24h", 0) for m in cluster_members) / len(cluster_members)
            center_lat = sum(m.get("latitude", 0) for m in cluster_members) / len(cluster_members)
            center_lon = sum(m.get("longitude", 0) for m in cluster_members) / len(cluster_members)

            cluster_name = f"{cluster_members[0].get('district', 'NER')} - {cluster_members[0].get('village', 'Cluster')} Corridor"
            
            clusters.append({
                "cluster_id": f"CLUS-{loc.get('state', 'NER')[:3].upper()}-{len(clusters) + 1:02d}",
                "name": cluster_name,
                "state": cluster_members[0].get("state", "Assam"),
                "district": cluster_members[0].get("district", "NER"),
                "center_latitude": round(center_lat, 4),
                "center_longitude": round(center_lon, 4),
                "radius_km": radius_km,
                "node_count": len(cluster_members),
                "locations": [m.get("village") for m in cluster_members],
                "average_risk": round(avg_risk, 1),
                "max_risk": max_risk,
                "total_population_exposed": total_pop,
                "average_24h_rainfall_mm": round(avg_rainfall, 1),
                "severity": "CRITICAL" if max_risk >= 81 else "HIGH",
                "response_status": "ACTIVE_MONITORING"
            })

    return clusters
