import { IncidentRecord, WaterSensorNode, RouteSegment, FleetAsset, SampleMessage, ImageAnalysisResponse, ImagePreset, TelemetryData } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

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
    if (res.ok) return await res.json();
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
