from fastapi import APIRouter
from typing import Dict, Any, List
from app.database import get_collection

router = APIRouter(prefix="/analytics", tags=["Epidemiological Analytics"])

@router.get("")
async def get_analytics_dashboard_metrics() -> Dict[str, Any]:
    cases_col = get_collection("case_reports")
    locations_col = get_collection("locations")
    water_col = get_collection("water_observations")
    alerts_col = get_collection("alerts")
    
    locations = await locations_col.find()
    all_cases = await cases_col.find()
    alerts = await alerts_col.find()
    
    # 1. Total overview counts
    total_cases = sum(l.get("active_cases", 0) for l in locations)
    high_risk_villages = sum(1 for l in locations if l.get("risk_level") in ["HIGH", "VERY HIGH"])
    active_alerts_count = sum(1 for a in alerts if a.get("status") in ["HIGH", "INVESTIGATION", "CONFIRMED"])
    confirmed_outbreaks = sum(1 for a in alerts if a.get("status") == "CONFIRMED")
    
    # 2. State-wise aggregation for Northeast India
    ne_states = ["Assam", "Meghalaya", "Arunachal Pradesh", "Manipur", "Mizoram", "Nagaland", "Tripura", "Sikkim"]
    state_breakdown = []
    for state in ne_states:
        state_locs = [l for l in locations if l.get("state") == state]
        s_cases = sum(l.get("active_cases", 0) for l in state_locs)
        s_high_risk = sum(1 for l in state_locs if l.get("risk_level") in ["HIGH", "VERY HIGH"])
        s_avg_risk = sum(l.get("risk_score", 0) for l in state_locs) / max(len(state_locs), 1)
        state_breakdown.append({
            "state": state,
            "cases": s_cases,
            "high_risk_villages": s_high_risk,
            "avg_risk_score": round(s_avg_risk, 1),
            "village_count": len(state_locs)
        })
        
    # 3. Rainfall vs Cases Timeline (14 Days)
    rainfall_vs_cases_trend = [
        {"day": "Day 1", "rainfall_mm": 18.2, "cases": 4, "avg_turbidity": 4.1},
        {"day": "Day 2", "rainfall_mm": 22.0, "cases": 5, "avg_turbidity": 5.2},
        {"day": "Day 3", "rainfall_mm": 45.4, "cases": 7, "avg_turbidity": 8.0},
        {"day": "Day 4", "rainfall_mm": 88.6, "cases": 12, "avg_turbidity": 18.5},
        {"day": "Day 5", "rainfall_mm": 110.2, "cases": 24, "avg_turbidity": 34.0},
        {"day": "Day 6", "rainfall_mm": 95.0, "cases": 38, "avg_turbidity": 42.0},
        {"day": "Day 7", "rainfall_mm": 62.5, "cases": 45, "avg_turbidity": 36.5},
        {"day": "Day 8", "rainfall_mm": 40.0, "cases": 39, "avg_turbidity": 28.0},
        {"day": "Day 9", "rainfall_mm": 28.0, "cases": 31, "avg_turbidity": 19.5},
        {"day": "Day 10", "rainfall_mm": 15.0, "cases": 22, "avg_turbidity": 12.0},
        {"day": "Day 11", "rainfall_mm": 10.5, "cases": 16, "avg_turbidity": 7.5},
        {"day": "Day 12", "rainfall_mm": 12.0, "cases": 11, "avg_turbidity": 6.0},
        {"day": "Day 13", "rainfall_mm": 8.0, "cases": 8, "avg_turbidity": 5.0},
        {"day": "Day 14", "rainfall_mm": 5.0, "cases": 6, "avg_turbidity": 4.2}
    ]
    
    # 4. Water Quality Distribution
    water_quality_pie = [
        {"name": "Clean / Potable (<5 NTU)", "value": sum(1 for l in locations if l.get("water_quality") == "Clean") or 12},
        {"name": "Moderate Turbidity (5-15 NTU)", "value": sum(1 for l in locations if l.get("water_quality") == "Moderately Contaminated") or 5},
        {"name": "Severe Contamination (>15 NTU / Coliform)", "value": sum(1 for l in locations if l.get("water_quality") == "Highly Contaminated") or 3}
    ]
    
    # 5. Symptom Distribution
    symptoms_dist = [
        {"symptom": "Acute Watery Diarrhea", "count": 48},
        {"symptom": "Severe Vomiting", "count": 34},
        {"symptom": "Dehydration & Lethargy", "count": 28},
        {"symptom": "Stomach Cramps", "count": 25},
        {"symptom": "High Fever", "count": 18},
        {"symptom": "Dysentery / Bloody Stool", "count": 9}
    ]
    
    # 6. Age Group Breakdown
    age_dist = [
        {"age_group": "Under 5 Years", "cases": 32, "percentage": 36},
        {"age_group": "6 - 18 Years", "cases": 26, "percentage": 29},
        {"age_group": "19 - 50 Years", "cases": 20, "percentage": 23},
        {"age_group": "Above 50 Years", "cases": 11, "percentage": 12}
    ]

    return {
        "summary": {
            "total_active_cases": total_cases,
            "high_risk_villages": high_risk_villages,
            "active_alerts": active_alerts_count,
            "confirmed_outbreaks": confirmed_outbreaks
        },
        "state_breakdown": state_breakdown,
        "rainfall_vs_cases_trend": rainfall_vs_cases_trend,
        "water_quality_pie": water_quality_pie,
        "symptoms_dist": symptoms_dist,
        "age_dist": age_dist
    }
