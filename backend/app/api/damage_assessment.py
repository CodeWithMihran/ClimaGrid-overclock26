from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import Optional
from app.services.damage_assessment import damage_service

router = APIRouter(prefix="/damage", tags=["Post-Disaster Drone Damage & SDRF Relief Loss"])

class RecalculateDamageRequest(BaseModel):
    flooded_hectares: Optional[float] = 470.0
    affected_families: Optional[int] = 1480
    road_washout_km: Optional[float] = 7.8

@router.get("/assessment")
async def get_damage_assessment():
    """
    Returns automated post-disaster damage quantification across Roorkee sectors
    and official SDRF (State Disaster Response Fund) compensation claim values.
    """
    return damage_service.calculate_assessment()

@router.post("/recalculate")
async def recalculate_damage(req: RecalculateDamageRequest):
    """
    Recalculates financial losses and grant claims based on updated aerial survey inputs.
    """
    return damage_service.calculate_assessment(
        flooded_hectares=req.flooded_hectares or 470.0,
        affected_families=req.affected_families or 1480,
        road_washout_km=req.road_washout_km or 7.8
    )

@router.get("/export-dossier")
async def export_damage_dossier():
    """
    Exports official State Disaster Response Fund grant claim memorandum.
    """
    assessment = damage_service.calculate_assessment()
    return Response(content=assessment["dossier_text"], media_type="text/plain; charset=utf-8")
