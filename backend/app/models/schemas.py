from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class UserRole:
    ASHA = "ASHA"
    ANM = "ANM"
    MEDICAL_STAFF = "MEDICAL_STAFF"
    AUTHORITY = "AUTHORITY"
    ADMIN = "ADMIN"
    PUBLIC = "PUBLIC"

# Auth Models
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str = UserRole.ASHA # ASHA, ANM, MEDICAL_STAFF, AUTHORITY, ADMIN, PUBLIC
    state: str = "Assam"
    district: str = "Kamrup"
    village: Optional[str] = "Chaygaon"
    phone: Optional[str] = None
    facility_name: Optional[str] = "Chaygaon PHC"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    state: str
    district: str
    village: Optional[str] = None
    phone: Optional[str] = None
    facility_name: Optional[str] = None
    created_at: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Case Report Models
class CaseReportCreate(BaseModel):
    state: str
    district: str
    village: str
    date: str
    symptoms: List[str]
    approx_cases: int = Field(gt=0)
    age_group: str # 0-5, 6-18, 19-50, 50+
    water_source: str # Handpump, Tube Well, River/Stream, Open Pond, Piped Supply
    sanitation_status: str # Open Defecation Free, Pit Latrine, Poor Sanitation
    water_environment_notes: Optional[str] = None
    reporter_name: Optional[str] = None
    reporter_role: Optional[str] = "ASHA"
    latitude: Optional[float] = None
    longitude: Optional[float] = None

# Water Observation Models
class WaterObservationCreate(BaseModel):
    state: str
    district: str
    village: str
    water_source: str
    turbidity_ntu: float = 5.0 # NTU (normal < 5)
    ph_level: float = 7.0 # Normal 6.5 - 8.5
    coliform_presence: bool = False # Presumptive test / H2S vial test
    residual_chlorine_ppm: float = 0.2
    odor_taste: str = "Normal" # Normal, Foul, Metallic
    is_flood_affected: bool = False
    observation_date: str
    notes: Optional[str] = None

# Environmental Data Models
class EnvironmentalDataCreate(BaseModel):
    state: str
    district: str
    village: str
    date: str
    rainfall_mm: float = 0.0
    flood_status: str = "Normal" # Normal, Waterlogging, Severe Flood
    temperature_c: float = 28.0
    humidity_percent: float = 80.0

# AI Prediction Request
class RiskPredictRequest(BaseModel):
    state: str
    district: str
    village: str
    cases_current_period: int
    cases_previous_period: int
    symptoms: List[str]
    rainfall_mm: float
    flood_status: str # Normal, Waterlogging, Severe Flood
    water_quality: str # Clean, Moderately Contaminated, Highly Contaminated
    turbidity_ntu: float
    sanitation_status: str # Good, Moderate, Poor
    population: int = 1500

class RiskPredictResponse(BaseModel):
    risk_score: int # 0 - 100
    risk_level: str # LOW, MEDIUM, HIGH, VERY HIGH
    contributing_factors: List[str]
    case_growth_rate: float
    recommended_action: str
    disclaimer: str = "AI provides outbreak-risk signals for authorized investigation. It does not provide medical diagnosis or medicine prescriptions."

# Alert & Investigation Models
class AlertStatus:
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    INVESTIGATION = "INVESTIGATION"
    CONFIRMED = "CONFIRMED"
    REJECTED = "REJECTED"
    PUBLIC_WARNING = "PUBLIC_WARNING"
    CLOSED = "CLOSED"

class AlertInvestigateRequest(BaseModel):
    alert_id: str
    investigator_name: str
    investigator_notes: str
    field_findings: str
    recommended_next_step: str # "CONFIRM", "REJECT", "CONTINUE_INVESTIGATION"

class AlertConfirmRequest(BaseModel):
    alert_id: str
    authority_name: str
    official_action: str
    public_warning_text: Optional[str] = None
    quarantine_or_chlorination_team_dispatched: bool = True

class AlertRejectRequest(BaseModel):
    alert_id: str
    authority_name: str
    rejection_reason: str

# Disease Safety Guide Model
class HealthGuideline(BaseModel):
    id: Optional[str] = None
    disease: str
    do: List[str]
    dont: List[str]
    warning_signs: List[str]
    prevention: List[str]
    safe_water_tips: Optional[List[str]] = None
    approved_by: str = "State Public Health Directorate (NER)"
    updated_at: str = "2026-08-16"
    is_active: bool = True
