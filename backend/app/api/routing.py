import json
from pathlib import Path
from typing import Dict, Any
from fastapi import APIRouter
from app.models.schemas import RouteRequest, RouteSegment
from app.services.routing_service import generate_safe_rescue_route

router = APIRouter(prefix="/routing", tags=["AAPDA Dynamic Hazard Routing"])

GEO_DATA_PATH = Path(__file__).parent.parent / "data" / "roorkee_haridwar_geo.json"

@router.post("/calculate", response_model=RouteSegment)
async def calculate_rescue_corridor(req: RouteRequest):
    """
    Calculates dynamic route avoiding submerged bridges and deep water.
    Toggle avoid_flood_zones to see the contrast between blind route vs AI safe route!
    """
    return generate_safe_rescue_route(
        origin=req.origin,
        destination=req.destination,
        avoid_flood_zones=req.avoid_flood_zones
    )

@router.get("/flood-map")
async def get_flood_hazard_geojson() -> Dict[str, Any]:
    """Returns active flood polygons and submerged infrastructure points for Roorkee/Haridwar"""
    with open(GEO_DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)
