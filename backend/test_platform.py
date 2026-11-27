import sys
import json
from pathlib import Path

# Ensure backend root is on sys.path
sys.path.insert(0, str(Path(__file__).parent))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_suite():
    print("=" * 70)
    print("  LIFELINE360 // CLIMAGRID END-TO-END AUTOMATED VERIFICATION SUITE")
    print("  Testing AAPDA360 (Floods), JEEVAN (Water), HEATSHIELD (Heat)")
    print("=" * 70)

    total_tests = 0
    passed_tests = 0

    def assert_test(name: str, condition: bool, details: str = ""):
        nonlocal total_tests, passed_tests
        total_tests += 1
        if condition:
            passed_tests += 1
            print(f"  [PASS] {name} {f'({details})' if details else ''}")
        else:
            print(f"  [FAIL] {name} - FAILED! {details}")

    # TEST 1: Healthcheck & Platform Modules
    res = client.get("/")
    assert_test("Platform Discovery & Healthcheck", res.status_code == 200, f"Status: {res.status_code}")
    data = res.json()
    assert_test("Healthcheck Modules List", len(data.get("modules", [])) == 3, f"{len(data.get('modules', []))} modules registered")

    # TEST 2: Vernacular Hindi/English SOS Distress Ingestion
    test_msg = "Solani aqueduct ke paas paani 6ft ho gaya hai, dadi behosh hai aur chhota baby bhi hai chhat par, jaldi aao please!"
    res = client.post("/api/v1/distress/parse", json={"raw_message": test_msg, "source": "Citizen WhatsApp Test"})
    assert_test("Distress Parsing Endpoint", res.status_code == 200)
    incident = res.json()
    assert_test("Landmark Extraction", "Solani" in incident["landmark"], f"Landmark: {incident['landmark']}")
    assert_test("Vulnerability Detection (Infant/Elderly)", len(incident["vulnerabilities"]) >= 2, f"Found: {incident['vulnerabilities']}")
    assert_test("Triage Formula Calculation", incident["triage"]["final_score"] >= 0.70, f"Score: {incident['triage']['final_score']}")
    assert_test("Priority Tier Assignment", "P1" in incident["triage"]["priority_tier"], f"Tier: {incident['triage']['priority_tier']}")

    # TEST 3: Incident Queue Sorting (P1 Floating to Top)
    res = client.get("/api/v1/distress/queue")
    assert_test("Incident Queue Retrieval", res.status_code == 200)
    queue = res.json()
    assert_test("Queue Non-Empty", len(queue) > 0, f"{len(queue)} active incidents")
    # Verify descending sort
    scores = [item["triage"]["final_score"] for item in queue]
    assert_test("Queue Sorted by Urgency Score Descending", scores == sorted(scores, reverse=True), f"Top score: {scores[0]}")

    # TEST 4: Human-in-the-Loop Dispatch Approval
    incident_id = incident["id"]
    res = client.post(f"/api/v1/distress/{incident_id}/approve?unit_callsign=NDRF-BOAT-04")
    assert_test("Human Dispatch Approval", res.status_code == 200)
    assert_test("Incident Status Updated to DISPATCHED", res.json()["incident"]["status"] == "DISPATCHED")

    # TEST 5: Incident Status Query (Used by Citizen Mobile Client)
    res = client.get(f"/api/v1/distress/{incident_id}/status")
    assert_test("Citizen Status Polling", res.status_code == 200)
    assert_test("Citizen Sees Assigned Unit", res.json().get("assigned_unit") == "NDRF-BOAT-04")

    # TEST 5.1: WhatsApp Business / Twilio Webhook Ingestion
    wa_payload = {
        "From": "whatsapp:+919876543210",
        "Body": "Brij Bridge ke pas dadi behosh hain aur baby bhi hai car me, pani 5 feet hai jaldi madad bhejo",
        "ProfileName": "Amit Sharma",
        "Latitude": 29.8610,
        "Longitude": 77.8950
    }
    res_wa = client.post("/api/v1/distress/webhook/whatsapp", json=wa_payload)
    assert_test("WhatsApp Webhook Ingestion", res_wa.status_code == 200)
    wa_data = res_wa.json()
    assert_test("WhatsApp Reply Formatted", "NDMA" in wa_data.get("reply_message", ""))
    assert_test("WhatsApp Triage Assigned (P1/P2)", wa_data.get("priority", "") in ["P1 - CRITICAL", "P2 - HIGH"], f"Priority: {wa_data.get('priority')}")

    # TEST 5.2: 2G Basic Phone SMS Webhook
    res_sms = client.post("/api/v1/distress/webhook/sms?From=+919876500000&Body=SOS+Solani+water+rising")
    assert_test("SMS Webhook Ingestion", res_sms.status_code == 200)

    # TEST 6: Dynamic Hazard-Aware Routing (Submerged Bridge Bypass)
    # Origin: Boat in Roorkee Cantt, Destination: Solani Aqueduct
    boat_origin = [29.8550, 77.8860]
    target_dest = [incident["latitude"], incident["longitude"]]
    
    # Safe route with flood avoidance enabled
    res_safe = client.post("/api/v1/routing/calculate", json={
        "origin": boat_origin,
        "destination": target_dest,
        "avoid_flood_zones": True
    })
    assert_test("Dynamic Safe Route Calculation", res_safe.status_code == 200)
    safe_route = res_safe.json()
    assert_test("Safe Route Marked is_safe=True", safe_route["is_safe"] is True)
    assert_test("Avoided Hazards Identified", len(safe_route["avoided_hazards"]) > 0, f"Avoided: {safe_route['avoided_hazards']}")

    # Dangerous route with flood avoidance disabled
    res_danger = client.post("/api/v1/routing/calculate", json={
        "origin": boat_origin,
        "destination": target_dest,
        "avoid_flood_zones": False
    })
    danger_route = res_danger.json()
    assert_test("Direct Dangerous Route Marked is_safe=False", danger_route["is_safe"] is False)

    # TEST 7: Multimodal Computer Vision Waterline Depth Analyzer
    res_vision = client.post("/api/v1/distress/analyze-image", json={
        "sample_id": "sample_roof",
        "landmark_hint": "Solani Basin, Roorkee"
    })
    assert_test("Vision Waterline Analysis Endpoint", res_vision.status_code == 200)
    vision_data = res_vision.json()
    assert_test("Vision Estimated Depth (>6ft)", vision_data["estimated_depth_feet"] >= 6.0, f"{vision_data['estimated_depth_feet']} ft")
    assert_test("Vision Structural Threat Assessment", vision_data["structural_hazard_level"] == "CRITICAL_COLLAPSE_RISK")

    # TEST 8: JEEVAN Water Sensor Telemetry & Anomaly Analysis
    res_sensors = client.get("/api/v1/water/sensors")
    assert_test("JEEVAN Sensor Nodes Retrieval", res_sensors.status_code == 200)
    sensors = res_sensors.json()
    assert_test("Sensor Nodes Count >= 4", len(sensors) >= 4)
    
    # Test Solani Contaminated Sensor History (12-hour timeline)
    res_hist = client.get("/api/v1/water/history/WS-SOLANI-01")
    assert_test("Water Sensor 12-Hour History Timeline", res_hist.status_code == 200)
    hist_data = res_hist.json()
    assert_test("Timeline Data Points >= 8", len(hist_data.get("timeline", [])) >= 8)
    assert_test("Flood Breach Detection Identified", hist_data.get("flood_breach_detected_at") == "-4h")

    # Test Municipal Boil-Water Advisory Generator
    res_adv = client.get("/api/v1/water/advisory/WS-SOLANI-01")
    assert_test("Boil-Water Advisory Notice Generator", res_adv.status_code == 200)
    adv_data = res_adv.json()
    assert_test("Advisory Bulletin ID Generated", "BWA-ROORKEE" in adv_data["advisory_id"])
    assert_test("Emergency Tanker Locations Provided", len(adv_data.get("emergency_tanker_points", [])) >= 2)

    # TEST 9: Crowdsourced Community Water Reporting
    res_rep = client.post("/api/v1/water/community-report", json={
        "ward": "Sector 4 / Solani Basin",
        "description": "Severe brown muddy water from kitchen tap with strong chemical odor.",
        "severity": "CRITICAL"
    })
    assert_test("Community Water Report Submission", res_rep.status_code == 200)

    # TEST 10: HEATSHIELD Dynamic Heatwave Simulation
    res_sim = client.post("/api/v1/heat/simulate", json={"ambient_temp_celsius": 44.0})
    assert_test("HEATSHIELD Heatwave Simulation", res_sim.status_code == 200)
    sim_data = res_sim.json()
    assert_test("Cooling Shelters Scaled to 5", sim_data["cooling_shelters_required"] == 5, f"Required: {sim_data['cooling_shelters_required']}")
    assert_test("Severe Heat Alert Triggered", "SEVERE HEATWAVE" in sim_data["heat_alert_level"])

    # Test Urban Tree Canopy ROI Matrix
    res_int = client.get("/api/v1/heat/interventions")
    assert_test("Tree Canopy & Shading ROI Matrix", res_int.status_code == 200)
    assert_test("Interventions Available >= 3", len(res_int.json()) >= 3)

    # TEST 11: IoT River Gauges & Real-Time Telemetry Stream
    res_snap = client.get("/api/v1/telemetry/snapshot")
    assert_test("IoT Telemetry Snapshot Endpoint", res_snap.status_code == 200)
    snap_data = res_snap.json()
    assert_test("River Gauges Count >= 2", len(snap_data.get("gauges", [])) >= 2)
    assert_test("Solani River Gauge Present", any(g["name"] == "Solani River Aqueduct" for g in snap_data.get("gauges", [])))
    assert_test("Water Quality Anomaly Stream Active", snap_data.get("water_quality", {}).get("turbidity_ntu", 0) > 0)

    # Test Anomaly Injection
    res_inj = client.post("/api/v1/telemetry/inject", json={
        "station_id": "solani_aqueduct",
        "parameter": "water_level_m",
        "value": 6.85,
        "reason": "Test Inundation Pulse"
    })
    assert_test("Live Sensor Anomaly Injection", res_inj.status_code == 200 and res_inj.json().get("status") == "INJECTED")

    # TEST 12: 6-Hour Predictive Inundation Timeline & Early Warning
    res_pred = client.get("/api/v1/flood/predictive-timeline")
    assert_test("Predictive Flood Timeline Endpoint", res_pred.status_code == 200)
    pred_data = res_pred.json()
    assert_test("Predictive Timeline Steps Count == 4", len(pred_data.get("steps", [])) == 4)
    steps = pred_data.get("steps", [])
    assert_test("First Step is T=0 (Current)", steps[0]["time_offset_hours"] == 0)
    assert_test("Peak Crest Step T=+4h Detected", any(s["time_offset_hours"] == 4 for s in steps))
    t2_step = next(s for s in steps if s["time_offset_hours"] == 2)
    assert_test("T=+2h Early Warning Action Present", "PREEMPTIVE EVACUATION" in t2_step.get("recommended_action", ""))
    assert_test("Dynamic GeoJSON Polygons Generated", len(t2_step.get("geojson", {}).get("features", [])) > 0)

    # Test Custom Meteorological Inundation Simulation
    res_sim = client.post("/api/v1/flood/simulate", json={"rain_rate_mm_hr": 45.0, "upstream_discharge_cusecs": 30000.0})
    assert_test("Custom Flood Simulation API", res_sim.status_code == 200 and len(res_sim.json().get("steps", [])) == 4)

    # TEST 13: Smart Relief Shelter Logistics & Bed Allocation Engine
    res_sh = client.get("/api/v1/shelters/list")
    assert_test("Relief Shelters List Endpoint", res_sh.status_code == 200)
    shelters = res_sh.json()
    assert_test("Relief Shelters Count >= 4", len(shelters) >= 4)
    assert_test("RIT Roorkee Safe Campus Present", any("RIT Roorkee" in s["name"] for s in shelters))

    # Test Medical-Matching Shelter Allocation (Infant + Medical Needs -> RIT Safe Campus)
    alloc_req = {
        "incident_id": "SOS-TEST-ALLOC-01",
        "incident_latitude": 29.8650,
        "incident_longitude": 77.8990,
        "headcount": 4,
        "vulnerabilities": ["infant", "acute_medical_distress"]
    }
    res_alloc = client.post("/api/v1/shelters/allocate", json=alloc_req)
    assert_test("Smart Shelter Allocation Endpoint", res_alloc.status_code == 200)
    alloc_data = res_alloc.json()
    assert_test("Shelter Allocation Status ALLOCATED", alloc_data.get("status") == "ALLOCATED")
    assert_test("Allocated Beds Count == 4", alloc_data.get("allocated_beds") == 4)
    assert_test("Rationale Identifies Medical Care", "critical facilities:" in alloc_data.get("rationale", "") or "Maternity" in alloc_data.get("rationale", ""))

    # Test Supply Drop Inventory Update
    res_drop = client.post("/api/v1/shelters/SHELTER-RIT-01/supply-drop", json={"added_water_liters": 5000, "added_rations": 200})
    assert_test("Relief Supply Drop API", res_drop.status_code == 200 and res_drop.json()["shelter"]["potable_water_liters"] >= 23500)

    # TEST 14: NDMA SACHET / CAP Emergency Broadcast Siren Engine
    res_act = client.get("/api/v1/alerts/active")
    assert_test("Active CAP Alerts Endpoint", res_act.status_code == 200)
    alerts = res_act.json()
    assert_test("Pre-seeded Flash Flood Alert Present", len(alerts) >= 1)
    first_alert = alerts[0]
    assert_test("CAP Alert Has Identifier", first_alert["identifier"].startswith("IN-NDMA-ROORKEE"))
    assert_test("Bilingual Alert Formatted (Hindi & English)", len(first_alert.get("headline_hi", "")) > 10 and len(first_alert.get("headline_en", "")) > 10)
    assert_test("Valid OASIS CAP XML Generated", "<alert" in first_alert.get("cap_xml", "") and "</alert>" in first_alert.get("cap_xml", ""))

    # Test Transmit New Siren Alert
    new_alert_payload = {
        "event": "Cloudburst & Rapid River Rise",
        "severity": "Extreme",
        "headline_en": "🚨 URGENT SIREN: Solani breach imminent in Ramnagar Ward 4.",
        "headline_hi": "🚨 आपातकालीन सायरन: रामनगर वार्ड 4 में सोलानी नदी तटबंध टूटने का खतरा।",
        "description_en": "Immediate evacuation ordered. Use elevated highway corridor.",
        "description_hi": "तत्काल सुरक्षित स्थान पर जाएं। राष्ट्रीय राजमार्ग का प्रयोग करें।",
        "area_description": "Ramnagar Sector 4 Flood Plain"
    }
    res_bc = client.post("/api/v1/alerts/broadcast", json=new_alert_payload)
    assert_test("Broadcast CAP Siren API", res_bc.status_code == 200)
    bc_data = res_bc.json()
    assert_test("Cell Towers Targeted >= 40", bc_data.get("cell_towers_targeted", 0) >= 40)
    assert_test("Estimated Recipients >= 50,000", bc_data.get("estimated_recipients", 0) >= 50000)

    # Test Raw XML Endpoint
    res_xml = client.get(f"/api/v1/alerts/{bc_data['identifier']}/xml")
    assert_test("OASIS CAP XML Document Endpoint", res_xml.status_code == 200 and "application/xml" in res_xml.headers.get("content-type", ""))

    # TEST 15: Post-Disaster Drone Damage & SDRF Relief Loss Calculator
    res_dmg = client.get("/api/v1/damage/assessment")
    assert_test("Damage Assessment API Endpoint", res_dmg.status_code == 200)
    dmg_data = res_dmg.json()
    assert_test("Sectors Surveyed Count == 4", len(dmg_data.get("sectors", [])) == 4)
    assert_test("Total Economic Loss >= 5.0 Crores", dmg_data.get("summary_metrics", {}).get("total_economic_loss_cr", 0) >= 5.0)
    assert_test("SDRF Grant Claim Generated", dmg_data.get("summary_metrics", {}).get("total_sdrf_grant_claim_inr", 0) > 0)
    assert_test("Ex-Gratia Relief Computed", dmg_data.get("sdrf_grant_breakdown", {}).get("ex_gratia_family_relief_inr", 0) > 0)

    # Test Recalculate API
    res_recalc = client.post("/api/v1/damage/recalculate", json={"flooded_hectares": 520.0, "affected_families": 1800})
    assert_test("Recalculate Damage API", res_recalc.status_code == 200 and res_recalc.json()["summary_metrics"]["total_affected_families"] == 1800)

    # Test Export Dossier Text Memorandum
    res_dos = client.get("/api/v1/damage/export-dossier")
    assert_test("Export SDRF Grant Memorandum Dossier", res_dos.status_code == 200 and "GOVERNMENT OF UTTARAKHAND" in res_dos.text)

    # SUMMARY
    print("=" * 70)
    print(f"  TOTAL TESTS RUN : {total_tests}")
    print(f"  TOTAL PASSED    : {passed_tests}")
    print(f"  TOTAL FAILED    : {total_tests - passed_tests}")
    print(f"  SUCCESS RATE    : {(passed_tests / total_tests) * 100:.1f}%")
    print("=" * 70)

    if passed_tests == total_tests:
        print("  >>> ALL SYSTEMS 100% OPERATIONAL. READY FOR HACKATHON STAGE! <<<")
        return 0
    else:
        print("  >>> SYSTEM ANOMALIES DETECTED! <<<")
        return 1

if __name__ == "__main__":
    code = run_suite()
    sys.exit(code)
