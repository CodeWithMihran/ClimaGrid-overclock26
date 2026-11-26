from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.distress import router as distress_router
from app.api.routing import router as routing_router
from app.api.water_safety import router as water_router
from app.api.heat_shield import router as heat_router
from app.api.fleet import router as fleet_router
from app.api.telemetry import router as telemetry_router
from app.api.predictive_flood import router as flood_router
from app.api.shelters import router as shelter_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Unified Climate-Risk & Emergency Operations Platform (Overclock '26, RIT Roorkee)"
)

# Enable CORS for local Next.js dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api/v1
app.include_router(distress_router, prefix=settings.API_V1_PREFIX)
app.include_router(routing_router, prefix=settings.API_V1_PREFIX)
app.include_router(water_router, prefix=settings.API_V1_PREFIX)
app.include_router(heat_router, prefix=settings.API_V1_PREFIX)
app.include_router(fleet_router, prefix=settings.API_V1_PREFIX)
app.include_router(telemetry_router, prefix=settings.API_V1_PREFIX)
app.include_router(flood_router, prefix=settings.API_V1_PREFIX)
app.include_router(shelter_router, prefix=settings.API_V1_PREFIX)

@app.get("/")
async def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "region": "Roorkee / Haridwar Ganga Basin",
        "modules": [
            "Flood Emergency & Multimodal Bedrock Triage (AAPDA360)",
            "AI Water Intelligence & Anomaly Mapping (JEEVAN)",
            "Urban Heat Island & Microclimate Shield (HEATSHIELD)"
        ],
        "docs_url": "/docs"
    }
