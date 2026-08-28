import asyncio
from datetime import datetime, timedelta
from app.config import settings
from app.database import (
    get_users_col, get_locations_col, get_infrastructure_col,
    get_evacuation_centers_col, get_alerts_col, get_field_reports_col,
    get_landslide_history_col, get_audit_logs_col, connect_db, close_db
)
from app.auth import get_password_hash
from app.ml.model import landslide_ml_engine

DEMO_USERS = [
    {
        "name": "Arun Bordoloi (Ground Surveyor)",
        "email": "field@swasthyajal.gov.in",
        "password": get_password_hash("password123"),
        "role": "FIELD_WORKER",
        "state": "Assam",
        "district": "Dima Hasao",
        "village": "Haflong",
        "phone": "+91 94350 11001",
        "designation": "Field Landslide Surveyor & Rapid GPS Scout",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "name": "Nandita Hazarika (Block Disaster Officer)",
        "email": "block@swasthyajal.gov.in",
        "password": get_password_hash("password123"),
        "role": "BLOCK_OFFICER",
        "state": "Assam",
        "district": "Dima Hasao",
        "village": "Haflong Block HQ",
        "phone": "+91 94350 11002",
        "designation": "Block Disaster Management Officer",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "name": "Dr. Subhashish Deb (District Disaster Officer)",
        "email": "district@swasthyajal.gov.in",
        "password": get_password_hash("password123"),
        "role": "DISTRICT_OFFICER",
        "state": "Assam",
        "district": "Dima Hasao",
        "village": "District Emergency Operations Centre",
        "phone": "+91 94350 11003",
        "designation": "DDMA Incident Commander & Verification Officer",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "name": "Smt. K. Sangma (State Disaster Authority)",
        "email": "authority@swasthyajal.gov.in",
        "password": get_password_hash("password123"),
        "role": "AUTHORITY",
        "state": "Meghalaya",
        "district": "East Khasi Hills",
        "village": "State EOC Khanapara",
        "phone": "+91 94350 11004",
        "designation": "State Disaster Management Authority (SDMA) Director",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "name": "System Administrator",
        "email": "admin@swasthyajal.gov.in",
        "password": get_password_hash("password123"),
        "role": "ADMIN",
        "state": "Assam",
        "district": "Guwahati HQ",
        "village": "Dispur EOC",
        "phone": "+91 94350 11005",
        "designation": "State Disaster Geospatial Admin",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "name": "Public Citizen",
        "email": "public@swasthyajal.gov.in",
        "password": get_password_hash("password123"),
        "role": "PUBLIC",
        "state": "Assam",
        "district": "Dima Hasao",
        "village": "Haflong",
        "phone": "+91 94350 11006",
        "designation": "Public Citizen Portal",
        "created_at": datetime.utcnow().isoformat()
    }
]

# 25+ Realistic Landslide Hotspots covering all 8 Northeast States
NORTHEAST_SLOPE_LOCATIONS = [
    # --- Assam ---
    {
        "village": "Haflong Hill Cut",
        "district": "Dima Hasao",
        "state": "Assam",
        "latitude": 25.1697,
        "longitude": 93.0182,
        "elevation_m": 968.0,
        "slope_degrees": 42.5,
        "aspect": "South-West",
        "soil_type": "Clayey Loam over Saturated Shale",
        "population": 4850,
        "rainfall_1h": 18.2,
        "rainfall_6h": 48.5,
        "rainfall_24h": 178.4,
        "rainfall_48h": 263.1,
        "rainfall_72h": 312.0,
        "soil_moisture_pct": 86.4,
        "pore_water_pressure_kpa": 28.5,
        "distance_to_road_m": 45.0,
        "distance_to_river_m": 210.0,
        "historical_landslides_count": 7,
        "vegetation_ndvi": 0.38,
        "associated_highway": "NH-27 (Lumding-Silchar Hill Section)"
    },
    {
        "village": "Jatinga Pass",
        "district": "Dima Hasao",
        "state": "Assam",
        "latitude": 25.1215,
        "longitude": 93.0375,
        "elevation_m": 820.0,
        "slope_degrees": 38.0,
        "aspect": "South",
        "soil_type": "Weathered Sandstone & Clay",
        "population": 2200,
        "rainfall_1h": 14.5,
        "rainfall_6h": 41.0,
        "rainfall_24h": 152.0,
        "rainfall_48h": 224.5,
        "rainfall_72h": 270.0,
        "soil_moisture_pct": 82.0,
        "pore_water_pressure_kpa": 24.2,
        "distance_to_road_m": 60.0,
        "distance_to_river_m": 350.0,
        "historical_landslides_count": 5,
        "vegetation_ndvi": 0.42,
        "associated_highway": "NH-27 Highway Corridor"
    },
    {
        "village": "Maligaon Narakasur Hills",
        "district": "Kamrup Metropolitan",
        "state": "Assam",
        "latitude": 26.1584,
        "longitude": 91.6961,
        "elevation_m": 240.0,
        "slope_degrees": 34.5,
        "aspect": "North-East",
        "soil_type": "Red Sandy Loam",
        "population": 6500,
        "rainfall_1h": 8.0,
        "rainfall_6h": 22.5,
        "rainfall_24h": 68.0,
        "rainfall_48h": 94.0,
        "rainfall_72h": 115.0,
        "soil_moisture_pct": 64.0,
        "pore_water_pressure_kpa": 14.5,
        "distance_to_road_m": 20.0,
        "distance_to_river_m": 850.0,
        "historical_landslides_count": 3,
        "vegetation_ndvi": 0.48,
        "associated_highway": "AT Road / Maligaon Bypass"
    },
    {
        "village": "Diphu Hill Slope",
        "district": "Karbi Anglong",
        "state": "Assam",
        "latitude": 25.8443,
        "longitude": 93.4328,
        "elevation_m": 310.0,
        "slope_degrees": 29.0,
        "aspect": "East",
        "soil_type": "Gneissic Weathered Soil",
        "population": 3800,
        "rainfall_1h": 4.5,
        "rainfall_6h": 15.0,
        "rainfall_24h": 42.0,
        "rainfall_48h": 60.0,
        "rainfall_72h": 75.0,
        "soil_moisture_pct": 52.0,
        "pore_water_pressure_kpa": 11.0,
        "distance_to_road_m": 120.0,
        "distance_to_river_m": 420.0,
        "historical_landslides_count": 2,
        "vegetation_ndvi": 0.62,
        "associated_highway": "SH-19 Diphu-Manja Road"
    },
    # --- Meghalaya ---
    {
        "village": "Mawsynram Rim",
        "district": "East Khasi Hills",
        "state": "Meghalaya",
        "latitude": 25.2986,
        "longitude": 91.5822,
        "elevation_m": 1400.0,
        "slope_degrees": 46.0,
        "aspect": "South",
        "soil_type": "Highly Fractured Sandstone & Silt",
        "population": 3100,
        "rainfall_1h": 26.4,
        "rainfall_6h": 78.0,
        "rainfall_24h": 284.5,
        "rainfall_48h": 412.0,
        "rainfall_72h": 530.0,
        "soil_moisture_pct": 94.2,
        "pore_water_pressure_kpa": 36.8,
        "distance_to_road_m": 30.0,
        "distance_to_river_m": 120.0,
        "historical_landslides_count": 9,
        "vegetation_ndvi": 0.52,
        "associated_highway": "Shillong-Mawsynram Road"
    },
    {
        "village": "Sohra Cherrapunji Gorges",
        "district": "East Khasi Hills",
        "state": "Meghalaya",
        "latitude": 25.2702,
        "longitude": 91.7323,
        "elevation_m": 1480.0,
        "slope_degrees": 44.0,
        "aspect": "South-East",
        "soil_type": "Limestone Escarpment with Shale Overburden",
        "population": 4200,
        "rainfall_1h": 22.0,
        "rainfall_6h": 65.0,
        "rainfall_24h": 245.0,
        "rainfall_48h": 368.0,
        "rainfall_72h": 460.0,
        "soil_moisture_pct": 91.0,
        "pore_water_pressure_kpa": 32.4,
        "distance_to_road_m": 50.0,
        "distance_to_river_m": 90.0,
        "historical_landslides_count": 8,
        "vegetation_ndvi": 0.45,
        "associated_highway": "NH-206 Sohra Road"
    },
    {
        "village": "Sonapur Tunnel Approach",
        "district": "East Jaintia Hills",
        "state": "Meghalaya",
        "latitude": 25.1092,
        "longitude": 92.3685,
        "elevation_m": 640.0,
        "slope_degrees": 48.0,
        "aspect": "West",
        "soil_type": "Unstable Colluvial Debris over Coal Measures",
        "population": 1800,
        "rainfall_1h": 20.5,
        "rainfall_6h": 56.0,
        "rainfall_24h": 195.0,
        "rainfall_48h": 288.0,
        "rainfall_72h": 340.0,
        "soil_moisture_pct": 89.0,
        "pore_water_pressure_kpa": 31.0,
        "distance_to_road_m": 15.0,
        "distance_to_river_m": 180.0,
        "historical_landslides_count": 11,
        "vegetation_ndvi": 0.32,
        "associated_highway": "NH-6 (Lifeline to Barak Valley & Tripura)"
    },
    # --- Arunachal Pradesh ---
    {
        "village": "Tawang Monastery Escarpment",
        "district": "Tawang",
        "state": "Arunachal Pradesh",
        "latitude": 27.5861,
        "longitude": 91.8594,
        "elevation_m": 3048.0,
        "slope_degrees": 41.0,
        "aspect": "East",
        "soil_type": "Glacial Drift & Granitic Gneiss",
        "population": 5200,
        "rainfall_1h": 12.0,
        "rainfall_6h": 34.0,
        "rainfall_24h": 118.0,
        "rainfall_48h": 175.0,
        "rainfall_72h": 220.0,
        "soil_moisture_pct": 77.5,
        "pore_water_pressure_kpa": 22.0,
        "distance_to_road_m": 80.0,
        "distance_to_river_m": 540.0,
        "historical_landslides_count": 6,
        "vegetation_ndvi": 0.49,
        "associated_highway": "NH-13 Trans-Arunachal Highway"
    },
    {
        "village": "Bhalukpong Sessa Cut",
        "district": "West Kameng",
        "state": "Arunachal Pradesh",
        "latitude": 27.0125,
        "longitude": 92.6482,
        "elevation_m": 580.0,
        "slope_degrees": 43.5,
        "aspect": "South-West",
        "soil_type": "Siwalik Friable Sandstone",
        "population": 2900,
        "rainfall_1h": 16.0,
        "rainfall_6h": 46.0,
        "rainfall_24h": 162.0,
        "rainfall_48h": 240.0,
        "rainfall_72h": 295.0,
        "soil_moisture_pct": 84.0,
        "pore_water_pressure_kpa": 26.5,
        "distance_to_road_m": 25.0,
        "distance_to_river_m": 150.0,
        "historical_landslides_count": 8,
        "vegetation_ndvi": 0.41,
        "associated_highway": "Bhalukpong-Bomdila-Tawang Highway"
    },
    {
        "village": "Itanagar Ganga Lake Ridge",
        "district": "Papum Pare",
        "state": "Arunachal Pradesh",
        "latitude": 27.0844,
        "longitude": 93.6053,
        "elevation_m": 420.0,
        "slope_degrees": 33.0,
        "aspect": "North",
        "soil_type": "Pebbly Sandstone",
        "population": 7800,
        "rainfall_1h": 6.5,
        "rainfall_6h": 19.0,
        "rainfall_24h": 54.0,
        "rainfall_48h": 78.0,
        "rainfall_72h": 95.0,
        "soil_moisture_pct": 58.0,
        "pore_water_pressure_kpa": 13.0,
        "distance_to_road_m": 60.0,
        "distance_to_river_m": 600.0,
        "historical_landslides_count": 3,
        "vegetation_ndvi": 0.58,
        "associated_highway": "NH-415 Itanagar-Naharlagun"
    },
    # --- Sikkim ---
    {
        "village": "Gangtok 9th Mile Cut",
        "district": "East Sikkim",
        "state": "Sikkim",
        "latitude": 27.3389,
        "longitude": 88.6065,
        "elevation_m": 1650.0,
        "slope_degrees": 45.0,
        "aspect": "East",
        "soil_type": "Phyllite & Weathered Schist",
        "population": 8900,
        "rainfall_1h": 17.5,
        "rainfall_6h": 52.0,
        "rainfall_24h": 182.0,
        "rainfall_48h": 268.0,
        "rainfall_72h": 320.0,
        "soil_moisture_pct": 87.0,
        "pore_water_pressure_kpa": 29.0,
        "distance_to_road_m": 20.0,
        "distance_to_river_m": 310.0,
        "historical_landslides_count": 9,
        "vegetation_ndvi": 0.39,
        "associated_highway": "NH-10 (Siliguri-Gangtok Highway)"
    },
    {
        "village": "Mangan Chungthang Sector",
        "district": "North Sikkim",
        "state": "Sikkim",
        "latitude": 27.5082,
        "longitude": 88.5284,
        "elevation_m": 1780.0,
        "slope_degrees": 49.0,
        "aspect": "North-West",
        "soil_type": "Morainic Boulder Matrix",
        "population": 2100,
        "rainfall_1h": 19.0,
        "rainfall_6h": 58.0,
        "rainfall_24h": 210.0,
        "rainfall_48h": 310.0,
        "rainfall_72h": 380.0,
        "soil_moisture_pct": 92.5,
        "pore_water_pressure_kpa": 34.0,
        "distance_to_road_m": 35.0,
        "distance_to_river_m": 80.0,
        "historical_landslides_count": 10,
        "vegetation_ndvi": 0.44,
        "associated_highway": "North Sikkim Highway (Teesta Valley)"
    },
    # --- Nagaland ---
    {
        "village": "Kohima By-pass Phesama",
        "district": "Kohima",
        "state": "Nagaland",
        "latitude": 25.6412,
        "longitude": 94.1124,
        "elevation_m": 1440.0,
        "slope_degrees": 39.5,
        "aspect": "West",
        "soil_type": "Disang Shales with Active Creep",
        "population": 6100,
        "rainfall_1h": 13.5,
        "rainfall_6h": 39.0,
        "rainfall_24h": 135.0,
        "rainfall_48h": 198.0,
        "rainfall_72h": 240.0,
        "soil_moisture_pct": 81.0,
        "pore_water_pressure_kpa": 23.5,
        "distance_to_road_m": 40.0,
        "distance_to_river_m": 450.0,
        "historical_landslides_count": 6,
        "vegetation_ndvi": 0.47,
        "associated_highway": "NH-29 (Dimapur-Kohima-Imphal Lifeline)"
    },
    {
        "village": "Mokokchung Ungma Slope",
        "district": "Mokokchung",
        "state": "Nagaland",
        "latitude": 26.3218,
        "longitude": 94.5211,
        "elevation_m": 1320.0,
        "slope_degrees": 31.0,
        "aspect": "South-East",
        "soil_type": "Weathered Clay Sandstone",
        "population": 3400,
        "rainfall_1h": 5.0,
        "rainfall_6h": 16.0,
        "rainfall_24h": 46.0,
        "rainfall_48h": 68.0,
        "rainfall_72h": 85.0,
        "soil_moisture_pct": 55.0,
        "pore_water_pressure_kpa": 12.0,
        "distance_to_road_m": 90.0,
        "distance_to_river_m": 600.0,
        "historical_landslides_count": 2,
        "vegetation_ndvi": 0.60,
        "associated_highway": "NH-702 Mokokchung Road"
    },
    # --- Manipur ---
    {
        "village": "Tupul Railway Yard Slopes",
        "district": "Noney",
        "state": "Manipur",
        "latitude": 24.8194,
        "longitude": 93.6558,
        "elevation_m": 720.0,
        "slope_degrees": 47.0,
        "aspect": "North-East",
        "soil_type": "Disang Shale Saturated Debris",
        "population": 1950,
        "rainfall_1h": 21.0,
        "rainfall_6h": 60.0,
        "rainfall_24h": 215.0,
        "rainfall_48h": 320.0,
        "rainfall_72h": 390.0,
        "soil_moisture_pct": 93.0,
        "pore_water_pressure_kpa": 35.0,
        "distance_to_road_m": 30.0,
        "distance_to_river_m": 60.0,
        "historical_landslides_count": 8,
        "vegetation_ndvi": 0.35,
        "associated_highway": "Jiribam-Imphal Railway Line & NH-37"
    },
    {
        "village": "Senapati Hill Bazaar",
        "district": "Senapati",
        "state": "Manipur",
        "latitude": 25.2654,
        "longitude": 94.0198,
        "elevation_m": 1280.0,
        "slope_degrees": 36.0,
        "aspect": "East",
        "soil_type": "Silty Clay Loam",
        "population": 4800,
        "rainfall_1h": 9.0,
        "rainfall_6h": 26.0,
        "rainfall_24h": 78.0,
        "rainfall_48h": 112.0,
        "rainfall_72h": 140.0,
        "soil_moisture_pct": 68.0,
        "pore_water_pressure_kpa": 17.0,
        "distance_to_road_m": 50.0,
        "distance_to_river_m": 320.0,
        "historical_landslides_count": 4,
        "vegetation_ndvi": 0.54,
        "associated_highway": "NH-2 Imphal-Dimapur Highway"
    },
    # --- Mizoram ---
    {
        "village": "Aizawl Laipuitlang Slope",
        "district": "Aizawl",
        "state": "Mizoram",
        "latitude": 23.7307,
        "longitude": 92.7173,
        "elevation_m": 1132.0,
        "slope_degrees": 44.5,
        "aspect": "West",
        "soil_type": "Bhuban Siltstone & Weathered Clay",
        "population": 9400,
        "rainfall_1h": 18.0,
        "rainfall_6h": 50.0,
        "rainfall_24h": 172.0,
        "rainfall_48h": 254.0,
        "rainfall_72h": 305.0,
        "soil_moisture_pct": 85.0,
        "pore_water_pressure_kpa": 27.0,
        "distance_to_road_m": 15.0,
        "distance_to_river_m": 420.0,
        "historical_landslides_count": 7,
        "vegetation_ndvi": 0.36,
        "associated_highway": "NH-54 (Aizawl-Lunglei Highway)"
    },
    {
        "village": "Champhai Border Ridge",
        "district": "Champhai",
        "state": "Mizoram",
        "latitude": 23.4735,
        "longitude": 93.3275,
        "elevation_m": 1350.0,
        "slope_degrees": 35.0,
        "aspect": "East",
        "soil_type": "Tertiary Sandstone",
        "population": 3600,
        "rainfall_1h": 8.5,
        "rainfall_6h": 24.0,
        "rainfall_24h": 72.0,
        "rainfall_48h": 105.0,
        "rainfall_72h": 130.0,
        "soil_moisture_pct": 65.0,
        "pore_water_pressure_kpa": 16.0,
        "distance_to_road_m": 70.0,
        "distance_to_river_m": 500.0,
        "historical_landslides_count": 3,
        "vegetation_ndvi": 0.59,
        "associated_highway": "NH-102B Champhai-Zokhawthar Road"
    },
    # --- Tripura ---
    {
        "village": "Jampui Hills Ridge",
        "district": "North Tripura",
        "state": "Tripura",
        "latitude": 23.8964,
        "longitude": 92.2741,
        "elevation_m": 930.0,
        "slope_degrees": 28.0,
        "aspect": "North",
        "soil_type": "Lateritic Sandstone Loam",
        "population": 2800,
        "rainfall_1h": 4.0,
        "rainfall_6h": 12.0,
        "rainfall_24h": 36.0,
        "rainfall_48h": 52.0,
        "rainfall_72h": 68.0,
        "soil_moisture_pct": 48.0,
        "pore_water_pressure_kpa": 9.5,
        "distance_to_road_m": 110.0,
        "distance_to_river_m": 720.0,
        "historical_landslides_count": 1,
        "vegetation_ndvi": 0.68,
        "associated_highway": "Kanchanpur-Vanghmun Road"
    },
    {
        "village": "Atharamura Range Pass",
        "district": "Khowai",
        "state": "Tripura",
        "latitude": 23.9456,
        "longitude": 91.6842,
        "elevation_m": 450.0,
        "slope_degrees": 26.5,
        "aspect": "East",
        "soil_type": "Clayey Sand",
        "population": 2100,
        "rainfall_1h": 3.0,
        "rainfall_6h": 10.0,
        "rainfall_24h": 28.0,
        "rainfall_48h": 42.0,
        "rainfall_72h": 55.0,
        "soil_moisture_pct": 44.0,
        "pore_water_pressure_kpa": 8.0,
        "distance_to_road_m": 85.0,
        "distance_to_river_m": 800.0,
        "historical_landslides_count": 1,
        "vegetation_ndvi": 0.72,
        "associated_highway": "NH-8 (Assam-Agartala Highway)"
    }
]

DEMO_INFRASTRUCTURE = [
    {
        "name": "NH-27 Lumding-Haflong Highway",
        "type": "Road",
        "state": "Assam",
        "district": "Dima Hasao",
        "latitude": 25.1750,
        "longitude": 93.0200,
        "criticality": "CRITICAL",
        "status": "VULNERABLE",
        "alternative_route": "Lumding-Lanka bypass available with 45km detour"
    },
    {
        "name": "Sonapur Tunnel & Bridge NH-6",
        "type": "Bridge",
        "state": "Meghalaya",
        "district": "East Jaintia Hills",
        "latitude": 25.1092,
        "longitude": 92.3685,
        "criticality": "CRITICAL",
        "status": "BLOCKED",
        "alternative_route": "No alternate all-weather route for heavy trucks"
    },
    {
        "name": "NH-10 Sevoke-Gangtok Corridor",
        "type": "Road",
        "state": "Sikkim",
        "district": "East Sikkim",
        "latitude": 27.3350,
        "longitude": 88.6050,
        "criticality": "CRITICAL",
        "status": "VULNERABLE",
        "alternative_route": "Via Lava-Algarah-Reshi Road"
    },
    {
        "name": "Kohima-Phesama Bypass NH-29",
        "type": "Road",
        "state": "Nagaland",
        "district": "Kohima",
        "latitude": 25.6412,
        "longitude": 94.1124,
        "criticality": "HIGH",
        "status": "VULNERABLE",
        "alternative_route": "Old Kohima town interior link"
    },
    {
        "name": "Jiribam-Tupul Railway Bridge Pier 164",
        "type": "Railway",
        "state": "Manipur",
        "district": "Noney",
        "latitude": 24.8194,
        "longitude": 93.6558,
        "criticality": "CRITICAL",
        "status": "VULNERABLE",
        "alternative_route": "Railway movement suspended pending geological scan"
    },
    {
        "name": "Haflong Civil District Hospital",
        "type": "Hospital",
        "state": "Assam",
        "district": "Dima Hasao",
        "latitude": 25.1620,
        "longitude": 93.0150,
        "criticality": "CRITICAL",
        "status": "OPERATIONAL",
        "alternative_route": "Helipad accessible for medical air-evacuation"
    }
]

DEMO_EVACUATION_CENTERS = [
    {
        "name": "Haflong District Indoor Sports Stadium",
        "type": "Sports Complex / Community Shelter",
        "state": "Assam",
        "district": "Dima Hasao",
        "latitude": 25.1720,
        "longitude": 93.0120,
        "capacity": 1500,
        "current_occupancy": 120,
        "contact": "112 / DDMA Control Room: 03673-236324",
        "facilities": "Drinking Water, Solar Generator, First Aid Post, Separate Women Wing"
    },
    {
        "name": "Mawsynram Higher Secondary School Complex",
        "type": "School Shelter",
        "state": "Meghalaya",
        "district": "East Khasi Hills",
        "latitude": 25.2950,
        "longitude": 91.5850,
        "capacity": 800,
        "current_occupancy": 45,
        "contact": "112 / BDO Mawsynram: 0364-259021",
        "facilities": "Rainwater Harvesting, Dry Ration Storage, Emergency Generator"
    },
    {
        "name": "Tawang Government Higher Secondary Hall",
        "type": "Community Hall",
        "state": "Arunachal Pradesh",
        "district": "Tawang",
        "latitude": 27.5820,
        "longitude": 91.8550,
        "capacity": 1200,
        "current_occupancy": 0,
        "contact": "112 / Tawang District EOC: 03794-222225",
        "facilities": "Heating Facilities, Emergency Blankets, Medical Officer on duty"
    },
    {
        "name": "Paljor Stadium Indoor Hall",
        "type": "Stadium Shelter",
        "state": "Sikkim",
        "district": "East Sikkim",
        "latitude": 27.3320,
        "longitude": 88.6120,
        "capacity": 2000,
        "current_occupancy": 210,
        "contact": "112 / Sikkim SDMA: 03592-202720",
        "facilities": "Medical Triage, Full Sanitation, Satellite Wi-Fi Link"
    },
    {
        "name": "Kohima Indoor Badminton Stadium",
        "type": "Community Shelter",
        "state": "Nagaland",
        "district": "Kohima",
        "latitude": 25.6650,
        "longitude": 94.1080,
        "capacity": 1000,
        "current_occupancy": 0,
        "contact": "112 / NSDMA Control Room: 0370-2270050",
        "facilities": "Drinking Water, Food Distribution Center, Ambulance Bay"
    },
    {
        "name": "Aizawl Dawrpui Multipurpose Centre",
        "type": "Multipurpose Hall",
        "state": "Mizoram",
        "district": "Aizawl",
        "latitude": 23.7340,
        "longitude": 92.7150,
        "capacity": 900,
        "current_occupancy": 85,
        "contact": "112 / Mizoram Disaster EOC: 0389-2335842",
        "facilities": "High Elevation Safe Zone, Water Reservoirs, Emergency Medical Kit"
    }
]

async def seed_database():
    print("Connecting to MongoDB for seeding ner_landslide_db...")
    connect_db()

    users_col = get_users_col()
    locs_col = get_locations_col()
    infra_col = get_infrastructure_col()
    shelters_col = get_evacuation_centers_col()
    alerts_col = get_alerts_col()
    reports_col = get_field_reports_col()
    history_col = get_landslide_history_col()
    audit_col = get_audit_logs_col()

    # 1. Clear existing collections
    print("Clearing previous collections in ner_landslide_db...")
    await users_col.delete_many({})
    await locs_col.delete_many({})
    await infra_col.delete_many({})
    await shelters_col.delete_many({})
    await alerts_col.delete_many({})
    await reports_col.delete_many({})
    await history_col.delete_many({})
    await audit_col.delete_many({})

    # 2. Insert Demo Users
    print(f"Seeding {len(DEMO_USERS)} demo accounts...")
    await users_col.insert_many(DEMO_USERS)

    # 3. Calculate Real ML Risk Predictions & Insert Locations
    print(f"Running ML Engine on {len(NORTHEAST_SLOPE_LOCATIONS)} locations...")
    locations_to_insert = []
    alerts_to_insert = []

    for i, item in enumerate(NORTHEAST_SLOPE_LOCATIONS):
        pred = landslide_ml_engine.predict_landslide(
            rainfall_1h=item["rainfall_1h"],
            rainfall_6h=item["rainfall_6h"],
            rainfall_24h=item["rainfall_24h"],
            rainfall_48h=item["rainfall_48h"],
            rainfall_72h=item["rainfall_72h"],
            slope_degrees=item["slope_degrees"],
            elevation_m=item["elevation_m"],
            soil_moisture_pct=item["soil_moisture_pct"],
            pore_water_pressure_kpa=item["pore_water_pressure_kpa"],
            distance_to_road_m=item["distance_to_road_m"],
            distance_to_river_m=item["distance_to_river_m"],
            historical_landslides_count=item["historical_landslides_count"],
            vegetation_ndvi=item["vegetation_ndvi"]
        )

        loc_doc = dict(item)
        loc_doc["id"] = f"LOC-NER-{i+1:03d}"
        loc_doc["risk_score"] = pred["risk_score"]
        loc_doc["risk_level"] = pred["risk_level"]
        loc_doc["model_confidence"] = pred["model_confidence"]
        loc_doc["is_rainfall_triggered"] = pred["is_rainfall_triggered"]
        loc_doc["active_triggers"] = pred["active_triggers"]
        loc_doc["xai_feature_attributions"] = pred["xai_feature_attributions"]
        loc_doc["last_updated"] = datetime.utcnow().isoformat()
        locations_to_insert.append(loc_doc)

        # Generate alert for HIGH and CRITICAL nodes
        if pred["risk_score"] >= 61:
            status = "CRITICAL" if pred["risk_score"] >= 81 else "WARNING"
            is_public = pred["risk_score"] >= 75
            
            alerts_to_insert.append({
                "id": f"ALT-NER-{len(alerts_to_insert)+1:03d}",
                "title": f"Landslide {status}: {item['village']} Slope Instability",
                "state": item["state"],
                "district": item["district"],
                "village": item["village"],
                "risk_score": pred["risk_score"],
                "risk_level": pred["risk_level"],
                "status": status,
                "is_rainfall_triggered": pred["is_rainfall_triggered"],
                "rainfall_24h_mm": item["rainfall_24h"],
                "slope_degrees": item["slope_degrees"],
                "population_exposed": item["population"],
                "contributing_factors": pred["active_triggers"],
                "public_warning_issued": is_public,
                "public_warning_headline": f"🚨 URGENT LANDSLIDE ADVISORY: {item['village']}, {item['district']}",
                "public_warning_message": f"Continuous heavy rainfall ({item['rainfall_24h']:.1f} mm/24h) and unstable slope angle ({item['slope_degrees']:.1f}°) detected. Authorities advise avoiding road travel along {item.get('associated_highway', 'local hill roads')}.",
                "evacuation_recommended": pred["risk_score"] >= 85,
                "road_closure_ordered": pred["risk_score"] >= 80,
                "verified_by": "Dr. Subhashish Deb (District Disaster Officer)" if is_public else None,
                "created_at": (datetime.utcnow() - timedelta(hours=i*2)).isoformat()
            })

    await locs_col.insert_many(locations_to_insert)
    print(f"Inserted {len(locations_to_insert)} monitored landslide slope locations.")

    if alerts_to_insert:
        await alerts_col.insert_many(alerts_to_insert)
        print(f"Inserted {len(alerts_to_insert)} early warning alerts.")

    # 4. Insert Infrastructure & Evacuation Centers
    for i, inf in enumerate(DEMO_INFRASTRUCTURE):
        inf["id"] = f"INF-NER-{i+1:03d}"
    await infra_col.insert_many(DEMO_INFRASTRUCTURE)
    print(f"Inserted {len(DEMO_INFRASTRUCTURE)} critical infrastructure nodes.")

    for i, sh in enumerate(DEMO_EVACUATION_CENTERS):
        sh["id"] = f"SHELTER-NER-{i+1:03d}"
    await shelters_col.insert_many(DEMO_EVACUATION_CENTERS)
    print(f"Inserted {len(DEMO_EVACUATION_CENTERS)} evacuation centers.")

    # 5. Insert Sample Field Reports
    sample_reports = [
        {
            "id": "RPT-NER-001",
            "state": "Assam",
            "district": "Dima Hasao",
            "village": "Haflong Hill Cut",
            "latitude": 25.1697,
            "longitude": 93.0182,
            "observation_date": datetime.utcnow().strftime("%Y-%m-%d"),
            "visible_cracks": True,
            "soil_mud_movement": True,
            "rockfall_observed": True,
            "water_seepage_present": True,
            "road_blocked": True,
            "house_damage": True,
            "infrastructure_damage": True,
            "estimated_severity": "SEVERE",
            "approx_people_affected": 320,
            "casualties_count": 0,
            "missing_persons_count": 0,
            "rainfall_intensity_observed": "TORRENTIAL",
            "photograph_url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop",
            "field_notes": "Continuous tension cracks of 15cm width noticed along NH-27 cut-slope. Mud slurry flowing towards residential cluster.",
            "reporter_name": "Arun Bordoloi (Ground Surveyor)",
            "reporter_role": "FIELD_WORKER",
            "status": "VERIFIED",
            "verified_by": "Dr. Subhashish Deb (District Disaster Officer)",
            "verified_at": datetime.utcnow().isoformat(),
            "created_at": (datetime.utcnow() - timedelta(hours=3)).isoformat()
        },
        {
            "id": "RPT-NER-002",
            "state": "Meghalaya",
            "district": "East Jaintia Hills",
            "village": "Sonapur Tunnel Approach",
            "latitude": 25.1092,
            "longitude": 92.3685,
            "observation_date": datetime.utcnow().strftime("%Y-%m-%d"),
            "visible_cracks": True,
            "soil_mud_movement": True,
            "rockfall_observed": True,
            "water_seepage_present": True,
            "road_blocked": True,
            "house_damage": False,
            "infrastructure_damage": True,
            "estimated_severity": "CATASTROPHIC",
            "approx_people_affected": 850,
            "casualties_count": 0,
            "missing_persons_count": 0,
            "rainfall_intensity_observed": "TORRENTIAL",
            "photograph_url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop",
            "field_notes": "Debris avalanche blocked both portals of Sonapur tunnel on NH-6. 4 JCBs deployed by NHAI for emergency clearing.",
            "reporter_name": "K. Lyngdoh (Field Surveyor)",
            "reporter_role": "FIELD_WORKER",
            "status": "PENDING_VERIFICATION",
            "verified_by": None,
            "verified_at": None,
            "created_at": (datetime.utcnow() - timedelta(hours=1)).isoformat()
        }
    ]
    await reports_col.insert_many(sample_reports)
    print(f"Inserted {len(sample_reports)} field reports.")

    # 6. Insert Historical Events
    historical_events = [
        {"year": 2022, "state": "Assam", "district": "Dima Hasao", "location": "New Haflong Station", "fatalities": 4, "trigger": "Monsoon 48h rain > 340mm", "damage": "Railway tracks buried under 10m mudflow"},
        {"year": 2022, "state": "Manipur", "district": "Noney", "location": "Tupul Railway Yard", "fatalities": 58, "trigger": "Heavy continuous precipitation & slope cutting", "damage": "Ijei river dammed and railway camp destroyed"},
        {"year": 2023, "state": "Sikkim", "district": "North Sikkim", "location": "Chungthang Dam Corridor", "fatalities": 14, "trigger": "GLOF + extreme cloudburst", "damage": "NH-10 bridges collapsed, military vehicles submerged"},
        {"year": 2024, "state": "Mizoram", "district": "Aizawl", "location": "Melthum Stone Quarry", "fatalities": 27, "trigger": "Cyclone Remal heavy downpour", "damage": "Quarry slope failure burying workers"}
    ]
    await history_col.insert_many(historical_events)

    # 7. Insert Audit Logs
    audit_logs = [
        {"user": "System Admin", "role": "ADMIN", "action": "Initialized NER Landslide AI system & trained Random Forest model v2.4", "timestamp": (datetime.utcnow() - timedelta(hours=12)).isoformat(), "target": "system"},
        {"user": "Dr. Subhashish Deb", "role": "DISTRICT_OFFICER", "action": "Verified Field Report RPT-NER-001 for Haflong Hill Cut", "timestamp": (datetime.utcnow() - timedelta(hours=2)).isoformat(), "target": "field_report:RPT-NER-001"},
        {"user": "Smt. K. Sangma", "role": "AUTHORITY", "action": "Issued Regional Public Landslide Warning for Sonapur NH-6 Corridor", "timestamp": (datetime.utcnow() - timedelta(minutes=45)).isoformat(), "target": "alert:ALT-NER-002"}
    ]
    await audit_col.insert_many(audit_logs)
    print("Seeding completed successfully!")
    close_db()

if __name__ == "__main__":
    asyncio.run(seed_database())
