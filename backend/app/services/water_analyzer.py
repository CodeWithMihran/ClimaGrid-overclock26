import json
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime
from app.models.schemas import WaterSensorNode

DATA_PATH = Path(__file__).parent.parent / "data" / "water_sensors.json"

# In-memory community water report store
COMMUNITY_WATER_REPORTS: List[Dict[str, Any]] = [
    {
        "id": "CWR-101",
        "ward": "Sector 4 / Solani Basin",
        "timestamp": "16:45",
        "description": "Tap water is muddy brown with foul organic odor. Multiple households reporting stomach ache.",
        "severity": "CRITICAL",
        "reported_by": "RWA Sector 4 President"
    },
    {
        "id": "CWR-102",
        "ward": "Civil Lines Ward 7",
        "timestamp": "16:50",
        "description": "Pressure drop in municipal line; slight yellow silt particles noticed in stored tank water.",
        "severity": "WARNING",
        "reported_by": "Civil Lines Resident"
    }
]

def get_water_sensors() -> List[WaterSensorNode]:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return [WaterSensorNode(**item) for item in data]

def get_sensor_time_series(sensor_id: str) -> Dict[str, Any]:
    """
    12-Hour Historical Sensor Telemetry Timeline.
    Demonstrates the exact moment floodwaters breached the embankment and contaminated the pipeline.
    """
    timeline = [
        {"time": "-11h", "turbidity": 2.1, "ph": 7.3, "tds": 160, "status": "SAFE"},
        {"time": "-9h", "turbidity": 2.4, "ph": 7.4, "tds": 165, "status": "SAFE"},
        {"time": "-7h", "turbidity": 3.1, "ph": 7.2, "tds": 180, "status": "SAFE"},
        {"time": "-5h", "turbidity": 4.5, "ph": 7.0, "tds": 210, "status": "SAFE"},
        {"time": "-4h", "turbidity": 8.2, "ph": 6.8, "tds": 290, "status": "WARNING"},  # Flood crest arrives
        {"time": "-3h", "turbidity": 19.4, "ph": 6.4, "tds": 420, "status": "CRITICAL"}, # Silt ingress
        {"time": "-2h", "turbidity": 34.0, "ph": 6.0, "tds": 610, "status": "CRITICAL"},
        {"time": "-1h", "turbidity": 42.5, "ph": 5.9, "tds": 720, "status": "CRITICAL"},
        {"time": "Now", "turbidity": 46.8, "ph": 5.8, "tds": 780, "status": "CRITICAL"}
    ]
    
    # Cantt & IIT plants remained safe on high ground
    if "CANTT" in sensor_id or "IITR" in sensor_id:
        timeline = [
            {"time": "-11h", "turbidity": 1.2, "ph": 7.4, "tds": 150, "status": "SAFE"},
            {"time": "-9h", "turbidity": 1.3, "ph": 7.4, "tds": 152, "status": "SAFE"},
            {"time": "-7h", "turbidity": 1.5, "ph": 7.3, "tds": 155, "status": "SAFE"},
            {"time": "-5h", "turbidity": 1.8, "ph": 7.3, "tds": 158, "status": "SAFE"},
            {"time": "-4h", "turbidity": 2.0, "ph": 7.2, "tds": 162, "status": "SAFE"},
            {"time": "-3h", "turbidity": 2.2, "ph": 7.2, "tds": 165, "status": "SAFE"},
            {"time": "-2h", "turbidity": 2.1, "ph": 7.3, "tds": 164, "status": "SAFE"},
            {"time": "-1h", "turbidity": 2.0, "ph": 7.3, "tds": 163, "status": "SAFE"},
            {"time": "Now", "turbidity": 2.1, "ph": 7.4, "tds": 160, "status": "SAFE"}
        ]

    return {
        "sensor_id": sensor_id,
        "safe_threshold_turbidity": 5.0,
        "critical_threshold_turbidity": 20.0,
        "timeline": timeline,
        "flood_breach_detected_at": "-4h",
        "contamination_factor": "9.3x above permissible BIS IS-10500 standards"
    }

def generate_boil_water_advisory(sensor_id: str) -> Dict[str, Any]:
    """
    Automated Municipal Health Boil-Water Notice Bulletin.
    """
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return {
        "advisory_id": f"BWA-ROORKEE-{datetime.now().strftime('%Y%m%d')}-01",
        "issued_at": now_str,
        "issuing_authority": "Haridwar-Roorkee District Disaster Management & Jal Sansthan",
        "classification": "EMERGENCY HEALTH ADVISORY (BOIL-WATER NOTICE)",
        "trigger_cause": "Submergence and structural silt infiltration of Solani distribution feeder line during flood crest.",
        "affected_zones": [
            "Solani Aqueduct Enclave (Wards 12-14)",
            "Sector 4 Low-Lying Pipeline Grid",
            "Ramnagar Riverfront Colonies"
        ],
        "mandatory_guidelines": [
            "Vigorously boil all municipal tap water for minimum 3 minutes prior to drinking, cooking, or infant formula preparation.",
            "Avoid using tap water for brushing teeth or washing raw fruits/vegetables.",
            "Emergency potable water distribution tankers deployed at Solani Chowk and Nehru Nagar Community Center."
        ],
        "emergency_tanker_points": [
            {"location": "Solani Chowk High Ground", "water_truck_id": "JAL-TANKER-04", "capacity_litres": 10000},
            {"location": "Nehru Nagar Relief Camp", "water_truck_id": "JAL-TANKER-07", "capacity_litres": 10000}
        ],
        "chlorine_dosing_status": "SUPER-CHLORINATION APPLIED AT FEEDER LINE (TARGET 2.0 PPM)"
    }

def record_community_report(ward: str, description: str, severity: str = "WARNING", reported_by: str = "Citizen") -> Dict[str, Any]:
    new_report = {
        "id": f"CWR-{len(COMMUNITY_WATER_REPORTS) + 101}",
        "ward": ward,
        "timestamp": datetime.now().strftime("%H:%M"),
        "description": description,
        "severity": severity,
        "reported_by": reported_by
    }
    COMMUNITY_WATER_REPORTS.insert(0, new_report)
    return new_report

def get_community_reports() -> List[Dict[str, Any]]:
    return COMMUNITY_WATER_REPORTS

def analyze_water_reading(turbidity: float, ph: float, tds: float, do: float) -> Dict[str, Any]:
    anomalies = []
    status = "SAFE"
    if turbidity > 20.0:
        anomalies.append(f"Severe silt & suspended solids ({turbidity} NTU; safe limit <5 NTU)")
        status = "CRITICAL_CONTAMINATION"
    elif turbidity > 8.0:
        anomalies.append(f"Elevated turbidity ({turbidity} NTU)")
        status = "WARNING"

    if ph < 6.2 or ph > 8.8:
        anomalies.append(f"Abnormal pH balance ({ph:.1f}; acceptable: 6.5 - 8.5)")
        if status != "CRITICAL_CONTAMINATION":
            status = "WARNING"

    if tds > 600:
        anomalies.append(f"High dissolved contaminants ({tds:.0f} ppm; standard <300 ppm)")

    if do < 4.0:
        anomalies.append(f"Critically depleted dissolved oxygen ({do:.1f} mg/L, organic decay)")
        status = "CRITICAL_CONTAMINATION"

    is_anomalous = len(anomalies) > 0
    if status == "CRITICAL_CONTAMINATION":
        advisory = "EMERGENCY: Floodwater mixing detected. High enteric pathogen risk. Issue immediate BOIL WATER ADVISORY."
    elif status == "WARNING":
        advisory = "PRECAUTIONARY: Filter and chlorinate municipal supply prior to consumption."
    else:
        advisory = "Water quality complies with potable standards (WHO/BIS IS 10500)."

    return {
        "is_anomalous": is_anomalous,
        "status": status,
        "advisory": advisory,
        "reasons": anomalies
    }
