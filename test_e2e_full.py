import asyncio
import httpx
import sys

async def run_e2e_suite():
    async with httpx.AsyncClient(timeout=10.0) as client:
        print("=== 1. Testing Next.js Frontend Routes ===")
        routes = ['/', '/flood', '/shelters', '/siren', '/damage', '/water', '/heat', '/citizen', '/architecture']
        for r in routes:
            res = await client.get(f"http://localhost:3000{r}")
            assert res.status_code == 200, f"Route {r} failed with {res.status_code}"
            print(f"  [PASS] http://localhost:3000{r} -> HTTP {res.status_code}")

        print("\n=== 2. Testing Multilingual Distress Triage (AAPDA360) ===")
        sos_payload = {
            "raw_message": "Solani aqueduct ke paas paani 7ft ho gaya hai, dadi behosh hai aur chhota baby bhi hai chhat par, jaldi aao please!",
            "source": "Citizen WhatsApp"
        }
        res = await client.post("http://localhost:8000/api/v1/distress/parse", json=sos_payload)
        assert res.status_code == 200
        incident = res.json()
        print(f"  [PASS] Parsed SOS ID: {incident['id']} | Tier: {incident['triage']['priority_tier']} | Score: {incident['triage']['final_score']}")

        print("\n=== 3. Testing Dynamic Hazard Routing & Brij Bridge Bypass ===")
        route_payload = {
            "origin": [29.8550, 77.8860],
            "destination": [incident['latitude'], incident['longitude']],
            "avoid_flood_zones": True
        }
        res = await client.post("http://localhost:8000/api/v1/routing/calculate", json=route_payload)
        assert res.status_code == 200
        route = res.json()
        assert route['is_safe'] == True
        print(f"  [PASS] Safe Corridor Plotted: {route['distance_km']} km | ETA: {route['duration_minutes']}m | Avoided: {route['avoided_hazards']}")

        print("\n=== 4. Testing Human-in-the-Loop Fleet Dispatch ===")
        res = await client.post(f"http://localhost:8000/api/v1/distress/{incident['id']}/approve?unit_callsign=NDRF-BOAT-04")
        assert res.status_code == 200
        print(f"  [PASS] Fleet Deployment: {res.json()['message']}")

        print("\n=== 5. Testing Hydrodynamic Flood Simulation (Saint-Venant Mesh) ===")
        flood_payload = {"rain_rate_mm_hr": 55.0, "upstream_discharge_cusecs": 36000.0}
        res = await client.post("http://localhost:8000/api/v1/flood/simulate", json=flood_payload)
        assert res.status_code == 200
        timeline = res.json()
        peak_step = timeline["steps"][-1]
        print(f"  [PASS] Simulated 6-Hour Inundation: Peak Stage {peak_step['solani_stage_meters']}m | Area: {peak_step['flooded_area_hectares']} Ha")

        print("\n=== 6. Testing Relief Camp Allocation & Emergency Supply Drop ===")
        alloc_payload = {
            "incident_id": incident['id'],
            "incident_latitude": incident['latitude'],
            "incident_longitude": incident['longitude'],
            "headcount": incident['trapped_count'],
            "vulnerabilities": incident['vulnerabilities']
        }
        res = await client.post("http://localhost:8000/api/v1/shelters/allocate", json=alloc_payload)
        assert res.status_code == 200
        shelter_match = res.json()
        rec_shelter = shelter_match['recommended_shelter']
        print(f"  [PASS] Optimal Shelter Matched: {rec_shelter['name']} (Status: {shelter_match['status']})")

        drop_payload = {"added_water_liters": 2500, "added_rations": 200, "added_beds": 50}
        shelter_id = rec_shelter['id']
        res = await client.post(f"http://localhost:8000/api/v1/shelters/{shelter_id}/supply-drop", json=drop_payload)
        assert res.status_code == 200
        print(f"  [PASS] Emergency Supply Drop: Logged into Distributed Inventory for {shelter_id}")

        print("\n=== 7. Testing OASIS CAP 1.2 Cell Broadcast Siren Engine ===")
        res = await client.get("http://localhost:8000/api/v1/alerts/template")
        assert res.status_code == 200
        templates = res.json()
        print(f"  [PASS] CAP Emergency Alert Templates Available: {len(templates)} bilingual presets (EN + HI)")

        print("\n=== 8. Testing Autonomous Drone Damage Recalculation ===")
        recalc_payload = {"flooded_hectares": 620.0, "affected_families": 1850, "road_washout_km": 14.5}
        res = await client.post("http://localhost:8000/api/v1/damage/recalculate", json=recalc_payload)
        assert res.status_code == 200
        damage = res.json()
        metrics = damage['summary_metrics']
        print(f"  [PASS] Economic Loss: ₹{metrics['total_economic_loss_cr']} Cr | SDRF State Claim: ₹{metrics['total_sdrf_grant_claim_cr']} Cr")

        print("\n=== 9. Testing JEEVAN Optical Water Sensor Mesh ===")
        res = await client.get("http://localhost:8000/api/v1/water/sensors")
        assert res.status_code == 200
        sensors = res.json()
        print(f"  [PASS] Active IoT Water Nodes: {len(sensors)} telemetry stations reporting")

        print("\n=== 10. Testing HEATSHIELD Urban Heat Island Simulator ===")
        heat_payload = {"ambient_temp_celsius": 46.0}
        res = await client.post("http://localhost:8000/api/v1/heat/simulate", json=heat_payload)
        assert res.status_code == 200
        heat_res = res.json()
        print(f"  [PASS] 46°C Simulation: Scaled to {heat_res['cooling_shelters_required']} Cooling Centers | Alert: {heat_res['heat_alert_level']}")

        print("\n=== 11. Testing AI Vision Waterline Depth Gauge ===")
        vision_payload = {"sample_id": "sample_roof", "landmark_hint": "Solani Basin"}
        res = await client.post("http://localhost:8000/api/v1/distress/analyze-image", json=vision_payload)
        assert res.status_code == 200
        vision = res.json()
        print(f"  [PASS] AI Waterline Detected: {vision['estimated_depth_feet']} ft | Hazard Level: {vision['structural_hazard_level']}")

        print("\n" + "="*60)
        print(" ALL 11 END-TO-END INTEGRATION TEST SUITES PASSED (100% SUCCESS)")
        print("="*60)

if __name__ == "__main__":
    asyncio.run(run_e2e_suite())
