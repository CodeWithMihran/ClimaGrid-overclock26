import json
from pathlib import Path
from typing import Dict, Any, List
from pydantic import BaseModel
from fastapi import APIRouter

router = APIRouter(prefix="/heat", tags=["HEATSHIELD Urban Heat Zones"])

DATA_PATH = Path(__file__).parent.parent / "data" / "heat_zones_geo.json"

class HeatSimulationRequest(BaseModel):
    ambient_temp_celsius: float = 40.0  # Range: 35.0 to 48.0

@router.get("/zones")
async def get_heat_zones() -> Dict[str, Any]:
    """Returns baseline GeoJSON layer with LST thermal hotspots & cooling center suggestions"""
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

@router.post("/simulate")
async def simulate_heatwave(req: HeatSimulationRequest) -> Dict[str, Any]:
    """
    HEATSHIELD Dynamic Urban Thermal Simulator.
    Calculates urban heat island expansion, heat stress indices, and required cooling centers
    as ambient heat waves scale from 35°C to 48°C.
    """
    delta_t = req.ambient_temp_celsius - 36.0
    
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        geo = json.load(f)

    total_vulnerable_exposed = 0
    cooling_shelters_required = 2

    for feat in geo["features"]:
        props = feat["properties"]
        base_temp = props["surface_temp_celsius"]
        
        # Non-linear thermal amplification over concrete/asphalt vs green buffer
        if props["id"] == "heat_zone_1":  # Concrete industrial
            scaled_temp = round(base_temp + (delta_t * 1.25), 1)
            props["surface_temp_celsius"] = scaled_temp
            if scaled_temp >= 46.0:
                props["heat_stress_level"] = "LIFE_THREATENING_EXTREME"
                props["fillColor"] = "#991B1B"
            total_vulnerable_exposed += props.get("vulnerable_population_density", 0)

        elif props["id"] == "heat_zone_2":  # Dense bazaar
            scaled_temp = round(base_temp + (delta_t * 1.10), 1)
            props["surface_temp_celsius"] = scaled_temp
            if scaled_temp >= 44.0:
                props["heat_stress_level"] = "VERY_HIGH"
                props["fillColor"] = "#C2410C"
            total_vulnerable_exposed += props.get("vulnerable_population_density", 0)

        elif props["id"] == "heat_cool_buffer":  # IIT forest sink
            scaled_temp = round(base_temp + (delta_t * 0.55), 1)
            props["surface_temp_celsius"] = scaled_temp
            props["fillColor"] = "#15803D"

    if req.ambient_temp_celsius >= 43.0:
        cooling_shelters_required = 5
    elif req.ambient_temp_celsius >= 40.0:
        cooling_shelters_required = 3

    return {
        "ambient_temp_celsius": req.ambient_temp_celsius,
        "delta_t": round(delta_t, 1),
        "cooling_shelters_required": cooling_shelters_required,
        "vulnerable_population_at_risk": total_vulnerable_exposed,
        "heat_alert_level": "RED SEVERE HEATWAVE" if req.ambient_temp_celsius >= 42.0 else "ORANGE HEAT STRESS",
        "simulated_geojson": geo
    }

@router.get("/interventions")
async def get_urban_interventions() -> List[Dict[str, Any]]:
    """
    Urban Resilience ROI & Tree Canopy Planning Matrix.
    Demonstrates long-term smart-city adaptation under HEATSHIELD.
    """
    return [
        {
            "id": "INT-01",
            "corridor_name": "Station Road 2.4km Asphalt Artery",
            "intervention_type": "Dense Native Tree Canopy (Neem & Peepal)",
            "trees_to_plant": 450,
            "projected_lst_reduction_celsius": -2.8,
            "vulnerable_citizens_protected": 8200,
            "estimated_budget_inr": "₹16.5 Lakhs",
            "implementation_timeline": "Phase 1 (Monsoon 2027)"
        },
        {
            "id": "INT-02",
            "corridor_name": "Old Roorkee Bazar Pedestrian Zone",
            "intervention_type": "Tensile High-Albedo Fabric Shading Canopies",
            "area_sq_meters": 3200,
            "projected_lst_reduction_celsius": -3.4,
            "vulnerable_citizens_protected": 6500,
            "estimated_budget_inr": "₹12.0 Lakhs",
            "implementation_timeline": "Immediate (Pre-Summer 2027)"
        },
        {
            "id": "INT-03",
            "corridor_name": "Solani Embankment Urban Green Belt",
            "intervention_type": "Riparian Buffer & Bioswales",
            "trees_to_plant": 800,
            "projected_lst_reduction_celsius": -1.9,
            "dual_benefit": "Absorbs flood runoff in monsoon AND cools summer air via evapotranspiration",
            "estimated_budget_inr": "₹24.0 Lakhs",
            "implementation_timeline": "Integrated Dual-Resilience Phase"
        }
    ]
