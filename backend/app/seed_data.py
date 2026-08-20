import asyncio
from datetime import datetime, timedelta
from app.database import get_collection
from app.auth import get_password_hash
from app.ml.synthetic_data import NE_LOCATIONS
from app.ml.model import ml_engine

INITIAL_USERS = [
    {
        "name": "Priyanka Kalita (ASHA)",
        "email": "asha@swasthyajal.gov.in",
        "password": get_password_hash("password123"),
        "role": "ASHA",
        "state": "Assam",
        "district": "Majuli",
        "village": "Garamur",
        "phone": "+91 98640 12345",
        "facility_name": "Garamur Sub-Centre"
    },
    {
        "name": "Rini Riba (ANM)",
        "email": "anm@swasthyajal.gov.in",
        "password": get_password_hash("password123"),
        "role": "ANM",
        "state": "Assam",
        "district": "Majuli",
        "village": "Kamalabari",
        "phone": "+91 94350 23456",
        "facility_name": "Kamalabari Sector Health Unit"
    },
    {
        "name": "Dr. Bhaskar Sarma (MO PHC)",
        "email": "doctor@swasthyajal.gov.in",
        "password": get_password_hash("password123"),
        "role": "MEDICAL_STAFF",
        "state": "Assam",
        "district": "Majuli",
        "village": "Garamur",
        "phone": "+91 97060 34567",
        "facility_name": "Garamur Primary Health Centre (PHC)"
    },
    {
        "name": "Dr. A. K. Baruah (District Surveillance Officer)",
        "email": "authority@swasthyajal.gov.in",
        "password": get_password_hash("password123"),
        "role": "AUTHORITY",
        "state": "Assam",
        "district": "Majuli",
        "village": "District HQ",
        "phone": "+91 94351 45678",
        "facility_name": "IDSP District Surveillance Unit & Health Directorate"
    },
    {
        "name": "System Administrator",
        "email": "admin@swasthyajal.gov.in",
        "password": get_password_hash("password123"),
        "role": "ADMIN",
        "state": "Assam",
        "district": "Guwahati HQ",
        "village": "Dispur",
        "phone": "+91 98642 99999",
        "facility_name": "State Public Health Data Centre"
    },
    {
        "name": "Citizen / Public User",
        "email": "public@swasthyajal.gov.in",
        "password": get_password_hash("password123"),
        "role": "PUBLIC",
        "state": "Assam",
        "district": "Majuli",
        "village": "Garamur",
        "phone": "+91 91234 56789",
        "facility_name": "Citizen Portal"
    }
]

INITIAL_GUIDELINES = [
    {
        "disease": "Diarrhea",
        "do": [
            "Drink safe, boiled or chlorinated water exclusively.",
            "Wash hands thoroughly with soap before eating and after using the toilet.",
            "Keep drinking water in clean, narrow-mouthed and covered vessels.",
            "Use safe water to wash raw vegetables, fruits, and cooking utensils.",
            "Prepare fresh Oral Rehydration Solution (ORS) with clean water at home.",
            "Report cluster of loose stools in your neighborhood to your local ASHA worker promptly."
        ],
        "dont": [
            "Do not consume water directly from swollen rivers, stagnant open ponds, or damaged handpumps.",
            "Do not stop fluid intake during loose stools.",
            "Do not consume unwashed raw foods or exposed street food.",
            "Do not take antibiotics or anti-motility drugs without medical supervision.",
            "Do not self-treat using AI risk scores as a diagnostic prescription."
        ],
        "warning_signs": [
            "Passing more than 5 watery stools within a 6-hour period",
            "Sunken eyes, extreme thirst, dry tongue, or inability to drink",
            "High fever, persistent vomiting, or presence of blood in stool",
            "Reduced or dark urination (lethargy in infants and elderly)"
        ],
        "prevention": [
            "Chlorination of community tube wells and household water boiling (rolling boil for 1 minute)",
            "Strict avoidance of open defecation near water collection points",
            "Safe storage of prepared food in covered, pest-proof containers"
        ],
        "safe_water_tips": [
            "Boil water vigorously for at least 1 minute before cooling.",
            "Add 1 chlorine tablet (0.5g) per 20 litres of clear water and wait 30 minutes before drinking.",
            "Filter turbid floodwater through a clean multi-layer cloth before boiling or chlorinating."
        ],
        "approved_by": "State Public Health Directorate (NER) & IDSP",
        "updated_at": "2026-08-16",
        "is_active": True
    },
    {
        "disease": "Cholera",
        "do": [
            "Immediately start giving Oral Rehydration Solution (ORS) and coconut water if available.",
            "Boil all drinking and cooking water rigorously.",
            "Disinfect water storage containers and toilet areas using bleaching powder / chlorine.",
            "Notify the Primary Health Centre (PHC) immediately upon suspecting rice-water stools.",
            "Transport patient to the nearest PHC / CHC while maintaining continuous fluid replacement."
        ],
        "dont": [
            "Do not delay seeking medical emergency care — severe cholera can cause rapid dehydration.",
            "Do not drink unchlorinated municipal or surface stream water in flood-affected zones.",
            "Do not wash clothes or defecate near natural springs (jharnas) or river ghats.",
            "Do not purchase cut fruits or ice cubes prepared from unverified water sources."
        ],
        "warning_signs": [
            "Sudden painless profuse watery diarrhea resembling 'rice-water'",
            "Rapid continuous vomiting without preceding nausea",
            "Rapid heart rate, loss of skin elasticity (skin pinch goes back very slowly)",
            "Extremely low blood pressure, cold extremities, and severe muscle cramps"
        ],
        "prevention": [
            "Emergency super-chlorination of community handpumps and ring wells (>2 ppm free chlorine)",
            "Consumption of strictly piping-hot freshly cooked meals",
            "Oral Cholera Vaccine (OCV) when authorized by Public Health Directorate in endemic hot-spots"
        ],
        "safe_water_tips": [
            "Never use untreated river/stream water even for brushing teeth or rinsing dishes.",
            "Use certified chlorine tablets or liquid sodium hypochlorite as distributed by ASHA workers."
        ],
        "approved_by": "State Public Health Directorate (NER) & IDSP",
        "updated_at": "2026-08-16",
        "is_active": True
    },
    {
        "disease": "Typhoid (Enteric Fever)",
        "do": [
            "Consume only freshly cooked, hot food and boiled drinking water.",
            "Peel all fruits yourself after washing with safe water.",
            "Complete the entire antibiotic course strictly as prescribed by a licensed PHC medical officer.",
            "Maintain meticulous personal hygiene when preparing meals for others."
        ],
        "dont": [
            "Do not consume raw vegetables (salads) or unpasteurized dairy during rainy season.",
            "Do not stop prescribed fever medication prematurely when symptoms improve.",
            "Do not handle food preparation for public/family while experiencing typhoid fever."
        ],
        "warning_signs": [
            "Prolonged high step-ladder fever lasting more than 4-5 days",
            "Severe headache, general body weakness, coated tongue, and abdominal pain",
            "Loss of appetite, constipation or 'pea-soup' diarrhea",
            "Delirium or confusion in severe untreated cases"
        ],
        "prevention": [
            "Typhoid conjugate vaccination for children and vulnerable populations",
            "Routine sanitary surveillance of community water distribution pipelines against sewage seepage",
            "Rigorous handwashing with soap before handling cooked foods"
        ],
        "safe_water_tips": [
            "Maintain piped water pressure to prevent cross-contamination from adjacent drainage channels."
        ],
        "approved_by": "State Public Health Directorate (NER) & IDSP",
        "updated_at": "2026-08-16",
        "is_active": True
    },
    {
        "disease": "Hepatitis A (Viral Jaundice)",
        "do": [
            "Drink only treated/boiled water, as Hepatitis A virus survives in raw cold water.",
            "Isolate patient utensils and wash them thoroughly with hot water and detergent.",
            "Ensure adequate rest and a nutritious, light, carbohydrate-rich diet as advised by a doctor.",
            "Get household contacts evaluated by the PHC medical officer."
        ],
        "dont": [
            "Do not take unverified herbal remedies that may exacerbate liver stress.",
            "Do not consume oily, heavy or fried foods during acute liver inflammation.",
            "Do not use open water ponds for bathing or washing kitchen utensils."
        ],
        "warning_signs": [
            "Yellow discoloration of sclera (eyes), skin, and deep dark yellow urine",
            "Profound fatigue, nausea, vomiting, and loss of appetite",
            "Right upper quadrant abdominal pain and mild fever"
        ],
        "prevention": [
            "Hepatitis A vaccination where recommended by health authorities",
            "Protecting open springs and community water sources from human fecal contamination"
        ],
        "safe_water_tips": [
            "Boil water to at least 85°C (185°F) for 1 minute to inactivate Hepatitis A virus."
        ],
        "approved_by": "State Public Health Directorate (NER) & IDSP",
        "updated_at": "2026-08-16",
        "is_active": True
    },
    {
        "disease": "Dysentery (Bacillary / Amoebic)",
        "do": [
            "Stay well hydrated with clean ORS, salted rice water, and plain boiled water.",
            "Visit the PHC for stool testing to determine bacillary vs amoebic origin.",
            "Disinfect household latrines and ensure safe disposal of soiled clothes."
        ],
        "dont": [
            "Do not take OTC anti-diarrheal pills (e.g. Loperamide) as they can trap toxins in the gut.",
            "Do not ignore blood in stools, especially in infants or elderly family members."
        ],
        "warning_signs": [
            "Frequent painful bowel movements containing visible blood and mucus",
            "Intense abdominal cramping and tenesmus (constant feeling of needing to pass stool)",
            "High fever, chills, and progressive dehydration"
        ],
        "prevention": [
            "Improvement of village sanitation and safe handling of animal manure",
            "Protection of drinking water shallow wells from agricultural and surface runoff"
        ],
        "safe_water_tips": [
            "Avoid drinking water from shallow unprotected ring wells without prior disinfection."
        ],
        "approved_by": "State Public Health Directorate (NER) & IDSP",
        "updated_at": "2026-08-16",
        "is_active": True
    },
    {
        "disease": "Acute Gastroenteritis",
        "do": [
            "Replenish lost fluids and electrolytes with oral rehydration solution (ORS).",
            "Eat small, bland meals (khichdi, bananas, boiled potatoes) once nausea subsides.",
            "Report sudden multi-person gastroenteritis after community feasts to the ASHA worker."
        ],
        "dont": [
            "Do not consume carbonated sodas, sugary drinks, or caffeinated beverages during illness.",
            "Do not reuse uncleaned baby bottles or feeding spoons."
        ],
        "warning_signs": [
            "Inability to retain liquids for over 12 hours due to frequent vomiting",
            "Lightheadedness, dizziness upon standing, or confusion",
            "High fever exceeding 38.5°C (101.3°F)"
        ],
        "prevention": [
            "Safe food storage, fly control around kitchens, and boiling drinking water."
        ],
        "safe_water_tips": [
            "Use only safe, clean water for mixing baby formula and food."
        ],
        "approved_by": "State Public Health Directorate (NER) & IDSP",
        "updated_at": "2026-08-16",
        "is_active": True
    },
    {
        "disease": "Other Water-Borne Diseases",
        "do": [
            "Adhere strictly to standard water safety: Filter -> Boil -> Store in Clean Covered Vessel.",
            "Use chlorine disinfection during flood and heavy rainfall emergencies.",
            "Consult the nearest Primary Health Centre or Community Health Centre for unexplained fever, rashes, or diarrhea."
        ],
        "dont": [
            "Do not drink water with unusual smell, color, or turbidity.",
            "Do not panic or share rumors; follow verified health advisories from local health authorities."
        ],
        "warning_signs": [
            "Any severe or worsening systemic symptoms following exposure to contaminated water or floodwaters."
        ],
        "prevention": [
            "Community-level source water surveillance and household water treatment (HWT)."
        ],
        "safe_water_tips": [
            "Keep drinking water stored off the floor, away from animals, and dispense using a clean ladle."
        ],
        "approved_by": "State Public Health Directorate (NER) & IDSP",
        "updated_at": "2026-08-16",
        "is_active": True
    }
]

async def seed_database():
    users_col = get_collection("users")
    guidelines_col = get_collection("health_guidelines")
    locations_col = get_collection("locations")
    cases_col = get_collection("case_reports")
    water_col = get_collection("water_observations")
    alerts_col = get_collection("alerts")
    warnings_col = get_collection("public_warnings")
    
    # 1. Seed Users if not present
    existing_users = await users_col.find()
    if not existing_users:
        print("Seeding initial role users...")
        for user in INITIAL_USERS:
            await users_col.insert_one(user)
            
    # 2. Seed Guidelines
    existing_guidelines = await guidelines_col.find()
    if not existing_guidelines:
        print("Seeding Disease Safety Guidelines...")
        for g in INITIAL_GUIDELINES:
            await guidelines_col.insert_one(g)
            
    # 3. Seed Locations & Risk Data
    existing_locs = await locations_col.find()
    if not existing_locs:
        print("Seeding Northeast India location nodes...")
        for loc in NE_LOCATIONS:
            # Generate realistic initial risk state
            is_majuli_hotspot = loc["village"] in ["Garamur", "Kamalabari"]
            cases = 24 if is_majuli_hotspot else (11 if loc["village"] == "Bilasipara" else 3)
            prev_cases = 4 if is_majuli_hotspot else 2
            rainfall = 92.4 if is_majuli_hotspot else 25.0
            flood = "Severe Flood" if is_majuli_hotspot else "Normal"
            turbidity = 32.5 if is_majuli_hotspot else 4.2
            water_quality = "Highly Contaminated" if is_majuli_hotspot else "Clean"
            sanitation = "Poor Sanitation" if is_majuli_hotspot else "Open Defecation Free"
            
            # Predict risk using ML model
            pred = ml_engine.predict_risk(
                cases_current=cases,
                cases_previous=prev_cases,
                rainfall_mm=rainfall,
                flood_status=flood,
                water_quality=water_quality,
                turbidity_ntu=turbidity,
                sanitation_status=sanitation,
                population=loc["pop"],
                symptoms=["Acute Watery Diarrhea", "Severe Vomiting", "Dehydration & Lethargy"] if is_majuli_hotspot else ["Nausea"]
            )
            
            loc_doc = {
                "state": loc["state"],
                "district": loc["district"],
                "village": loc["village"],
                "latitude": loc["lat"],
                "longitude": loc["lng"],
                "population": loc["pop"],
                "water_source": loc["water_src"],
                "active_cases": cases,
                "previous_7day_cases": prev_cases,
                "case_growth": round((cases - prev_cases) / max(prev_cases, 1), 2),
                "rainfall_mm": rainfall,
                "flood_status": flood,
                "turbidity_ntu": turbidity,
                "water_quality": water_quality,
                "sanitation_status": sanitation,
                "risk_score": pred["risk_score"],
                "risk_level": pred["risk_level"],
                "contributing_factors": pred["contributing_factors"],
                "recommended_action": pred["recommended_action"],
                "alert_status": "CONFIRMED" if is_majuli_hotspot else ("HIGH" if loc["village"] == "Bilasipara" else "LOW"),
                "last_updated": datetime.utcnow().isoformat()
            }
            await locations_col.insert_one(loc_doc)
            
    # 4. Seed Initial Case Reports & Water Observations
    existing_cases = await cases_col.find()
    if not existing_cases:
        print("Seeding initial case reports...")
        sample_reports = [
            {
                "state": "Assam",
                "district": "Majuli",
                "village": "Garamur",
                "date": (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d"),
                "symptoms": ["Acute Watery Diarrhea", "Severe Vomiting", "Dehydration & Lethargy"],
                "approx_cases": 14,
                "age_group": "0-5",
                "water_source": "River/Stream",
                "sanitation_status": "Poor Sanitation",
                "water_environment_notes": "Brahmaputra tributary overflow inundated shallow tube well platform. Turbid floodwater.",
                "reporter_name": "Priyanka Kalita",
                "reporter_role": "ASHA",
                "latitude": 26.9634,
                "longitude": 94.2144,
                "created_at": (datetime.utcnow() - timedelta(hours=28)).isoformat()
            },
            {
                "state": "Assam",
                "district": "Majuli",
                "village": "Kamalabari",
                "date": datetime.utcnow().strftime("%Y-%m-%d"),
                "symptoms": ["Acute Watery Diarrhea", "Stomach Cramps", "Dehydration & Lethargy"],
                "approx_cases": 10,
                "age_group": "6-18",
                "water_source": "River/Stream",
                "sanitation_status": "Poor Sanitation",
                "water_environment_notes": "Continuous floodwater inundation near community ghat. High turbidity.",
                "reporter_name": "Rini Riba",
                "reporter_role": "ANM",
                "latitude": 26.9400,
                "longitude": 94.1800,
                "created_at": (datetime.utcnow() - timedelta(hours=14)).isoformat()
            },
            {
                "state": "Assam",
                "district": "Dhubri",
                "village": "Bilasipara",
                "date": datetime.utcnow().strftime("%Y-%m-%d"),
                "symptoms": ["Acute Watery Diarrhea", "High Fever", "Stomach Cramps"],
                "approx_cases": 11,
                "age_group": "19-50",
                "water_source": "River/Stream",
                "sanitation_status": "Pit Latrine",
                "water_environment_notes": "Heavy rainfall caused surface runoff into open pond. H2S vial presumptive positive.",
                "reporter_name": "ASHA Bilasipara",
                "reporter_role": "ASHA",
                "latitude": 26.2300,
                "longitude": 90.2300,
                "created_at": (datetime.utcnow() - timedelta(hours=6)).isoformat()
            }
        ]
        for rep in sample_reports:
            await cases_col.insert_one(rep)

    # 4b. Seed Initial Water Observations
    existing_water = await water_col.find()
    if not existing_water:
        print("Seeding initial water observations...")
        sample_water = [
            {
                "state": "Assam",
                "district": "Majuli",
                "village": "Garamur",
                "water_source": "Handpump",
                "turbidity_ntu": 32.5,
                "ph_level": 6.4,
                "coliform_presence": True,
                "residual_chlorine_ppm": 0.05,
                "odor_taste": "Turbid / Earthy",
                "is_flood_affected": True,
                "observation_date": (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d"),
                "notes": "Flood backflow inundated community handpump plinth. H2S vial test turned black within 14h.",
                "submitted_by": "Priyanka Kalita",
                "submitted_by_role": "ASHA",
                "water_quality_rating": "Highly Contaminated",
                "created_at": (datetime.utcnow() - timedelta(hours=26)).isoformat()
            },
            {
                "state": "Assam",
                "district": "Majuli",
                "village": "Kamalabari",
                "water_source": "River/Stream",
                "turbidity_ntu": 24.0,
                "ph_level": 6.8,
                "coliform_presence": True,
                "residual_chlorine_ppm": 0.1,
                "odor_taste": "Foul",
                "is_flood_affected": True,
                "observation_date": datetime.utcnow().strftime("%Y-%m-%d"),
                "notes": "Direct riverbank extraction point. High silt and organic load.",
                "submitted_by": "Rini Riba",
                "submitted_by_role": "ANM",
                "water_quality_rating": "Highly Contaminated",
                "created_at": (datetime.utcnow() - timedelta(hours=12)).isoformat()
            },
            {
                "state": "Assam",
                "district": "Kamrup",
                "village": "Chaygaon",
                "water_source": "Tube Well",
                "turbidity_ntu": 3.8,
                "ph_level": 7.2,
                "coliform_presence": False,
                "residual_chlorine_ppm": 0.25,
                "odor_taste": "Normal",
                "is_flood_affected": False,
                "observation_date": datetime.utcnow().strftime("%Y-%m-%d"),
                "notes": "Routine sanitary survey. Tube well platform intact, chlorination adequate.",
                "submitted_by": "Dr. Bhaskar Sarma",
                "submitted_by_role": "MEDICAL_STAFF",
                "water_quality_rating": "Clean",
                "created_at": (datetime.utcnow() - timedelta(hours=4)).isoformat()
            }
        ]
        for w in sample_water:
            await water_col.insert_one(w)


    # 5. Seed Alerts & Warnings
    existing_alerts = await alerts_col.find()
    if not existing_alerts:
        print("Seeding initial alerts & confirmed public warnings...")
        sample_alerts = [
            {
                "id": "ALT-MAJULI-001",
                "title": "Severe Outbreak Signal: Acute Watery Diarrhea Cluster in Majuli",
                "state": "Assam",
                "district": "Majuli",
                "village": "Garamur & Kamalabari",
                "severity": "HIGH",
                "status": "CONFIRMED",
                "risk_score": 88,
                "risk_level": "VERY HIGH",
                "total_cases": 24,
                "contributing_factors": [
                    "Rapid 48h case growth (+500%)",
                    "Heavy precipitation (92.4 mm/24h)",
                    "Active inundation / Severe Flood",
                    "High water turbidity (32.5 NTU) & presumptive bacterial contamination"
                ],
                "investigator_name": "Dr. Bhaskar Sarma (MO PHC)",
                "investigation_notes": "Field inspection confirmed severe flood backflow into community drinking wells. High ORS demand.",
                "confirmed_by": "Dr. A. K. Baruah (District Surveillance Officer)",
                "public_warning_issued": True,
                "created_at": (datetime.utcnow() - timedelta(days=1)).isoformat()
            },
            {
                "id": "ALT-DHUBRI-002",
                "title": "Suspected Cluster: Bilasipara Sub-Centre Outbreak Risk",
                "state": "Assam",
                "district": "Dhubri",
                "village": "Bilasipara",
                "severity": "HIGH",
                "status": "INVESTIGATION",
                "risk_score": 72,
                "risk_level": "HIGH",
                "total_cases": 11,
                "contributing_factors": [
                    "Elevated community case load (11 active cases)",
                    "Surface runoff into open pond source",
                    "H2S vial presumptive coliform positive"
                ],
                "investigator_name": "Dr. R. Nath (PHC Bilasipara)",
                "investigation_notes": "Rapid response team deployed for water testing and household chlorine tablet distribution.",
                "confirmed_by": None,
                "public_warning_issued": False,
                "created_at": (datetime.utcnow() - timedelta(hours=5)).isoformat()
            }
        ]
        for alt in sample_alerts:
            await alerts_col.insert_one(alt)
            
        # Seed public warning corresponding to confirmed alert
        sample_warning = {
            "id": "PUB-WARN-2026-001",
            "alert_id": "ALT-MAJULI-001",
            "state": "Assam",
            "district": "Majuli",
            "area_covered": "Garamur, Kamalabari & adjoining riverbank settlements",
            "headline": "OFFICIAL PUBLIC HEALTH WARNING: Confirmed Water-Borne Disease Outbreak Signal",
            "message": "Confirmed water-borne disease outbreak signal verified in this area following monsoon flood inundation. Residents are strictly advised to consume safe/boiled drinking water, avoid identified unsafe river/pond sources, maintain strict hand hygiene with soap, use ORS immediately at symptom onset, and seek medical attention at Garamur PHC if symptoms develop.",
            "emergency_contact": "Majuli District Health Control Room: 104 / +91 3775 274400",
            "approved_by": "District Magistrate & Health Surveillance Officer, Majuli",
            "issue_date": datetime.utcnow().strftime("%Y-%m-%d"),
            "status": "ACTIVE"
        }
        await warnings_col.insert_one(sample_warning)
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_database())
