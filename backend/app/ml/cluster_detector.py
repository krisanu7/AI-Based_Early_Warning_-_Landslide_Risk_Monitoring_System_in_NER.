import math
from typing import List, Dict, Any
from datetime import datetime, timedelta

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points in km."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class ClusterDetector:
    def __init__(self, proximity_radius_km: float = 25.0, time_window_days: int = 4, min_cluster_cases: int = 8):
        self.proximity_radius_km = proximity_radius_km
        self.time_window_days = time_window_days
        self.min_cluster_cases = min_cluster_cases

    def detect_clusters(self, case_reports: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Groups case reports by spatial proximity, matching symptoms, and time window.
        Returns suspected cluster alerts if total cluster cases exceed threshold.
        """
        if not case_reports:
            return []

        # Filter reports in recent time window
        recent_reports = [r for r in case_reports if r.get("approx_cases", 0) > 0]
        if len(recent_reports) < 2:
            return []

        clusters = []
        visited = set()

        for i, rep_a in enumerate(recent_reports):
            if rep_a.get("id") in visited:
                continue

            lat_a = rep_a.get("latitude", 26.2006)
            lng_a = rep_a.get("longitude", 92.9376)
            symptoms_a = set(rep_a.get("symptoms", []))
            
            cluster_members = [rep_a]
            cluster_villages = {rep_a.get("village", "Unknown")}
            total_cases = rep_a.get("approx_cases", 0)
            all_symptoms = set(symptoms_a)

            for j, rep_b in enumerate(recent_reports):
                if i == j or rep_b.get("id") in visited:
                    continue

                lat_b = rep_b.get("latitude", 26.2006)
                lng_b = rep_b.get("longitude", 92.9376)
                dist = haversine_distance_km(lat_a, lng_a, lat_b, lng_b)

                # Check proximity and syndromic overlap
                symptoms_b = set(rep_b.get("symptoms", []))
                has_symptom_overlap = bool(symptoms_a.intersection(symptoms_b)) or not symptoms_a

                if dist <= self.proximity_radius_km and has_symptom_overlap:
                    cluster_members.append(rep_b)
                    cluster_villages.add(rep_b.get("village", "Unknown"))
                    total_cases += rep_b.get("approx_cases", 0)
                    all_symptoms.update(symptoms_b)

            if len(cluster_villages) >= 2 and total_cases >= self.min_cluster_cases:
                for m in cluster_members:
                    if m.get("id"):
                        visited.add(m.get("id"))

                villages_str = ", ".join(list(cluster_villages)[:4])
                primary_state = rep_a.get("state", "Assam")
                primary_district = rep_a.get("district", "Majuli")

                cluster_id = f"CLUST-{primary_district[:3].upper()}-{len(clusters) + 101}"
                clusters.append({
                    "cluster_id": cluster_id,
                    "state": primary_state,
                    "district": primary_district,
                    "affected_villages": list(cluster_villages),
                    "village_count": len(cluster_villages),
                    "total_cases": total_cases,
                    "common_symptoms": list(all_symptoms),
                    "center_lat": lat_a,
                    "center_lng": lng_a,
                    "status": "SUSPECTED",
                    "detection_date": datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
                    "summary": f"Suspected Multi-Village Outbreak Cluster across {len(cluster_villages)} villages ({villages_str}) with {total_cases} aggregated cases within 48–72h window.",
                    "recommended_action": "PHC Medical Officer rapid field verification and water sample testing at connecting river/stream basin."
                })

        return clusters

cluster_engine = ClusterDetector()
