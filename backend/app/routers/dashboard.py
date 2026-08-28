from fastapi import APIRouter
from app.database import get_locations_col, get_alerts_col, get_field_reports_col, get_infrastructure_col
from datetime import datetime

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("")
async def get_dashboard_summary():
    locations_col = get_locations_col()
    alerts_col = get_alerts_col()
    field_reports_col = get_field_reports_col()
    infra_col = get_infrastructure_col()

    locs = await locations_col.find()
    alerts = await alerts_col.find()
    reports = await field_reports_col.find()
    infra = await infra_col.find()

    # Calculate risk bands
    low_count = sum(1 for l in locs if l.get("risk_score", 0) <= 30)
    mod_count = sum(1 for l in locs if 31 <= l.get("risk_score", 0) <= 60)
    high_count = sum(1 for l in locs if 61 <= l.get("risk_score", 0) <= 80)
    crit_count = sum(1 for l in locs if l.get("risk_score", 0) >= 81)

    active_warnings = [a for a in alerts if a.get("status") in ["WARNING", "CRITICAL", "VERIFIED_LANDSLIDE"]]
    rainfall_alerts = [l for l in locs if l.get("rainfall_24h", 0) >= 100.0 or l.get("rainfall_48h", 0) >= 160.0]
    total_pop_at_risk = sum(l.get("population", 0) for l in locs if l.get("risk_score", 0) >= 61)
    blocked_roads = [i for i in infra if i.get("type") == "Road" and i.get("status") in ["BLOCKED", "VULNERABLE"]]

    # State by state summary breakdown
    states_data = {}
    for l in locs:
        s = l.get("state", "Assam")
        if s not in states_data:
            states_data[s] = {"state": s, "nodes": 0, "max_risk": 0, "avg_risk": 0, "total_risk_sum": 0, "rainfall_24h": 0, "pop_exposed": 0}
        states_data[s]["nodes"] += 1
        r_score = l.get("risk_score", 0)
        states_data[s]["total_risk_sum"] += r_score
        states_data[s]["max_risk"] = max(states_data[s]["max_risk"], r_score)
        states_data[s]["rainfall_24h"] = max(states_data[s]["rainfall_24h"], l.get("rainfall_24h", 0))
        if r_score >= 61:
            states_data[s]["pop_exposed"] += l.get("population", 0)

    state_ranking = []
    for s, data in states_data.items():
        avg = round(data["total_risk_sum"] / max(data["nodes"], 1), 1)
        level = "CRITICAL" if data["max_risk"] >= 81 else ("HIGH" if data["max_risk"] >= 61 else ("MODERATE" if data["max_risk"] >= 31 else "LOW"))
        state_ranking.append({
            "state": s,
            "monitored_slopes": data["nodes"],
            "max_risk_score": data["max_risk"],
            "average_risk": avg,
            "highest_risk_level": level,
            "peak_rainfall_24h_mm": round(data["rainfall_24h"], 1),
            "population_at_risk": data["pop_exposed"]
        })

    state_ranking.sort(key=lambda x: x["max_risk_score"], reverse=True)

    return {
        "summary": {
            "low_risk_zones": low_count,
            "moderate_risk_zones": mod_count,
            "high_risk_zones": high_count,
            "critical_risk_zones": crit_count,
            "active_official_warnings": len(active_warnings),
            "rainfall_threshold_alerts": len(rainfall_alerts),
            "total_population_at_risk": total_pop_at_risk,
            "total_monitored_slopes": len(locs),
            "unresolved_field_reports": sum(1 for r in reports if r.get("status") == "PENDING_VERIFICATION"),
            "critical_roads_at_risk": len(blocked_roads)
        },
        "state_ranking": state_ranking,
        "recent_alerts": alerts[:4],
        "recent_field_reports": reports[:4],
        "rainfall_triggers": [
            {
                "village": l.get("village"),
                "district": l.get("district"),
                "state": l.get("state"),
                "rainfall_24h_mm": l.get("rainfall_24h", 0),
                "rainfall_48h_mm": l.get("rainfall_48h", 0),
                "risk_score": l.get("risk_score", 0),
                "risk_level": l.get("risk_level", "LOW")
            }
            for l in rainfall_alerts
        ],
        "server_time": datetime.utcnow().isoformat(),
        "disclaimer": "AI detects and predicts landslide risk signals; authorized disaster management authorities make response decisions."
    }
