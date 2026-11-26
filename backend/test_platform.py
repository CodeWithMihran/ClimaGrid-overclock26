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
