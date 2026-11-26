from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class DistressMessageInput(BaseModel):
    raw_message: str
    source: str = "WhatsApp"  # WhatsApp, SMS, Emergency 112, Citizen App
    sender_phone: Optional[str] = "+91-98765-XXXXX"
    reported_at: Optional[datetime] = None

class TriageScoreBreakdown(BaseModel):
    hazard_score: float = Field(..., description="0.0 to 1.0 based on water depth / flow speed")
    medical_urgency_score: float = Field(..., description="0.0 to 1.0 based on acute injuries/illness")
    vulnerability_score: float = Field(..., description="0.0 to 1.0 based on infants, elderly, pregnant")
    time_delay_score: float = Field(..., description="0.0 to 1.0 time since call without response")
    final_score: float = Field(..., description="Weighted composite score: 0.0 to 1.0")
    priority_tier: str = Field(..., description="P1 (CRITICAL), P2 (HIGH), P3 (MEDIUM), P4 (LOW)")
    explanation: str

class IncidentRecord(BaseModel):
    id: str
    timestamp: str
    raw_message: str
    clean_summary: str
    landmark: str
    latitude: float
    longitude: float
    trapped_count: int
    vulnerabilities: List[str]
    water_level_feet: float
    triage: TriageScoreBreakdown
    status: str = "PENDING_APPROVAL"  # PENDING_APPROVAL, DISPATCHED, EN_ROUTE, RESCUED
    assigned_unit: Optional[str] = None
    ai_confidence: float = 0.95

class RouteRequest(BaseModel):
    origin: List[float]  # [lat, lng]
    destination: List[float]  # [lat, lng]
    avoid_flood_zones: bool = True

class RouteSegment(BaseModel):
    coordinates: List[List[float]]  # list of [lat, lng]
    distance_km: float
    duration_minutes: float
    avoided_hazards: List[str]
    is_safe: bool = True

class WaterSensorNode(BaseModel):
    id: str
    name: str
    landmark: str
    latitude: float
    longitude: float
    turbidity_ntu: float
    ph_level: float
    tds_ppm: float
    dissolved_oxygen_mg_l: float
    is_anomalous: bool
    status: str  # SAFE, WARNING, CRITICAL_CONTAMINATION
    alert_message: Optional[str] = None
    updated_at: str

class HeatZone(BaseModel):
    id: str
    zone_name: str
    surface_temp_celsius: float
    ndvi_vegetation_index: float
    heat_stress_level: str  # LOW, MODERATE, HIGH, EXTREME
    vulnerable_population_density: int
    cooling_center_needed: bool
    recommended_interventions: List[str]
    geojson_polygon: Dict[str, Any]

class FleetAsset(BaseModel):
    id: str
    callsign: str
    type: str  # Motorboat, QRT Ambulance, Drone
    latitude: float
    longitude: float
    status: str  # READY, ON_MISSION, REFUELLING
    battery_or_fuel_pct: int
    assigned_incident_id: Optional[str] = None
    survivors_onboard: int = 0

class ImageAnalysisRequest(BaseModel):
    sample_id: Optional[str] = None
    image_base64: Optional[str] = None
    landmark_hint: Optional[str] = "Solani Basin, Roorkee"

class ImageAnalysisResponse(BaseModel):
    estimated_depth_feet: float
    estimated_depth_meters: float
    waterline_level: str  # "Ankle/Knee Deep", "Waist/Car Deep", "Chest Deep", "Roof/Submerged Level"
    detected_objects: List[str]
    structural_hazard_level: str  # "LOW", "MODERATE", "CRITICAL_COLLAPSE_RISK"
    hazard_score: float
    confidence_score: float
    summary: str
    suggested_distress_message: str

