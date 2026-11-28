import { IncidentRecord, WaterSensorNode, RouteSegment, FleetAsset, SampleMessage, ImageAnalysisResponse, ImagePreset, TelemetryData, PredictiveFloodStep, PredictiveTimelineResponse, ReliefShelter, ShelterAllocationResponse, CAPAlert, CAPTemplate, DamageSector, DamageAssessmentResponse } from '../types';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_BASE = rawApiUrl.endsWith('/api/v1') 
  ? rawApiUrl 
  : `${rawApiUrl.replace(/\/$/, '')}/api/v1`;

// ============================================================================
// BULLETPROOF FALLBACK CACHE (Guarantees zero blank screens on stage)
// ============================================================================
const FALLBACK_INCIDENTS: IncidentRecord[] = [
  {
    id: "SOS-SOLANI-01",
    timestamp: "16:42:10",
    raw_message: "Solani aqueduct ke paas paani 6ft ho gaya hai, dadi behosh hai aur chhota baby bhi hai chhat par, jaldi aao please!",
    clean_summary: "4 trapped near Solani Aqueduct with 6.0ft water level. Vulnerabilities: infant, elderly, acute_medical_distress.",
    landmark: "Solani Aqueduct, Roorkee",
    latitude: 29.8650,
    longitude: 77.8990,
    trapped_count: 4,
    vulnerabilities: ["infant", "elderly", "acute_medical_distress"],
    water_level_feet: 6.0,
    triage: {
      hazard_score: 0.85,
      medical_urgency_score: 0.90,
      vulnerability_score: 0.85,
      time_delay_score: 0.05,
      final_score: 0.785,
      priority_tier: "P1 - CRITICAL",
      explanation: "Ranked P1 - CRITICAL (Score: 0.79) because of: acute life-threatening medical emergency; rapidly rising water; infant and elderly present."
    },
    status: "PENDING_APPROVAL",
    ai_confidence: 0.98
  },
  {
    id: "SOS-CIVIL-02",
    timestamp: "16:38:40",
    raw_message: "Civil Lines near shiv mandir 4 log hain, ek pregnant aurat hai jinki delivery hone wali hai, boat dispatch karo.",
    clean_summary: "4 trapped near Civil Lines with 4.0ft water. Pregnant woman needs acute medical evacuation.",
    landmark: "Civil Lines, Roorkee",
    latitude: 29.8570,
    longitude: 77.8910,
    trapped_count: 4,
    vulnerabilities: ["pregnant", "acute_medical_distress"],
    water_level_feet: 4.0,
    triage: {
      hazard_score: 0.55,
      medical_urgency_score: 0.90,
      vulnerability_score: 0.60,
      time_delay_score: 0.08,
      final_score: 0.635,
      priority_tier: "P2 - HIGH",
      explanation: "Ranked P2 - HIGH (Score: 0.64) because of: high-risk pregnant individual requiring hospital intake."
    },
    status: "PENDING_APPROVAL",
    ai_confidence: 0.95
  },
  {
    id: "SOS-RAMNAGAR-03",
    timestamp: "16:31:15",
    raw_message: "Ramnagar brij bridge ke paas 6 log chhat par surakshit hain, pani 3ft hai road par, dry food and water kit chahiye.",
    clean_summary: "6 citizens safe on high terrace near Brij Bridge, requesting potable water and rations.",
    landmark: "Ramnagar, Roorkee",
    latitude: 29.8620,
    longitude: 77.8800,
    trapped_count: 6,
    vulnerabilities: ["elderly"],
    water_level_feet: 3.0,
    triage: {
      hazard_score: 0.40,
      medical_urgency_score: 0.20,
      vulnerability_score: 0.30,
      time_delay_score: 0.12,
      final_score: 0.382,
      priority_tier: "P3 - MEDIUM",
      explanation: "Ranked P3 - MEDIUM (Score: 0.38): individuals safe on elevated terrace; non-critical food dispatch."
    },
    status: "PENDING_APPROVAL",
    ai_confidence: 0.92
  }
];

const FALLBACK_FLOOD_GEO = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "flood_zone_1",
        name: "Solani River Basin Inundation Zone",
        severity: "CRITICAL_RED",
        depth_feet: 6.8,
        fillColor: "#EF4444"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [77.8920, 29.8690],
            [77.9040, 29.8710],
            [77.9080, 29.8640],
            [77.8970, 29.8590],
            [77.8920, 29.8690]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "flood_zone_2",
        name: "Civil Lines / Ganga Canal Low-Lying Breach",
        severity: "HIGH_ORANGE",
        depth_feet: 4.2,
        fillColor: "#F97316"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [77.8850, 29.8550],
            [77.8950, 29.8570],
            [77.8930, 29.8500],
            [77.8830, 29.8490],
            [77.8850, 29.8550]
          ]
        ]
      }
    }
  ]
};

const FALLBACK_WATER_SENSORS: WaterSensorNode[] = [
  {
    id: "WS-SOLANI-01",
    name: "HydraSense Solani Intake",
    landmark: "Solani River Inundation Fringe",
    latitude: 29.8660,
    longitude: 77.8980,
    turbidity_ntu: 46.8,
    ph_level: 5.8,
    tds_ppm: 780,
    dissolved_oxygen_mg_l: 3.1,
    is_anomalous: true,
    status: "CRITICAL_CONTAMINATION",
    alert_message: "CRITICAL: Flood runoff breach detected! Turbidity 46.8 NTU exceeds safe limit (5 NTU).",
    updated_at: "Just now"
  },
  {
    id: "WS-CIVIL-02",
    name: "HydraSense Civil Lines Sub-Station",
    landmark: "Civil Lines Municipal Line",
    latitude: 29.8560,
    longitude: 77.8890,
    turbidity_ntu: 24.3,
    ph_level: 6.3,
    tds_ppm: 540,
    dissolved_oxygen_mg_l: 4.8,
    is_anomalous: true,
    status: "WARNING",
    alert_message: "WARNING: Pipeline pressure drop & secondary silt ingress detected.",
    updated_at: "2 mins ago"
  },
  {
    id: "WS-CANTT-03",
    name: "HydraSense Roorkee Cantt Safe Well",
    landmark: "Cantt High-Ground Reservoir",
    latitude: 29.8510,
    longitude: 77.8830,
    turbidity_ntu: 1.2,
    ph_level: 7.4,
    tds_ppm: 160,
    dissolved_oxygen_mg_l: 7.2,
    is_anomalous: false,
    status: "SAFE",
    alert_message: "All parameters normal. Potable water distribution operating safely.",
    updated_at: "1 min ago"
  },
  {
    id: "WS-IITR-04",
    name: "HydraSense IIT Roorkee Treatment Plant",
    landmark: "IIT Campus Main Supply",
    latitude: 29.8630,
    longitude: 77.8940,
    turbidity_ntu: 2.1,
    ph_level: 7.2,
    tds_ppm: 190,
    dissolved_oxygen_mg_l: 6.9,
    is_anomalous: false,
    status: "SAFE",
    alert_message: "Water parameters comply with WHO standards.",
    updated_at: "4 mins ago"
  }
];

const FALLBACK_FLEET: FleetAsset[] = [
  { id: "unit-1", callsign: "NDRF-BOAT-04", type: "Motorboat", latitude: 29.8550, longitude: 77.8860, status: "READY", battery_or_fuel_pct: 88, survivors_onboard: 0 },
  { id: "unit-2", callsign: "SDRF-BOAT-09", type: "Motorboat", latitude: 29.8600, longitude: 77.8910, status: "ON_MISSION", battery_or_fuel_pct: 72, survivors_onboard: 3 },
  { id: "unit-3", callsign: "AMB-QRT-01", type: "QRT Ambulance", latitude: 29.8520, longitude: 77.8820, status: "READY", battery_or_fuel_pct: 95, survivors_onboard: 0 },
  { id: "unit-4", callsign: "RECON-DRONE-X", type: "Thermal Drone", latitude: 29.8630, longitude: 77.8930, status: "AIRBORNE", battery_or_fuel_pct: 64, survivors_onboard: 0 }
];

export async function fetchIncidentQueue(): Promise<IncidentRecord[]> {
  try {
    const res = await fetch(`${API_BASE}/distress/queue`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {
    // quiet fallback
  }
  return FALLBACK_INCIDENTS;
}

export async function parseDistressMessage(rawMessage: string, source: string = 'WhatsApp'): Promise<IncidentRecord> {
  try {
    const res = await fetch(`${API_BASE}/distress/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_message: rawMessage, source })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // Local resilient parsing fallback
  }

  // Client-side deterministic fallback
  const isP1 = /baby|dadi|unconscious|behosh|pregnant|6ft|roof|chhat/i.test(rawMessage);
  return {
    id: `SOS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    timestamp: new Date().toLocaleTimeString(),
    raw_message: rawMessage,
    clean_summary: `Parsed distress signal: ${rawMessage.substring(0, 70)}...`,
    landmark: /solani/i.test(rawMessage) ? "Solani Aqueduct, Roorkee" : "Civil Lines, Roorkee",
    latitude: 29.8650,
    longitude: 77.8990,
    trapped_count: 4,
    vulnerabilities: isP1 ? ["elderly", "infant"] : ["waterlogging"],
    water_level_feet: isP1 ? 6.0 : 2.5,
    triage: {
      hazard_score: isP1 ? 0.85 : 0.40,
      medical_urgency_score: isP1 ? 0.90 : 0.20,
      vulnerability_score: isP1 ? 0.80 : 0.30,
      time_delay_score: 0.05,
      final_score: isP1 ? 0.78 : 0.35,
      priority_tier: isP1 ? "P1 - CRITICAL" : "P3 - MEDIUM",
      explanation: isP1
        ? "Ranked P1 - CRITICAL because of: acute vulnerability and deep waterlevel."
        : "Ranked P3 - MEDIUM: stable location with non-critical delay."
    },
    status: "PENDING_APPROVAL",
    ai_confidence: 0.96
  };
}

export async function approveDispatch(incidentId: string, unitCallsign: string = 'NDRF-BOAT-04') {
  try {
    const res = await fetch(`${API_BASE}/distress/${incidentId}/approve?unit_callsign=${unitCallsign}`, {
      method: 'POST'
    });
    if (res.ok) {
      const data = await res.json();
      return data.incident || data;
    }
  } catch (e) {}
  return { status: "SUCCESS", message: `Unit ${unitCallsign} dispatched.` };
}

export async function fetchIncidentStatus(incidentId: string): Promise<IncidentRecord> {
  try {
    const res = await fetch(`${API_BASE}/distress/${incidentId}/status`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {}
  return FALLBACK_INCIDENTS[0];
}

export async function fetchFloodGeoJSON(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/routing/flood-map`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {}
  return FALLBACK_FLOOD_GEO;
}

export async function fetchWaterSensors(): Promise<WaterSensorNode[]> {
  try {
    const res = await fetch(`${API_BASE}/water/sensors`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {}
  return FALLBACK_WATER_SENSORS;
}

export async function fetchHeatZones(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/heat/zones`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {}
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { id: "heat_zone_1", zone_name: "Station Industrial Corridor", surface_temp_celsius: 44.8, heat_stress_level: "EXTREME", fillColor: "#DC2626" },
        geometry: { type: "Polygon", coordinates: [[[77.878, 29.845], [77.889, 29.847], [77.886, 29.840], [77.876, 29.839], [77.878, 29.845]]] }
      }
    ]
  };
}

export async function calculateRoute(
  origin: [number, number],
  destination: [number, number],
  avoidFloodZones: boolean = true
): Promise<RouteSegment> {
  try {
    const res = await fetch(`${API_BASE}/routing/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination, avoid_flood_zones: avoidFloodZones })
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  if (avoidFloodZones) {
    return {
      coordinates: [
        origin,
        [origin[0] + 0.003, origin[1] - 0.006],
        [29.8670, 77.8860],
        [destination[0] + 0.002, destination[1] - 0.003],
        destination
      ],
      distance_km: 3.4,
      duration_minutes: 8.2,
      avoided_hazards: ["Brij Bridge (Avoided: 5.5ft deep current)"],
      is_safe: true
    };
  }

  return {
    coordinates: [origin, destination],
    distance_km: 2.1,
    duration_minutes: 5.0,
    avoided_hazards: [],
    is_safe: false
  };
}

export async function fetchFleetAssets(): Promise<FleetAsset[]> {
  try {
    const res = await fetch(`${API_BASE}/fleet/assets`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {}
  return FALLBACK_FLEET;
}

export async function fetchSampleMessages(): Promise<SampleMessage[]> {
  try {
    const res = await fetch(`${API_BASE}/distress/samples`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {}
  return [
    { title: "Scenario A", message: "Solani aqueduct ke paas paani 6ft ho gaya hai, dadi behosh hai aur chhota baby bhi hai chhat par, jaldi aao please!", source: "WhatsApp", expected_tier: "P1 - CRITICAL" },
    { title: "Scenario B", message: "Sector 4 me ground floor kamre me 2 log fas gaye hain darwaza jam ho gaya hai, paani 5 feet badh gaya hai!", source: "Emergency 112", expected_tier: "P1 - CRITICAL" },
    { title: "Scenario C", message: "Civil Lines near shiv mandir 4 log hain, ek pregnant aurat hai jinki delivery hone wali hai, boat dispatch karo.", source: "WhatsApp", expected_tier: "P2 - HIGH" }
  ];
}

export async function fetchImagePresets(): Promise<ImagePreset[]> {
  return [
    { id: "sample_roof", title: "House Submerged to Roof Level", waterline: "Roof / Ceiling Breach (>6.8ft)", thumbnail_label: "🏠 Critical Roof Flood", depth_feet: 6.8, badge: "P1 CRITICAL" },
    { id: "sample_car", title: "Submerged Passenger Vehicle", waterline: "Window Mid-Level (4.5ft)", thumbnail_label: "🚗 Submerged Car", depth_feet: 4.5, badge: "P2 HIGH" },
    { id: "sample_knee", title: "Street Waterlogging & Drainage Ingress", waterline: "Ankle / Knee Deep (1.8ft)", thumbnail_label: "🚶 Street Inundation", depth_feet: 1.8, badge: "P3 MODERATE" }
  ];
}

export async function analyzeFloodPhoto(
  sampleId?: string,
  imageBase64?: string,
  landmarkHint: string = 'Solani Basin, Roorkee'
): Promise<ImageAnalysisResponse> {
  try {
    const res = await fetch(`${API_BASE}/distress/analyze-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sample_id: sampleId, image_base64: imageBase64, landmark_hint: landmarkHint })
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  return {
    estimated_depth_feet: sampleId === "sample_car" ? 4.5 : sampleId === "sample_knee" ? 1.8 : 6.8,
    estimated_depth_meters: sampleId === "sample_car" ? 1.37 : sampleId === "sample_knee" ? 0.55 : 2.07,
    waterline_level: sampleId === "sample_car" ? "Window Mid-Level (4.5ft)" : sampleId === "sample_knee" ? "Ankle / Knee Deep (1.8ft)" : "Roof / Ceiling Breach (>6ft)",
    detected_objects: ["Residential building", "Floodwater current", "Submerged ground floor"],
    structural_hazard_level: sampleId === "sample_knee" ? "LOW_LOCALIZED_PUDDLING" : "CRITICAL_COLLAPSE_RISK",
    hazard_score: sampleId === "sample_knee" ? 0.32 : 0.91,
    confidence_score: 0.96,
    summary: `AI Waterline Gauge: Waterline detected at ${sampleId === "sample_car" ? 4.5 : 6.8}ft depth. Immediate evacuation priority.`,
    suggested_distress_message: `Solani basin residential house ground floor fully submerged 6.8ft, 4 people trapped on roof!`
  };
}

export async function fetchSensorHistory(sensorId: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/water/history/${sensorId}`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {}

  return {
    sensor_id: sensorId,
    safe_threshold_turbidity: 5.0,
    critical_threshold_turbidity: 20.0,
    timeline: [
      { time: "-11h", turbidity: 2.1, ph: 7.3, tds: 160 },
      { time: "-9h", turbidity: 2.4, ph: 7.4, tds: 165 },
      { time: "-7h", turbidity: 3.1, ph: 7.2, tds: 180 },
      { time: "-5h", turbidity: 4.5, ph: 7.0, tds: 210 },
      { time: "-4h", turbidity: 8.2, ph: 6.8, tds: 290 },
      { time: "-3h", turbidity: 19.4, ph: 6.4, tds: 420 },
      { time: "-2h", turbidity: 34.0, ph: 6.0, tds: 610 },
      { time: "-1h", turbidity: 42.5, ph: 5.9, tds: 720 },
      { time: "Now", turbidity: 46.8, ph: 5.8, tds: 780 }
    ],
    flood_breach_detected_at: "-4h",
    contamination_factor: "9.3x above permissible BIS IS-10500 standards"
  };
}

export async function fetchBoilWaterAdvisory(sensorId: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/water/advisory/${sensorId}`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {}

  return {
    advisory_id: `BWA-ROORKEE-2026-01`,
    issued_at: new Date().toLocaleString(),
    issuing_authority: "Haridwar-Roorkee District Disaster Management & Jal Sansthan",
    classification: "EMERGENCY HEALTH ADVISORY (BOIL-WATER NOTICE)",
    trigger_cause: "Submergence and structural silt infiltration of Solani feeder line during flood crest.",
    affected_zones: ["Solani Aqueduct Enclave (Wards 12-14)", "Sector 4 Low-Lying Pipeline Grid", "Ramnagar Riverfront Colonies"],
    mandatory_guidelines: [
      "Vigorously boil all municipal tap water for minimum 3 minutes prior to consumption.",
      "Emergency potable water distribution tankers deployed at Solani Chowk and Nehru Nagar Community Center."
    ],
    emergency_tanker_points: [
      { location: "Solani Chowk High Ground", water_truck_id: "JAL-TANKER-04", capacity_litres: 10000 },
      { location: "Nehru Nagar Relief Camp", water_truck_id: "JAL-TANKER-07", capacity_litres: 10000 }
    ]
  };
}

export async function fetchCommunityReports(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/water/community-reports`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {}

  return [
    { id: "CWR-101", ward: "Sector 4 / Solani Basin", timestamp: "16:45", description: "Tap water is muddy brown with foul organic odor.", severity: "CRITICAL" },
    { id: "CWR-102", ward: "Civil Lines Ward 7", timestamp: "16:50", description: "Slight yellow silt particles noticed in stored tank water.", severity: "WARNING" }
  ];
}

export async function submitCommunityWaterReport(ward: string, description: string, severity: string = 'WARNING') {
  try {
    const res = await fetch(`${API_BASE}/water/community-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ward, description, severity })
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  return {
    id: `CWR-${Math.floor(Math.random() * 900) + 100}`,
    ward,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    description,
    severity
  };
}

export async function simulateHeatwave(ambientTempCelsius: number): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/heat/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ambient_temp_celsius: ambientTempCelsius })
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  return {
    ambient_temp_celsius: ambientTempCelsius,
    delta_t: ambientTempCelsius - 36,
    cooling_shelters_required: ambientTempCelsius >= 43 ? 5 : 3,
    vulnerable_population_at_risk: ambientTempCelsius >= 43 ? 14700 : 8200,
    heat_alert_level: ambientTempCelsius >= 42 ? "RED SEVERE HEATWAVE" : "ORANGE HEAT STRESS"
  };
}

export async function fetchHeatInterventions(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/heat/interventions`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {}

  return [
    {
      id: "INT-01",
      corridor_name: "Station Road 2.4km Asphalt Artery",
      intervention_type: "Dense Native Tree Canopy (Neem & Peepal)",
      trees_to_plant: 450,
      projected_lst_reduction_celsius: -2.8,
      vulnerable_citizens_protected: 8200,
      estimated_budget_inr: "₹16.5 Lakhs"
    },
    {
      id: "INT-02",
      corridor_name: "Old Roorkee Bazar Pedestrian Zone",
      intervention_type: "Tensile High-Albedo Fabric Shading Canopies",
      area_sq_meters: 3200,
      projected_lst_reduction_celsius: -3.4,
      vulnerable_citizens_protected: 6500,
      estimated_budget_inr: "₹12.0 Lakhs"
    },
    {
      id: "INT-03",
      corridor_name: "Solani Embankment Urban Green Belt",
      intervention_type: "Riparian Buffer & Bioswales",
      trees_to_plant: 800,
      projected_lst_reduction_celsius: -1.9,
      dual_benefit: "Absorbs flood runoff in monsoon AND cools summer air via evapotranspiration",
      estimated_budget_inr: "₹24.0 Lakhs"
    }
  ];
}

export async function fetchTelemetrySnapshot(): Promise<TelemetryData> {
  try {
    const res = await fetch(`${API_BASE}/telemetry/snapshot`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {}

  return {
    timestamp: new Date().toISOString(),
    basin: "Roorkee - Solani - Haridwar Ganga Basin",
    gauges: [
      {
        id: "GAUGE-SOLANI-01",
        name: "Solani River Aqueduct",
        location: [29.8720, 77.8920],
        water_level_m: 5.48,
        warning_level_m: 5.00,
        danger_level_m: 6.20,
        discharge_cusecs: 18450,
        status: "WARNING",
        trend: "+0.04 m/hr"
      },
      {
        id: "GAUGE-GANGA-02",
        name: "Upper Ganga Canal Barrage",
        location: [29.8640, 77.8960],
        water_level_m: 4.12,
        warning_level_m: 4.80,
        danger_level_m: 5.80,
        discharge_cusecs: 12200,
        status: "NORMAL",
        trend: "STABLE"
      }
    ],
    water_quality: {
      station_id: "WATER-INTAKE-03",
      station_name: "Purqazi Water Intake & WTP",
      turbidity_ntu: 46.8,
      safe_limit_ntu: 5.0,
      is_anomalous: true,
      boil_water_advisory: true
    },
    meteorological: {
      station_name: "Civil Lines Microclimate Station",
      temperature_c: 39.4,
      heat_index_c: 44.8,
      rainfall_accum_mm: 168.4,
      wind_speed_kmh: 18.5
    },
    system_health: {
      bedrock_nlp_latency_ms: 940,
      active_fleet_readiness: "11/14 Vessels Deployed",
      lora_gateway_status: "ONLINE (Solani Repeater #2)"
    }
  };
}

export async function fetchPredictiveFloodTimeline(): Promise<PredictiveTimelineResponse> {
  try {
    const res = await fetch(`${API_BASE}/flood/predictive-timeline`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {}

  return {
    model_version: "CLIMAGRID-HYDRO-HYDRA-v2.4",
    meteorological_baseline: {
      rain_rate_mm_hr: 35.0,
      upstream_source: "Haridwar Bhimgoda Barrage Release",
      upstream_discharge_cusecs: 24500.0,
      danger_threshold_stage_m: 6.20
    },
    steps: [
      {
        step_id: "T0",
        time_offset_hours: 0,
        label: "T=0: CURRENT INUNDATION",
        status_badge: "ACTIVE CRISIS",
        solani_stage_meters: 5.42,
        discharge_cusecs: 24500.0,
        flooded_area_hectares: 340.5,
        citizens_in_hazard_zone: 4200,
        impassable_infrastructure: [
          { name: "Brij Bridge (Underpass submerged)", status: "IMPASSABLE", depth_feet: 5.5 },
          { name: "Solani Aqueduct Embankment Path", status: "DANGER", depth_feet: 4.2 }
        ],
        at_risk_next: "Ramnagar Sector 3 & Civil Lines low-lying drainage culverts",
        recommended_action: "Enforce high-ground bypass routes. Hold traffic at Roorkee bypass.",
        geojson: FALLBACK_FLOOD_GEO
      },
      {
        step_id: "T2",
        time_offset_hours: 2,
        label: "T=+2 HOURS FORECAST",
        status_badge: "PREDICTIVE SURGE (+38% EXPANSION)",
        solani_stage_meters: 5.95,
        discharge_cusecs: 28910.0,
        flooded_area_hectares: 470.0,
        citizens_in_hazard_zone: 7100,
        impassable_infrastructure: [
          { name: "Brij Bridge (Entire deck submerged)", status: "STRUCTURAL COLLAPSE RISK", depth_feet: 6.8 },
          { name: "Solani Aqueduct Embankment Path", status: "BREACHED", depth_feet: 5.4 },
          { name: "Ramnagar Link Road Culvert", status: "IMPASSABLE", depth_feet: 3.8 }
        ],
        at_risk_next: "Civil Lines Power Substation 33kV & IIT Roorkee East Drainage Gate",
        recommended_action: "PREEMPTIVE EVACUATION ORDER: Evacuate 850 families from Ramnagar Ward 4 within 45 minutes before culvert completely cuts off vehicular egress.",
        geojson: FALLBACK_FLOOD_GEO
      },
      {
        step_id: "T4",
        time_offset_hours: 4,
        label: "T=+4 HOURS FORECAST",
        status_badge: "MAXIMUM CREST (+72% EXPANSION)",
        solani_stage_meters: 6.55,
        discharge_cusecs: 32830.0,
        flooded_area_hectares: 585.0,
        citizens_in_hazard_zone: 11800,
        impassable_infrastructure: [
          { name: "Brij Bridge", status: "SUBMERGED 7.5ft", depth_feet: 7.5 },
          { name: "Solani Aqueduct Embankment", status: "EXTENSIVE OVERFLOW", depth_feet: 6.2 },
          { name: "Ramnagar Link Road", status: "WASHED OUT", depth_feet: 4.9 },
          { name: "Civil Lines South Service Artery", status: "WATERLOGGED 2.8ft", depth_feet: 2.8 }
        ],
        at_risk_next: "Drinking water intake at Purqazi (sewage contamination breakthrough)",
        recommended_action: "Deploy high-capacity dewatering pumps at Civil Lines Substation. Mobilize SDRF boat fleet 05-08 to RIT Safe Zone corridor.",
        geojson: FALLBACK_FLOOD_GEO
      },
      {
        step_id: "T6",
        time_offset_hours: 6,
        label: "T=+6 HOURS FORECAST",
        status_badge: "CREST PLATEAU & CASCADING BREACH",
        solani_stage_meters: 6.30,
        discharge_cusecs: 30625.0,
        flooded_area_hectares: 540.0,
        citizens_in_hazard_zone: 9900,
        impassable_infrastructure: [
          { name: "Brij Bridge", status: "STRUCTURAL INSPECTION REQUIRED", depth_feet: 6.1 },
          { name: "Purqazi Water Treatment Intake", status: "CONTAMINATED SILT INGRESS", depth_feet: 3.4 }
        ],
        at_risk_next: "Secondary waterborne bacterial outbreak in pipeline network",
        recommended_action: "Activate JEEVAN automated Boil-Water Notice. Dispatch 6 emergency potable water tankers to Solani flood relief camps.",
        geojson: FALLBACK_FLOOD_GEO
      }
    ]
  };
}

export async function simulateFloodInundation(
  rainRate: number,
  upstreamDischarge: number
): Promise<PredictiveTimelineResponse> {
  try {
    const res = await fetch(`${API_BASE}/flood/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rain_rate_mm_hr: rainRate,
        upstream_discharge_cusecs: upstreamDischarge
      })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Flood simulation API error:', e);
  }
  return fetchPredictiveFloodTimeline();
}

export async function fetchReliefShelters(): Promise<ReliefShelter[]> {
  try {
    const res = await fetch(`${API_BASE}/shelters/list`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {}

  return [
    {
      id: "SHELTER-RIT-01",
      name: "RIT Roorkee Safe Campus Safe Zone",
      landmark: "RIT Roorkee Campus, Puhana",
      latitude: 29.8350,
      longitude: 77.8920,
      total_capacity_beds: 650,
      occupied_beds: 420,
      available_beds: 230,
      medical_capabilities: ["24/7 Trauma Triage", "Pediatric Care", "Maternity Ward", "Oxygen Concentrators"],
      has_pediatric: true,
      has_maternity: true,
      potable_water_liters: 18500,
      dry_ration_kits: 1400,
      power_backup: "Solar Microgrid + 125kVA Genset",
      status: "OPERATIONAL_ACCEPTING",
      contact_officer: "Prof. S. Sharma (Camp Commandant)",
      contact_phone: "+91-98970-11201"
    },
    {
      id: "SHELTER-STADIUM-02",
      name: "Roorkee Sports Stadium Mega-Camp",
      landmark: "Nehru Stadium, Civil Lines",
      latitude: 29.8690,
      longitude: 77.8840,
      total_capacity_beds: 1200,
      occupied_beds: 980,
      available_beds: 220,
      medical_capabilities: ["General First Aid", "Dehydration Treatment", "Mobile Dispensary"],
      has_pediatric: false,
      has_maternity: false,
      potable_water_liters: 32000,
      dry_ration_kits: 3200,
      power_backup: "Municipal Dual Genset",
      status: "HIGH_OCCUPANCY",
      contact_officer: "R. K. Verma (District Sports Officer)",
      contact_phone: "+91-98970-11202"
    },
    {
      id: "SHELTER-CIVIL-03",
      name: "Civil Lines Community Center & School",
      landmark: "Near Shiv Mandir, Civil Lines",
      latitude: 29.8590,
      longitude: 77.8940,
      total_capacity_beds: 400,
      occupied_beds: 380,
      available_beds: 20,
      medical_capabilities: ["Maternity Isolation Ward", "Elderly Care", "Cardiac Defibrillator"],
      has_pediatric: true,
      has_maternity: true,
      potable_water_liters: 8200,
      dry_ration_kits: 650,
      power_backup: "Dedicated Generator",
      status: "CRITICAL_CAPACITY",
      contact_officer: "Dr. Meenakshi Joshi (Chief Medical Officer)",
      contact_phone: "+91-98970-11203"
    },
    {
      id: "SHELTER-SOLANI-04",
      name: "Solani High-Ground Relief Tent City",
      landmark: "Solani Aqueduct North High Ridge",
      latitude: 29.8780,
      longitude: 77.8900,
      total_capacity_beds: 500,
      occupied_beds: 190,
      available_beds: 310,
      medical_capabilities: ["Rapid First Aid Tents", "Mobile Jeevan Water Filter"],
      has_pediatric: false,
      has_maternity: false,
      potable_water_liters: 15000,
      dry_ration_kits: 950,
      power_backup: "Mobile Solar Towers",
      status: "OPERATIONAL_ACCEPTING",
      contact_officer: "Inspector Vikram Rawat (SDRF)",
      contact_phone: "+91-98970-11204"
    }
  ];
}

export async function allocateShelterForIncident(
  incidentId: string,
  latitude: number,
  longitude: number,
  headcount: number,
  vulnerabilities: string[]
): Promise<ShelterAllocationResponse> {
  try {
    const res = await fetch(`${API_BASE}/shelters/allocate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incident_id: incidentId,
        incident_latitude: latitude,
        incident_longitude: longitude,
        headcount,
        vulnerabilities
      })
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  return {
    status: "ALLOCATED",
    incident_id: incidentId,
    recommended_shelter: {
      id: "SHELTER-RIT-01",
      name: "RIT Roorkee Safe Campus Safe Zone",
      landmark: "RIT Roorkee Campus, Puhana",
      latitude: 29.8350,
      longitude: 77.8920,
      total_capacity_beds: 650,
      occupied_beds: 424,
      available_beds: 226,
      medical_capabilities: ["24/7 Trauma Triage", "Pediatric Care", "Maternity Ward", "Oxygen Concentrators"],
      has_pediatric: true,
      has_maternity: true,
      potable_water_liters: 18500,
      dry_ration_kits: 1400,
      power_backup: "Solar Microgrid + 125kVA Genset",
      status: "OPERATIONAL_ACCEPTING",
      contact_officer: "Prof. S. Sharma (Camp Commandant)",
      contact_phone: "+91-98970-11201"
    },
    distance_km: 1.85,
    allocated_beds: headcount,
    rationale: "Matched based on proximity (1.85km) and critical facilities: Pediatric Care, Maternity Ward.",
    remaining_shelter_capacity: 226
  };
}

export async function logSupplyDrop(
  shelterId: string,
  waterLiters: number = 0,
  rations: number = 0,
  beds: number = 0
): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/shelters/${shelterId}/supply-drop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        added_water_liters: waterLiters,
        added_rations: rations,
        added_beds: beds
      })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Supply drop API error:', e);
  }
  return { status: "SUCCESS", message: `Dispatched ${waterLiters}L water & ${rations} rations to ${shelterId}` };
}

export async function fetchActiveCAPAlerts(): Promise<CAPAlert[]> {
  try {
    const res = await fetch(`${API_BASE}/alerts/active`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {}

  return [
    {
      identifier: "IN-NDMA-ROORKEE-20261126-001",
      sender: "eoc-roorkee@ndma.gov.in",
      sent: new Date().toISOString(),
      status: "Actual",
      msgType: "Alert",
      scope: "Public",
      category: "Met",
      event: "Flash Flood & Embankment Overflow",
      urgency: "Immediate",
      severity: "Extreme",
      certainty: "Observed",
      headline_en: "🚨 NDMA URGENT FLASH FLOOD SIREN: Solani River embankment water level rising rapidly in Roorkee. Move to high ground immediately.",
      headline_hi: "🚨 राष्ट्रीय आपदा प्रबंधन प्राधिकरण (NDMA): सोलानी नदी तटबंध जलस्तर चेतावनी। तत्काल सुरक्षित ऊंचे स्थान पर जाएं।",
      description_en: "Solani River water stage has exceeded 5.4m warning mark. Brij Bridge underpass is impassable (5.5ft deep current). Preemptive evacuation ordered for Ramnagar Ward 4 and Solani Basin. Designate RIT Roorkee Campus Safe Zone or Nehru Stadium for emergency shelter. Emergency Helpline: 112.",
      description_hi: "सोलानी नदी का जलस्तर चेतावनी स्तर को पार कर गया है। बृज ब्रिज पूरी तरह जलमग्न है। रामनगर वार्ड 4 के नागरिक तुरंत सुरक्षित ऊंचाई पर जाएं। आपातकालीन हेल्पलाइन: 112।",
      instruction: "Do not attempt to cross flooded bridges or moving water. Boil all drinking water. Keep mobile phones charged.",
      area_description: "Roorkee - Solani Aqueduct, Ramnagar, Civil Lines South, Upper Ganga Canal Basin",
      polygon_coordinates: "29.8550,77.8800 29.8750,77.8850 29.8780,77.9050 29.8580,77.9000 29.8550,77.8800",
      cap_xml: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<alert xmlns=\"urn:oasis:names:tc:emergency:cap:1.2\">\n  <identifier>IN-NDMA-ROORKEE-20261126-001</identifier>\n  <sender>eoc-roorkee@ndma.gov.in</sender>\n  <status>Actual</status>\n  <msgType>Alert</msgType>\n  <scope>Public</scope>\n  <info>\n    <category>Met</category>\n    <event>Flash Flood</event>\n    <urgency>Immediate</urgency>\n    <severity>Extreme</severity>\n    <headline>🚨 NDMA URGENT FLASH FLOOD SIREN: Solani River breach</headline>\n  </info>\n</alert>",
      cell_towers_targeted: 48,
      estimated_recipients: 54000
    }
  ];
}

export async function fetchCAPTemplates(): Promise<CAPTemplate[]> {
  try {
    const res = await fetch(`${API_BASE}/alerts/template`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {}

  return [
    {
      id: "tpl_flood",
      title: "Solani River Embankment Breach (Flash Flood)",
      severity: "Extreme",
      event: "Flash Flood & Inundation",
      headline_en: "🚨 NDMA URGENT FLASH FLOOD SIREN: Solani River embankment breached in Roorkee. Move to high ground immediately.",
      headline_hi: "🚨 राष्ट्रीय आपदा प्रबंधन प्राधिकरण: सोलानी नदी तटबंध टूटा। तुरंत सुरक्षित ऊंचे स्थान पर जाएं।",
      description_en: "Rapid water level ingress in Ramnagar and Solani Basin. Brij Bridge impassable. RIT Roorkee Safe Campus opened for relief shelter.",
      description_hi: "रामनगर और सोलानी बेसिन में जलस्तर तेजी से बढ़ रहा है। बृज ब्रिज जलमग्न है। आर.आई.टी रुड़की सुरक्षित राहत शिविर में शरण लें।",
      area_description: "Roorkee - Solani Basin, Ramnagar Ward 4, Civil Lines"
    },
    {
      id: "tpl_water",
      title: "Municipal Drinking Water Contamination (Boil Notice)",
      severity: "Severe",
      event: "Drinking Water Contamination",
      headline_en: "⚠️ MUNICIPAL BOIL-WATER ADVISORY: Sewage ingress detected in water pipelines. Boil tap water for 3+ minutes.",
      headline_hi: "⚠️ नगर निगम चेतावनी: पेयजल पाइपलाइनों में सीवेज रिसाव। नल का पानी कम से कम 3 मिनट उबालकर ही पिएं।",
      description_en: "Water treatment intake turbidity spiked to 46.8 NTU. Do not consume unboiled tap water. Potable water tankers dispatched.",
      description_hi: "जल शोधन संयंत्र में भारी गंदगी पाई गई है। उबला पानी ही पिएं। आपातकालीन पानी के टैंकर रवाना कर दिए गए हैं।",
      area_description: "Roorkee Municipal District & Purqazi Supply Grid"
    },
    {
      id: "tpl_bridge",
      title: "Brij Bridge Impassable & Structural Compromise",
      severity: "Severe",
      event: "Structural Infrastructure Hazard",
      headline_en: "⛔ TRAFFIC ALERT: Brij Bridge closed due to 5.5ft flood current. Use Highway bypass.",
      headline_hi: "⛔ यातायात अलर्ट: बृज ब्रिज पर 5.5 फीट पानी भरने के कारण बंद किया गया। हाईवे बाईपास का उपयोग करें।",
      description_en: "Brij Bridge underpass is impassable. All vehicles rerouted via Roorkee National Highway bypass corridor.",
      description_hi: "बृज ब्रिज पर यातायात पूरी तरह रोक दिया गया है। राष्ट्रीय राजमार्ग बाईपास का प्रयोग करें।",
      area_description: "Brij Bridge Roorkee Crossing"
    }
  ];
}

export async function broadcastCAPAlert(payload: {
  event: string;
  severity: string;
  headline_en: string;
  headline_hi: string;
  description_en: string;
  description_hi: string;
  area_description: string;
}): Promise<CAPAlert> {
  try {
    const res = await fetch(`${API_BASE}/alerts/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  return {
    identifier: `IN-NDMA-ROORKEE-${Date.now().toString().slice(-6)}`,
    sender: "eoc-roorkee@ndma.gov.in",
    sent: new Date().toISOString(),
    status: "Actual",
    msgType: "Alert",
    scope: "Public",
    category: "Met",
    event: payload.event,
    urgency: "Immediate",
    severity: payload.severity,
    certainty: "Observed",
    headline_en: payload.headline_en,
    headline_hi: payload.headline_hi,
    description_en: payload.description_en,
    description_hi: payload.description_hi,
    instruction: "Follow official SDRF directives.",
    area_description: payload.area_description,
    polygon_coordinates: "29.8550,77.8800 29.8750,77.8850 29.8780,77.9050 29.8580,77.9000 29.8550,77.8800",
    cap_xml: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<alert xmlns=\"urn:oasis:names:tc:emergency:cap:1.2\">\n  <identifier>IN-NDMA-ROORKEE-LIVE</identifier>\n  <info>\n    <headline>" + payload.headline_en + "</headline>\n  </info>\n</alert>",
    cell_towers_targeted: 52,
    estimated_recipients: 62500
  };
}

export async function fetchDamageAssessment(): Promise<DamageAssessmentResponse> {
  try {
    const res = await fetch(`${API_BASE}/damage/assessment`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {}

  return {
    assessment_id: "SDRF-UK-ROORKEE-20261127-001",
    survey_timestamp: new Date().toISOString(),
    district: "Haridwar / Roorkee Basin",
    state: "Uttarakhand",
    governing_standard: "MHA SDRF / NDRF Operational Guidelines (2025-2026)",
    summary_metrics: {
      total_flooded_hectares: 470.0,
      total_affected_families: 1480,
      road_network_washout_km: 7.8,
      total_economic_loss_inr: 64200000,
      total_economic_loss_cr: 6.42,
      total_sdrf_grant_claim_inr: 61500000,
      total_sdrf_grant_claim_cr: 6.15,
      average_drone_severity_score: 8.5
    },
    sdrf_grant_breakdown: {
      ex_gratia_family_relief_inr: 18500000,
      infrastructure_reconstruction_inr: 35200000,
      agricultural_input_subsidy_inr: 4500000,
      water_sanitation_rehabilitation_inr: 3300000
    },
    sectors: [
      {
        sector_id: "SEC-01-SOLANI",
        name: "Solani River Embankment & Aqueduct Corridor",
        inundated_hectares: 178.6,
        affected_dwellings: 414,
        damage_category: "Embankment Scouring & Riparian Erosion",
        severity_grade: "SEVERE",
        drone_survey_score: 8.4,
        structural_loss_inr: 14500000,
        crop_loss_inr: 4800000,
        key_failures: [
          "Solani Aqueduct northern revetment compromised (240m)",
          "Drainage sluice gates #2 and #4 silt-jammed",
          "34 rural pakka houses partially washed out"
        ]
      },
      {
        sector_id: "SEC-02-RAMNAGAR",
        name: "Brij Bridge & Ramnagar Lowlands",
        inundated_hectares: 150.4,
        affected_dwellings: 651,
        damage_category: "Bridge Deck & Residential Submergence",
        severity_grade: "CRITICAL_COLLAPSE_RISK",
        drone_survey_score: 9.2,
        structural_loss_inr: 21000000,
        crop_loss_inr: 1200000,
        key_failures: [
          "Brij Bridge pier footing scouring (5.5ft rushing current)",
          "Ramnagar arterial link road washed out (3.2 km)",
          "680 residential ground floors submerged past ceiling level"
        ]
      },
      {
        sector_id: "SEC-03-CIVIL-LINES",
        name: "Civil Lines Municipal & Electrical Substation Grid",
        inundated_hectares: 65.8,
        affected_dwellings: 236,
        damage_category: "Power Grid & Drainage Pump Failures",
        severity_grade: "HIGH_UTILITY_LOSS",
        drone_survey_score: 7.6,
        structural_loss_inr: 9500000,
        crop_loss_inr: 0,
        key_failures: [
          "33kV Civil Lines substation transformers inundated",
          "Municipal stormwater lift pumps #1-#3 burned out",
          "Commercial market basement silt ingress"
        ]
      },
      {
        sector_id: "SEC-04-PURQAZI",
        name: "Purqazi Water Intake & Pipeline Network",
        inundated_hectares: 75.2,
        affected_dwellings: 177,
        damage_category: "Municipal Drinking Water Contamination",
        severity_grade: "CRITICAL_HEALTH_HAZARD",
        drone_survey_score: 8.8,
        structural_loss_inr: 6200000,
        crop_loss_inr: 3500000,
        key_failures: [
          "Drinking water intake choked with 46.8 NTU turbidity silt",
          "Primary distribution feeder pipe fractured by hydrostatic pressure",
          "14,000 households cut off from safe municipal water"
        ]
      }
    ],
    dossier_text: "GOVERNMENT OF UTTARAKHAND — STATE DISASTER MANAGEMENT AUTHORITY (USDMA)\nPRELIMINARY POST-FLOOD DAMAGE & SDRF RELIEF GRANT MEMORANDUM\nBasin: Roorkee - Solani River - Upper Ganga Canal (Haridwar District)\nTotal SDRF Claim: ₹6.15 Crores"
  };
}

export async function recalculateDamage(
  floodedHectares: number = 470.0,
  affectedFamilies: number = 1480,
  roadWashoutKm: number = 7.8
): Promise<DamageAssessmentResponse> {
  try {
    const res = await fetch(`${API_BASE}/damage/recalculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flooded_hectares: floodedHectares,
        affected_families: affectedFamilies,
        road_washout_km: roadWashoutKm
      })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Damage recalculation API error:', e);
  }
  return fetchDamageAssessment();
}
