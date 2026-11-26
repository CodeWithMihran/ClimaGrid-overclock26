export type PriorityTier = 'P1 - CRITICAL' | 'P2 - HIGH' | 'P3 - MEDIUM' | 'P4 - LOW';

export interface TriageScoreBreakdown {
  hazard_score: number;
  medical_urgency_score: number;
  vulnerability_score: number;
  time_delay_score: number;
  final_score: number;
  priority_tier: PriorityTier;
  explanation: string;
}

export interface IncidentRecord {
  id: string;
  timestamp: string;
  raw_message: string;
  clean_summary: string;
  landmark: string;
  latitude: number;
  longitude: number;
  trapped_count: number;
  vulnerabilities: string[];
  water_level_feet: number;
  triage: TriageScoreBreakdown;
  status: 'PENDING_APPROVAL' | 'DISPATCHED' | 'EN_ROUTE' | 'RESCUED';
  assigned_unit?: string;
  ai_confidence: number;
}

export interface WaterSensorNode {
  id: string;
  name: string;
  landmark: string;
  latitude: number;
  longitude: number;
  turbidity_ntu: number;
  ph_level: number;
  tds_ppm: number;
  dissolved_oxygen_mg_l: number;
  is_anomalous: boolean;
  status: 'SAFE' | 'WARNING' | 'CRITICAL_CONTAMINATION';
  alert_message?: string;
  updated_at: string;
}

export interface RouteSegment {
  coordinates: [number, number][];
  distance_km: number;
  duration_minutes: number;
  avoided_hazards: string[];
  is_safe: boolean;
}

export interface FleetAsset {
  id: string;
  callsign: string;
  type: string;
  latitude: number;
  longitude: number;
  status: string;
  battery_or_fuel_pct: number;
  assigned_incident_id?: string;
  survivors_onboard: number;
}

export interface SampleMessage {
  title: string;
  message: string;
  source: string;
  expected_tier: string;
}

export interface ImageAnalysisResponse {
  estimated_depth_feet: number;
  estimated_depth_meters: number;
  waterline_level: string;
  detected_objects: string[];
  structural_hazard_level: string;
  hazard_score: number;
  confidence_score: number;
  summary: string;
  suggested_distress_message: string;
}

export interface ImagePreset {
  id: string;
  title: string;
  waterline: string;
  thumbnail_label: string;
  depth_feet: number;
  badge: string;
}

export interface GaugeStation {
  id: string;
  name: string;
  location: [number, number];
  water_level_m: number;
  warning_level_m: number;
  danger_level_m: number;
  discharge_cusecs: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  trend: string;
}

export interface TelemetryData {
  timestamp: string;
  basin: string;
  gauges: GaugeStation[];
  water_quality: {
    station_id: string;
    station_name: string;
    turbidity_ntu: number;
    safe_limit_ntu: number;
    is_anomalous: boolean;
    boil_water_advisory: boolean;
  };
  meteorological: {
    station_name: string;
    temperature_c: number;
    heat_index_c: number;
    rainfall_accum_mm: number;
    wind_speed_kmh: number;
  };
  system_health: {
    bedrock_nlp_latency_ms: number;
    active_fleet_readiness: string;
    lora_gateway_status: string;
  };
}

export interface ImpassableInfra {
  name: string;
  status: string;
  depth_feet: number;
}

export interface PredictiveFloodStep {
  step_id: string;
  time_offset_hours: number;
  label: string;
  status_badge: string;
  solani_stage_meters: number;
  discharge_cusecs: number;
  flooded_area_hectares: number;
  citizens_in_hazard_zone: number;
  impassable_infrastructure: ImpassableInfra[];
  at_risk_next: string;
  recommended_action: string;
  geojson: any;
}

export interface PredictiveTimelineResponse {
  model_version: string;
  meteorological_baseline: {
    rain_rate_mm_hr: number;
    upstream_source: string;
    upstream_discharge_cusecs: number;
    danger_threshold_stage_m: number;
  };
  steps: PredictiveFloodStep[];
}

export interface ReliefShelter {
  id: string;
  name: string;
  landmark: string;
  latitude: number;
  longitude: number;
  total_capacity_beds: number;
  occupied_beds: number;
  available_beds: number;
  medical_capabilities: string[];
  has_pediatric: boolean;
  has_maternity: boolean;
  potable_water_liters: number;
  dry_ration_kits: number;
  power_backup: string;
  status: 'OPERATIONAL_ACCEPTING' | 'HIGH_OCCUPANCY' | 'CRITICAL_CAPACITY';
  contact_officer: string;
  contact_phone: string;
}

export interface ShelterAllocationResponse {
  status: string;
  incident_id: string;
  recommended_shelter: ReliefShelter;
  distance_km: number;
  allocated_beds: number;
  rationale: string;
  remaining_shelter_capacity: number;
}

export interface CAPAlert {
  identifier: string;
  sender: string;
  sent: string;
  status: string;
  msgType: string;
  scope: string;
  category: string;
  event: string;
  urgency: string;
  severity: string;
  certainty: string;
  headline_en: string;
  headline_hi: string;
  description_en: string;
  description_hi: string;
  instruction: string;
  area_description: string;
  polygon_coordinates: string;
  cap_xml: string;
  cell_towers_targeted: number;
  estimated_recipients: number;
}

export interface CAPTemplate {
  id: string;
  title: string;
  severity: string;
  event: string;
  headline_en: string;
  headline_hi: string;
  description_en: string;
  description_hi: string;
  area_description: string;
}

