from typing import List
from fastapi import APIRouter
from app.models.schemas import FleetAsset

router = APIRouter(prefix="/fleet", tags=["Tactical Fleet & Shelter Readiness"])

# Initial simulated fleet telemetry for the EOC HUD
FLEET_ASSETS = [
    FleetAsset(
        id="unit-1",
        callsign="NDRF-BOAT-04",
        type="Motorboat",
        latitude=29.8550,
        longitude=77.8860,
        status="READY",
        battery_or_fuel_pct=88,
        survivors_onboard=0
    ),
    FleetAsset(
        id="unit-2",
        callsign="SDRF-BOAT-09",
        type="Motorboat",
        latitude=29.8600,
        longitude=77.8910,
        status="ON_MISSION",
        battery_or_fuel_pct=72,
        assigned_incident_id="SOS-01",
        survivors_onboard=3
    ),
    FleetAsset(
        id="unit-3",
        callsign="AMB-QRT-01",
        type="QRT Ambulance",
        latitude=29.8520,
        longitude=77.8820,
        status="READY",
        battery_or_fuel_pct=95,
        survivors_onboard=0
    ),
    FleetAsset(
        id="unit-4",
        callsign="RECON-DRONE-X",
        type="Thermal Drone",
        latitude=29.8630,
        longitude=77.8930,
        status="AIRBORNE",
        battery_or_fuel_pct=64,
        survivors_onboard=0
    )
]

@router.get("/assets", response_model=List[FleetAsset])
async def get_fleet_telemetry():
    """Returns active fleet units with live telemetry & battery/fuel gauges"""
    return FLEET_ASSETS

@router.get("/summary")
async def get_readiness_summary():
    """Returns HUD summary counts for EOC tactical bar"""
    return {
        "active_boats": "11/14 Deployed",
        "medical_teams": "8/10 Ready",
        "drones": "4/5 Airborne",
        "shelters_open": "12/15 Operational",
        "live_rainfall_mm": "168mm",
        "high_risk_zones": 7,
        "flood_warning_level": "LEVEL 3 - CRITICAL"
    }
