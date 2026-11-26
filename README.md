# Lifeline360 // ClimaGrid Command Center
### One City, Three Climate Threats: Floods, Unsafe Water & Dangerous Heat
**Overclock '26 Hackathon (36-Hour Sprint) — RIT Roorkee**

Lifeline360 is an emergency operations and geospatial climate-risk command center that unifies three previously fragmented disaster domains into a single tactical picture:
1. **DURING (60% Effort - AAPDA360):** AI-powered flood distress ingestion, sub-second multimodal NLP entity extraction, transparent mathematical triage scoring ($P_1$ to $P_4$), and dynamic hazard-aware routing avoiding submerged bridges.
2. **AFTER (20% Effort - JEEVAN):** IoT water intelligence detecting post-flood sewage/silt contamination anomalies (Turbidity, pH, TDS, DO) and automated boil-water advisories.
3. **BEFORE (10% Effort - HEATSHIELD):** Urban heat island vulnerability mapping using satellite Land Surface Temperature (LST) and vegetation canopy deficits to locate cooling centers and priority tree plantation zones.

---

## Architecture Overview

```
                                 LIFELINE360
                        Unified Command Center (EOC)
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
   AAPDA360 (DURING)          JEEVAN (AFTER)        HEATSHIELD (BEFORE)
  Flood Triage & Safe Route  Water Contamination       Urban Heat Zones
  • <1.2s Bedrock/NLP        • Turbidity Anomaly       • LST Satellite Hotspots
  • Explainable Triage P1-P4 • Secondary Silt Alert    • Cooling Centers
  • Submerged Bridge Bypass  • Boil Water Notices      • Tree Canopy Targets
```

---

## Project Structure

```
ClimaGrid-overclock26/
├── backend/                        # FastAPI Python 3.14 Backend
│   ├── app/
│   │   ├── main.py                 # FastAPI Application with CORS & Routers
│   │   ├── config.py               # Weights & Settings
│   │   ├── api/
│   │   │   ├── distress.py         # SOS ingestion, priority queue & dispatch
│   │   │   ├── routing.py          # Safe corridor & flood GeoJSON polygons
│   │   │   ├── water_safety.py     # JEEVAN water quality endpoints
│   │   │   ├── heat_shield.py      # HEATSHIELD thermal zones & cooling points
│   │   │   └── fleet.py            # Boat fleet GPS & shelter readiness
│   │   ├── services/
│   │   │   ├── ai_extractor.py     # Bedrock LLM + Indic Vernacular NLP
│   │   │   ├── triage_engine.py    # Auditable AAPDA Triage Formula
│   │   │   ├── routing_service.py  # Submerged bridge avoidance engine
│   │   │   └── water_analyzer.py   # Multi-parameter water anomaly engine
│   │   └── data/
│   │       ├── roorkee_haridwar_geo.json  # Flood inundation polygons & hazards
│   │       ├── water_sensors.json         # HydraSense IoT sensor stream
│   │       ├── heat_zones_geo.json        # LST satellite heat island data
│   │       └── sample_sos_messages.json   # 5 Preset Hinglish pitch scenarios
│   ├── requirements.txt            # Python dependencies
│   └── .env.example                # AWS Bedrock / Environment settings
│
├── frontend/                       # Next.js 14 + Tailwind + MapLibre/Leaflet
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # 3-Zone Tactical Command Center
│   │   │   ├── layout.tsx
│   │   │   └── globals.css         # Dark Navy EOC Theme (#0B132B)
│   │   ├── components/
│   │   │   ├── HeaderHUD.tsx       # Live status, rainfall & module switchers
│   │   │   ├── TacticalMap.tsx     # Geospatial canvas with dynamic layers
│   │   │   ├── DistressStream.tsx  # P1-P4 ranked queue with explainability
│   │   │   ├── QuickDistressSimulator.tsx # 1-Click live Bedrock extractor
│   │   │   └── TacticalSideHUD.tsx # Route distance, fleet GPS & water/heat tabs
│   │   ├── lib/api.ts              # API service client
│   │   └── types/index.ts          # Shared TypeScript models
│
├── run_backend.bat                 # 1-Click backend starter
├── run_frontend.bat                # 1-Click frontend starter
└── README.md
```

---

## Quickstart: How to Run

### 1. Start Backend (Terminal 1)
Double click `run_backend.bat` or run:
```powershell
cd backend
.\venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --app-dir .
```
API Documentation will be live at: `http://localhost:8000/docs`

### 2. Start Frontend (Terminal 2)
Double click `run_frontend.bat` or run:
```powershell
cd frontend
npm run dev
```
Dashboard will be live at: `http://localhost:3000`

---

## 3-Minute Live Hackathon Demo Script

1. **The Hook (0:00 – 0:45):**  
   Introduce the dark tactical EOC map of Roorkee / Haridwar Ganga Basin. Point out the flood inundation polygons and explain that in disasters, the biggest bottleneck is **triage paralysis** across siloed tools.
2. **The Live AI Extraction (0:45 – 1:30):**  
   Click **"Scenario A"** in the bottom panel (`"Solani aqueduct ke paas paani 6ft ho gaya hai, dadi behosh hai aur chhota baby bhi hai..."`). Hit **Process SOS**. Watch Bedrock parse this messy vernacular message in $<1.2$s, extract headcount, detect infant and unconscious elderly vulnerabilities, score it with the mathematical triage formula, and immediately top the queue as **P1 - CRITICAL**.
3. **Hazard-Aware Safe Navigation (1:30 – 2:15):**  
   Click **Route Preview**. The map renders an electric cyan corridor from the NDRF rescue boat avoiding the submerged Brij Bridge. Toggle the mode to show how a blind route would have stranded the boat in 5.5ft floodwaters. Click **Approve Fleet** to demonstrate the ethical Human-in-the-Loop decision protocol.
4. **Post-Flood Water Anomaly (2:15 – 2:45):**  
   Switch to the **Water Safety (JEEVAN)** tab. Highlight the red-flagged sensor near the Solani breach where turbidity jumped to 46.8 NTU. Show the automated boil-water advisory issued before waterborne disease spreads.
5. **Urban Resilience & Close (2:45 – 3:00):**  
   Toggle the **Heat Resilience (HEATSHIELD)** tab. Show how this platform protects the same vulnerable neighborhoods across the whole climate cycle: before, during, and after.
