import asyncio
import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from app.services.iot_telemetry import iot_service

router = APIRouter(prefix="/telemetry", tags=["IoT Telemetry & Sensors"])

class AnomalyInjection(BaseModel):
    station_id: str
    parameter: str # e.g. "turbidity_ntu", "water_level_m"
    value: float
    reason: Optional[str] = "Live Judge Demonstration Surge"

@router.get("/snapshot")
async def get_telemetry_snapshot():
    """Returns instant snapshot of all river gauges, water quality, and microclimate sensors."""
    return iot_service.get_snapshot()

@router.get("/stream")
async def get_telemetry_stream():
    """
    Server-Sent Events (SSE) live feed.
    Pumps real-time telemetry ticks to the EOC dashboard every 2 seconds.
    """
    async def event_generator():
        while True:
            data = iot_service.get_snapshot()
            yield f"data: {json.dumps(data)}\n\n"
            await asyncio.sleep(2.0)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/inject")
async def inject_sensor_anomaly(injection: AnomalyInjection):
    """
    Allows injecting live simulated sensor surges (e.g. flash flood at Solani or chemical spill).
    """
    if injection.station_id in iot_service.stations:
        iot_service.stations[injection.station_id][injection.parameter] = injection.value
        return {
            "status": "INJECTED",
            "station": injection.station_id,
            "parameter": injection.parameter,
            "new_value": injection.value,
            "message": f"Simulated {injection.reason} applied successfully."
        }
    return {
        "status": "NOT_FOUND",
        "message": f"Station {injection.station_id} not registered."
    }
