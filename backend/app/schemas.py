from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime


# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str = "PUBLIC"  # FIELD_WORKER, BLOCK_OFFICER, DISTRICT_OFFICER, AUTHORITY, ADMIN, PUBLIC
    state: str = "Assam"
    district: str = "Dima Hasao"
    village: Optional[str] = "Haflong"
    phone: Optional[str] = None
    designation: Optional[str] = None

# --- Field Landslide Report Schemas (<60s form) ---
class FieldReportCreate(BaseModel):
    latitude: float
    longitude: float
    state: str
    district: str
    village: str
    observation_date: str = Field(default_factory=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    visible_cracks: bool = False
    soil_mud_movement: bool = False
    rockfall_observed: bool = False
    water_seepage_present: bool = False
    road_blocked: bool = False
    house_damage: bool = False
    infrastructure_damage: bool = False
    estimated_severity: str = "MODERATE"  # MINOR, MODERATE, SEVERE, CATASTROPHIC
    approx_people_affected: int = 0
    casualties_count: int = 0
    missing_persons_count: int = 0
    rainfall_intensity_observed: str = "MODERATE"  # NONE, LIGHT, MODERATE, HEAVY, TORRENTIAL
    photograph_url: Optional[str] = None
    field_notes: Optional[str] = None
    reporter_name: Optional[str] = None
    reporter_role: Optional[str] = "FIELD_WORKER"

class FieldReportResponse(FieldReportCreate):
    id: str
    status: str = "PENDING_VERIFICATION"  # PENDING_VERIFICATION, VERIFIED, FALSE_ALARM, RESOLVED
    verified_by: Optional[str] = None
    verified_at: Optional[str] = None
    created_at: str

# --- Prediction Schemas ---
class LandslidePredictRequest(BaseModel):
    Rainfall_mm: Union[float, List[float], int] = Field(default=180.0, description="Rainfall in mm")
    Slope_Angle: Union[float, List[float], int] = Field(default=30.0, description="Slope inclination angle in degrees")
    Soil_Saturation: Union[float, List[float], int] = Field(default=0.90, description="Soil saturation (0.0-1.0 or 0-100%)")
    Vegetation_Cover: Union[float, List[float], int] = Field(default=0.15, description="Vegetation cover index (0.0 to 1.0)")
    Earthquake_Activity: Union[float, List[float], int] = Field(default=4.5, description="Seismic earthquake activity level")
    Proximity_to_Water: Union[float, List[float], int] = Field(default=1.0, description="Proximity to nearest water source in meters")
    Soil_Type_Gravel: Union[int, List[int], float] = Field(default=0, description="Soil type gravel (0 or 1)")
    Soil_Type_Sand: Union[int, List[int], float] = Field(default=0, description="Soil type sand (0 or 1)")
    Soil_Type_Silt: Union[int, List[int], float] = Field(default=1, description="Soil type silt (0 or 1)")
    Soil_Type: Optional[str] = Field(default="Silt", description="Soil type text name")


class LandslidePredictResponse(BaseModel):
    risk_score: int
    risk_level: str
    risk_level_code: Optional[str] = "MODERATE"
    model_confidence: float
    is_rainfall_triggered: bool
    active_triggers: List[str]
    xai_feature_attributions: List[Dict[str, Any]]
    model_version: str
    input_parameters: Optional[Dict[str, Any]] = None
    disclaimer: str


# --- Alert & Warning Schemas ---
class AlertVerifyRequest(BaseModel):
    alert_id: str
    officer_name: str
    official_action: str
    public_warning_headline: Optional[str] = None
    public_warning_message: Optional[str] = None
    evacuation_recommended: bool = False
    road_closure_ordered: bool = False

class AlertResponse(BaseModel):
    id: str
    title: str
    state: str
    district: str
    village: str
    risk_score: int
    risk_level: str
    status: str  # NORMAL, WATCH, WARNING, CRITICAL, VERIFIED_LANDSLIDE, RESOLVED
    is_rainfall_triggered: bool
    rainfall_24h_mm: float
    slope_degrees: float
    population_exposed: int
    contributing_factors: List[str]
    public_warning_issued: bool = False
    public_warning_headline: Optional[str] = None
    public_warning_message: Optional[str] = None
    evacuation_recommended: bool = False
    road_closure_ordered: bool = False
    verified_by: Optional[str] = None
    created_at: str

# --- Offline Batch Sync Schemas ---
class SyncItem(BaseModel):
    client_id: str
    type: str  # "field_report"
    data: Dict[str, Any]
    timestamp: str

class SyncBatchRequest(BaseModel):
    items: List[SyncItem]

class SyncBatchResponse(BaseModel):
    synced_count: int
    duplicate_count: int
    errors: List[str]
    server_time: str
