from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.predictive_flood import predictive_flood_service

router = APIRouter(prefix="/flood", tags=["Predictive Flood Inundation & Early Warning"])

class InundationSimulationRequest(BaseModel):
    rain_rate_mm_hr: Optional[float] = 35.0
    upstream_discharge_cusecs: Optional[float] = 24500.0

@router.get("/predictive-timeline")
async def get_predictive_flood_timeline():
    """
    Returns 6-hour advance predictive flood timeline (T=0, T=+2h, T=+4h, T=+6h)
    modeling upstream Haridwar discharge and rainfall accumulation across Roorkee.
    """
    return predictive_flood_service.generate_timeline()

@router.post("/simulate")
async def simulate_custom_inundation(req: InundationSimulationRequest):
    """
    Dynamically recalculates flood crest and polygon expansion given custom weather inputs.
    """
    return predictive_flood_service.generate_timeline(
        rain_rate_mm_hr=req.rain_rate_mm_hr or 35.0,
        upstream_discharge_cusecs=req.upstream_discharge_cusecs or 24500.0
    )
