"""
CLIMAGRID - IoT Telemetry & River Gauge Stream Service
Provides live real-time hydrologic, water-quality, and thermal sensor streams
for the Roorkee / Haridwar Ganga & Solani Basin.
"""

import time
import random
from typing import Dict, Any, List

class IoTTelemetryService:
    def __init__(self):
        # Base sensor baselines for the Roorkee/Haridwar Basin
        self.stations = {
            "solani_aqueduct": {
                "id": "GAUGE-SOLANI-01",
                "name": "Solani River Aqueduct",
                "location": [29.8720, 77.8920],
                "water_level_m": 5.42,
                "warning_level_m": 5.00,
                "danger_level_m": 6.20,
                "discharge_cusecs": 18450,
                "status": "WARNING"
            },
            "ganga_canal_roorkee": {
                "id": "GAUGE-GANGA-02",
                "name": "Upper Ganga Canal Barrage",
                "location": [29.8640, 77.8960],
                "water_level_m": 4.10,
                "warning_level_m": 4.80,
                "danger_level_m": 5.80,
                "discharge_cusecs": 12200,
                "status": "NORMAL"
            },
            "purqazi_intake": {
                "id": "WATER-INTAKE-03",
                "name": "Purqazi Water Intake & WTP",
                "location": [29.8450, 77.8780],
                "turbidity_ntu": 46.8,
                "turbidity_threshold_ntu": 5.0,
                "ph_level": 7.8,
                "chlorine_mg_l": 0.12,
                "status": "CONTAMINATED"
            },
            "civil_lines_weather": {
                "id": "MET-ROORKEE-04",
                "name": "Civil Lines Microclimate Station",
                "location": [29.8660, 77.8900],
                "temperature_c": 39.2,
                "heat_index_c": 44.6,
                "humidity_pct": 74,
                "rainfall_accum_mm": 168.4,
                "status": "HEAT_ADVISORY"
            }
        }

    def get_snapshot(self) -> Dict[str, Any]:
        """Generate a realistic live reading with micro-fluctuations."""
        now = time.time()
        
        # Apply gentle realistic Brownian noise
        solani_level = round(5.42 + 0.08 * random.uniform(-1, 1.2), 2)
        solani_status = "CRITICAL" if solani_level >= 6.0 else ("WARNING" if solani_level >= 5.0 else "NORMAL")

        ganga_level = round(4.10 + 0.04 * random.uniform(-1, 1), 2)
        
        turbidity = round(46.8 + random.uniform(-1.5, 2.0), 1)
        
        temp = round(39.2 + random.uniform(-0.3, 0.4), 1)

        return {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now)),
            "basin": "Roorkee - Solani - Haridwar Ganga Basin",
            "gauges": [
                {
                    **self.stations["solani_aqueduct"],
                    "water_level_m": solani_level,
                    "status": solani_status,
                    "trend": "+0.04 m/hr" if solani_level > 5.4 else "-0.01 m/hr"
                },
                {
                    **self.stations["ganga_canal_roorkee"],
                    "water_level_m": ganga_level,
                    "status": "NORMAL",
                    "trend": "STABLE"
                }
            ],
            "water_quality": {
                "station_id": self.stations["purqazi_intake"]["id"],
                "station_name": self.stations["purqazi_intake"]["name"],
                "turbidity_ntu": turbidity,
                "safe_limit_ntu": 5.0,
                "is_anomalous": turbidity > 5.0,
                "boil_water_advisory": True
            },
            "meteorological": {
                "station_name": self.stations["civil_lines_weather"]["name"],
                "temperature_c": temp,
                "heat_index_c": round(temp + 5.2, 1),
                "rainfall_accum_mm": round(168.4 + random.uniform(0.1, 0.3), 1),
                "wind_speed_kmh": round(18.5 + random.uniform(-2, 3), 1)
            },
            "system_health": {
                "bedrock_nlp_latency_ms": random.randint(880, 1140),
                "active_fleet_readiness": "11/14 Vessels Deployed",
                "lora_gateway_status": "ONLINE (Solani Repeater #2)"
            }
        }

iot_service = IoTTelemetryService()
