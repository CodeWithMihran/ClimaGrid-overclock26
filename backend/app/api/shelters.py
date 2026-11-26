from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.shelter_service import shelter_service

router = APIRouter(prefix="/shelters", tags=["Relief Shelters & Camp Logistics"])

class ShelterAllocationRequest(BaseModel):
    incident_id: str
    incident_latitude: float
    incident_longitude: float
    headcount: int = 1
    vulnerabilities: List[str] = []

class SupplyDropRequest(BaseModel):
    added_water_liters: Optional[int] = 0
    added_rations: Optional[int] = 0
    added_beds: Optional[int] = 0

@router.get("/list")
async def list_active_shelters():
    """
    Returns all designated evacuation centers in the Roorkee/Haridwar Basin
    with live bed occupancy, medical capabilities, and relief inventory.
    """
    return shelter_service.list_shelters()

@router.post("/allocate")
async def allocate_shelter_for_victims(req: ShelterAllocationRequest):
    """
    Intelligently assigns rescued families to the closest shelter with matching
    medical capabilities (pediatric, maternity, oxygen) and available capacity.
    """
    return shelter_service.allocate_shelter_for_incident(
        incident_id=req.incident_id,
        incident_lat=req.incident_latitude,
        incident_lon=req.incident_longitude,
        headcount=req.headcount,
        vulnerabilities=req.vulnerabilities
    )

@router.post("/{shelter_id}/supply-drop")
async def log_supply_drop(shelter_id: str, drop: SupplyDropRequest):
    """
    Logs arrival of emergency potable water tankers, food ration kits, or folding cots.
    """
    res = shelter_service.update_inventory(
        shelter_id=shelter_id,
        added_water_liters=drop.added_water_liters or 0,
        added_rations=drop.added_rations or 0,
        added_beds=drop.added_beds or 0
    )
    if res.get("status") == "NOT_FOUND":
        raise HTTPException(status_code=404, detail="Shelter not found")
    return res
