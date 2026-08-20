import random
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# 8 Northeast Indian States and key districts/villages
NE_LOCATIONS = [
    {"state": "Assam", "district": "Majuli", "village": "Garamur", "lat": 26.9634, "lng": 94.2144, "pop": 4200, "water_src": "River/Stream"},
    {"state": "Assam", "district": "Majuli", "village": "Kamalabari", "lat": 26.9400, "lng": 94.1800, "pop": 3800, "water_src": "River/Stream"},
    {"state": "Assam", "district": "Majuli", "village": "Jengraimukh", "lat": 27.0200, "lng": 94.3100, "pop": 2900, "water_src": "Handpump"},
    {"state": "Assam", "district": "Kamrup", "village": "Chaygaon", "lat": 26.0483, "lng": 91.4312, "pop": 5100, "water_src": "Tube Well"},
    {"state": "Assam", "district": "Kamrup", "village": "Hajo", "lat": 26.2483, "lng": 91.5262, "pop": 6200, "water_src": "Open Pond"},
    {"state": "Assam", "district": "Dhubri", "village": "Bilasipara", "lat": 26.2300, "lng": 90.2300, "pop": 4800, "water_src": "River/Stream"},
    {"state": "Meghalaya", "district": "East Khasi Hills", "village": "Mawsynram", "lat": 25.2975, "lng": 91.5826, "pop": 3100, "water_src": "Stream/Spring"},
    {"state": "Meghalaya", "district": "East Khasi Hills", "village": "Cherrapunji (Sohra)", "lat": 25.2702, "lng": 91.7323, "pop": 3500, "water_src": "Spring"},
    {"state": "Meghalaya", "district": "West Garo Hills", "village": "Tura Rural", "lat": 25.5144, "lng": 90.2201, "pop": 4400, "water_src": "Handpump"},
    {"state": "Arunachal Pradesh", "district": "Papum Pare", "village": "Doimukh", "lat": 27.1398, "lng": 93.7501, "pop": 2600, "water_src": "Stream"},
    {"state": "Arunachal Pradesh", "district": "Changlang", "village": "Miao", "lat": 27.4891, "lng": 96.2084, "pop": 2100, "water_src": "River/Stream"},
    {"state": "Manipur", "district": "Bishnupur", "village": "Moirang (Loktak Lake)", "lat": 24.4988, "lng": 93.7719, "pop": 5400, "water_src": "Lake/Open Pond"},
    {"state": "Manipur", "district": "Imphal West", "village": "Lamsang", "lat": 24.8510, "lng": 93.8760, "pop": 3900, "water_src": "Handpump"},
    {"state": "Mizoram", "district": "Aizawl", "village": "Durtlang", "lat": 23.7745, "lng": 92.7302, "pop": 3200, "water_src": "Spring"},
    {"state": "Mizoram", "district": "Lunglei", "village": "Haulawng", "lat": 22.8800, "lng": 92.8300, "pop": 1900, "water_src": "Rainwater Tank"},
    {"state": "Nagaland", "district": "Kohima", "village": "Khonoma", "lat": 25.6492, "lng": 94.0203, "pop": 2300, "water_src": "Stream"},
    {"state": "Nagaland", "district": "Dimapur", "village": "Chumukedima", "lat": 25.8000, "lng": 93.7700, "pop": 6100, "water_src": "Tube Well"},
    {"state": "Tripura", "district": "West Tripura", "village": "Ranirbazar", "lat": 23.8315, "lng": 91.3592, "pop": 4700, "water_src": "Open Pond"},
    {"state": "Tripura", "district": "Dhalai", "village": "Ambassa Rural", "lat": 23.9200, "lng": 91.8500, "pop": 3100, "water_src": "Handpump"},
    {"state": "Sikkim", "district": "East Sikkim", "village": "Singtam", "lat": 27.2340, "lng": 88.4980, "pop": 2800, "water_src": "Spring"},
]

SYMPTOM_LIST = [
    "Acute Watery Diarrhea",
    "Severe Vomiting",
    "Stomach Cramps",
    "High Fever",
    "Dehydration & Lethargy",
    "Bloody Stool / Dysentery",
    "Nausea"
]

def generate_synthetic_dataset(num_samples: int = 1200) -> pd.DataFrame:
    random.seed(42)
    np.random.seed(42)
    
    rows = []
    base_date = datetime(2026, 6, 1) # Typical monsoon onset in NER
    
    for i in range(num_samples):
        loc = random.choice(NE_LOCATIONS)
        date_offset = random.randint(0, 75)
        sample_date = base_date + timedelta(days=date_offset)
        
        # Environmental factors
        is_monsoon = 6 <= sample_date.month <= 8
        rainfall_mm = random.uniform(20, 180) if is_monsoon and random.random() > 0.3 else random.uniform(0, 45)
        
        flood_status = "Normal"
        if rainfall_mm > 90 or (loc["village"] in ["Garamur", "Kamalabari", "Bilasipara"] and rainfall_mm > 50):
            flood_status = random.choice(["Waterlogging", "Severe Flood"])
        
        # Water quality
        turbidity_ntu = random.uniform(8, 65) if flood_status != "Normal" else random.uniform(1.2, 12.0)
        coliform_pos = 1 if (turbidity_ntu > 15 or flood_status != "Normal" or random.random() > 0.65) else 0
        water_quality = "Highly Contaminated" if coliform_pos and turbidity_ntu > 20 else ("Moderately Contaminated" if coliform_pos or turbidity_ntu > 10 else "Clean")
        
        sanitation_status = random.choice(["Poor Sanitation", "Pit Latrine", "Open Defecation Free"])
        sanitation_score = 0.2 if sanitation_status == "Poor Sanitation" else (0.6 if sanitation_status == "Pit Latrine" else 1.0)
        
        # Historical baseline cases
        historical_cases = random.randint(0, 4)
        prev_7day_cases = random.randint(1, 8)
        
        # Determine outbreak simulation
        is_surge_scenario = (flood_status != "Normal" and coliform_pos and random.random() > 0.35) or (turbidity_ntu > 30 and random.random() > 0.4)
        if is_surge_scenario:
            cases = random.randint(12, 45)
            symptoms_picked = random.sample(SYMPTOM_LIST, k=random.randint(3, 5))
        else:
            cases = random.randint(0, 7)
            symptoms_picked = random.sample(SYMPTOM_LIST, k=random.randint(1, 2))
            
        case_growth = (cases - prev_7day_cases) / max(prev_7day_cases, 1)
        
        # Ground truth risk calculation for synthetic ML supervision
        score_val = (
            (case_growth * 25.0) +
            (min(rainfall_mm, 150) / 150.0 * 20.0) +
            (40.0 if flood_status == "Severe Flood" else (20.0 if flood_status == "Waterlogging" else 0.0)) +
            (25.0 if coliform_pos else 5.0) +
            (min(turbidity_ntu, 50) / 50.0 * 15.0) +
            ((1.0 - sanitation_score) * 15.0)
        )
        risk_score = int(max(5, min(98, score_val + random.uniform(-6, 6))))
        
        if risk_score <= 30:
            risk_level = "LOW"
        elif risk_score <= 60:
            risk_level = "MEDIUM"
        elif risk_score <= 80:
            risk_level = "HIGH"
        else:
            risk_level = "VERY HIGH"
            
        rows.append({
            "date": sample_date.strftime("%Y-%m-%d"),
            "state": loc["state"],
            "district": loc["district"],
            "village": loc["village"],
            "population": loc["pop"],
            "latitude": loc["lat"],
            "longitude": loc["lng"],
            "water_source": loc["water_src"],
            "cases": cases,
            "previous_7day_cases": prev_7day_cases,
            "case_growth": round(case_growth, 2),
            "symptoms": ", ".join(symptoms_picked),
            "rainfall_mm": round(rainfall_mm, 1),
            "flood_status": flood_status,
            "water_quality": water_quality,
            "turbidity_ntu": round(turbidity_ntu, 1),
            "coliform_presence": coliform_pos,
            "sanitation_status": sanitation_status,
            "historical_cases": historical_cases,
            "risk_score": risk_score,
            "risk_level": risk_level
        })
        
    return pd.DataFrame(rows)
