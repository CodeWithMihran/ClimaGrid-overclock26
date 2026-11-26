from typing import List, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter
from app.models.schemas import WaterSensorNode
from app.services.water_analyzer import (
    get_water_sensors,
    analyze_water_reading,
    get_sensor_time_series,
    generate_boil_water_advisory,
    record_community_report,
    get_community_reports
)

router = APIRouter(prefix="/water", tags=["JEEVAN Water Intelligence"])

class CommunityWaterReportInput(BaseModel):
    ward: str
    description: str
    severity: str = "WARNING"
    reported_by: str = "Citizen Field User"

@router.get("/sensors", response_model=List[WaterSensorNode])
async def list_water_sensors():
    """Returns active IoT telemetry nodes with anomaly flags"""
    return get_water_sensors()

@router.get("/history/{sensor_id}")
async def get_sensor_history(sensor_id: str) -> Dict[str, Any]:
    """Returns 12-hour historical telemetry showing flood breach turbidity spike"""
    return get_sensor_time_series(sensor_id)

@router.get("/advisory/{sensor_id}")
async def get_boil_water_bulletin(sensor_id: str) -> Dict[str, Any]:
    """Generates official municipal emergency boil-water notice"""
    return generate_boil_water_advisory(sensor_id)

@router.get("/community-reports")
async def list_community_reports():
    """Returns crowdsourced citizen tap water contamination reports"""
    return get_community_reports()

@router.post("/community-report")
async def submit_community_report(payload: CommunityWaterReportInput):
    """Submits a crowdsourced citizen report regarding brown/smelly tap water"""
    return record_community_report(
        ward=payload.ward,
        description=payload.description,
        severity=payload.severity,
        reported_by=payload.reported_by
    )

@router.post("/analyze")
async def check_sensor_reading(turbidity_ntu: float, ph_level: float, tds_ppm: float, dissolved_oxygen: float):
    """Real-time anomaly evaluation on simulated or live sensor telemetry"""
    return analyze_water_reading(turbidity_ntu, ph_level, tds_ppm, dissolved_oxygen)
