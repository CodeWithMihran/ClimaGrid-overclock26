import json
from pathlib import Path
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from app.models.schemas import DistressMessageInput, IncidentRecord, ImageAnalysisRequest, ImageAnalysisResponse
from app.services.ai_extractor import parse_distress_message
from app.services.vision_analyzer import analyze_flood_image, SAMPLE_FLOOD_PRESETS

router = APIRouter(prefix="/distress", tags=["Flood Emergency Distress & Triage"])

DATA_DIR = Path(__file__).parent.parent / "data"
SAMPLES_PATH = DATA_DIR / "sample_sos_messages.json"

# In-memory tactical queue for ultra-fast hackathon operations
INCIDENT_STORE: Dict[str, IncidentRecord] = {}

@router.on_event("startup")
async def seed_initial_incidents():
    """Seeds initial incidents so dashboard isn't empty on load"""
    initial_reports = [
        "Civil Lines near shiv mandir 4 log hain, ek pregnant aurat hai jinki delivery hone wali hai, boat dispatch karo.",
        "Ramnagar brij bridge ke paas 6 log chhat par surakshit hain, pani 3ft hai road par, dry food and water kit chahiye.",
        "Nehru nagar road par 1 foot waterlogging hai, gari nikalne me dikkat ho rahi hai."
    ]
    for msg in initial_reports:
        record = await parse_distress_message(msg, source="Pre-seeded Field Report")
        INCIDENT_STORE[record.id] = record

@router.post("/parse", response_model=IncidentRecord)
async def ingest_distress_message(payload: DistressMessageInput):
    """
    Sub-second multimodal NLP parsing + AAPDA360 Explainable Triage Scoring.
    Extracts headcount, landmark, water depth, vulnerability, and calculates P1-P4 priority.
    """
    record = await parse_distress_message(payload.raw_message, source=payload.source)
    INCIDENT_STORE[record.id] = record
    return record

@router.get("/queue", response_model=List[IncidentRecord])
async def get_incident_queue():
    """
    Returns live incident queue ordered by explainable Triage Score descending.
    P1 CRITICAL cases always float to the top.
    """
    records = list(INCIDENT_STORE.values())
    records.sort(key=lambda x: x.triage.final_score, reverse=True)
    return records

@router.post("/{incident_id}/approve")
async def approve_and_dispatch(incident_id: str, unit_callsign: str = "NDRF-BOAT-04"):
    """
    Human-in-the-Loop Protocol: Authorized dispatcher approves rescue team deployment.
    """
    if incident_id not in INCIDENT_STORE:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    incident = INCIDENT_STORE[incident_id]
    incident.status = "DISPATCHED"
    incident.assigned_unit = unit_callsign
    return {
        "status": "SUCCESS",
        "message": f"Rescue craft {unit_callsign} dispatched to {incident.landmark}.",
        "incident": incident
    }

@router.get("/{incident_id}/status", response_model=IncidentRecord)
async def get_incident_status(incident_id: str):
    """Returns live dispatch status of a citizen SOS request"""
    if incident_id not in INCIDENT_STORE:
        raise HTTPException(status_code=404, detail="Incident not found")
    return INCIDENT_STORE[incident_id]

@router.get("/samples")
async def get_sample_distress_messages():
    """Returns preset realistic test messages for instant 1-click evaluation"""
    if SAMPLES_PATH.exists():
        with open(SAMPLES_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

@router.post("/analyze-image", response_model=ImageAnalysisResponse)
async def analyze_disaster_photo(req: ImageAnalysisRequest):
    """
    Multimodal Vision AI Waterline Depth Analyzer.
    Extracts water depth in feet, detected submerged objects, and structural threat level.
    """
    return await analyze_flood_image(
        sample_id=req.sample_id,
        image_base64=req.image_base64,
        landmark_hint=req.landmark_hint or "Solani Basin, Roorkee"
    )

@router.get("/image-presets")
async def get_flood_image_presets():
    """Returns preset disaster photos with reference depths for the hackathon demo"""
    return [
        {
            "id": "sample_roof",
            "title": "House Submerged to Roof Level",
            "waterline": "Roof / Ceiling Breach (>6.8ft)",
            "thumbnail_label": "🏠 Critical Roof Flood",
            "depth_feet": 6.8,
            "badge": "P1 CRITICAL"
        },
        {
            "id": "sample_car",
            "title": "Submerged Passenger Vehicle",
            "waterline": "Window Mid-Level (4.5ft)",
            "thumbnail_label": "🚗 Submerged Car",
            "depth_feet": 4.5,
            "badge": "P2 HIGH"
        },
        {
            "id": "sample_knee",
            "title": "Street Waterlogging & Drainage Ingress",
            "waterline": "Ankle / Knee Deep (1.8ft)",
            "thumbnail_label": "🚶 Street Inundation",
            "depth_feet": 1.8,
            "badge": "P3 MODERATE"
        }
    ]

