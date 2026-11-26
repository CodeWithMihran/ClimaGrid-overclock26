"""
=============================================================================
  LIFELINE360 // IoT TELEMETRY & LIVE ANOMALY INJECTION TOOL
  Overclock '26 Hackathon (RIT Roorkee)
=============================================================================
Use this script during live jury evaluation to inject sudden real-time
distress events and demonstrate the EOC's instant autonomous response!
"""

import sys
import time
import urllib.request
import json

BACKEND_URL = "http://localhost:8000/api/v1"

def print_banner():
    print("=" * 72)
    print("   LIFELINE360 // LIVE IOT SENSOR & ANOMALY INJECTOR")
    print("   Roorkee - Solani - Haridwar Ganga Multi-Hazard Operations")
    print("=" * 72)

def fetch_snapshot():
    try:
        req = urllib.request.Request(f"{BACKEND_URL}/telemetry/snapshot")
        with urllib.request.urlopen(req, timeout=3) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"[!] Could not connect to backend at {BACKEND_URL}: {e}")
        return None

def inject_anomaly(station_id, parameter, value, reason):
    payload = json.dumps({
        "station_id": station_id,
        "parameter": parameter,
        "value": value,
        "reason": reason
    }).encode("utf-8")

    try:
        req = urllib.request.Request(
            f"{BACKEND_URL}/telemetry/inject",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=3) as response:
            res = json.loads(response.read().decode())
            print(f"[✓] SUCCESS: {res.get('message')}")
            return True
    except Exception as e:
        print(f"[!] Injection failed: {e}")
        return False

def show_menu():
    print("\nSelect an emergency event to inject into the live EOC dashboard:")
    print("  [1] INJECT FLASH FLOOD SURGE at Solani River Aqueduct (6.95m - CRITICAL)")
    print("  [2] INJECT TOXIC TURBIDITY SPIKE at Purqazi Water Intake (68.4 NTU)")
    print("  [3] INJECT SEVERE HEATWAVE at Civil Lines Station (47.5°C Ambient)")
    print("  [4] RESET ALL SENSORS to Standard Operational Baseline")
    print("  [5] LIVE SENSOR TELEMETRY MONITOR (Real-time stream)")
    print("  [0] Exit")
    print("-" * 72)

def main():
    print_banner()
    snap = fetch_snapshot()
    if snap:
        print(f"[✓] Connected to Lifeline360 EOC at {BACKEND_URL}")
        print(f"    Basin: {snap.get('basin')}")
    else:
        print("[!] Backend is currently offline. Start it with: .\\run_backend.bat")

    while True:
        show_menu()
        choice = input("Enter choice [0-5]: ").strip()

        if choice == "1":
            print("\n>>> INJECTING FLASH FLOOD SURGE AT SOLANI AQUEDUCT...")
            inject_anomaly("solani_aqueduct", "water_level_m", 6.95, "Flash Flood Embankment Inundation")
        elif choice == "2":
            print("\n>>> INJECTING CASCADING TURBIDITY CONTAMINATION...")
            inject_anomaly("purqazi_intake", "turbidity_ntu", 68.4, "Post-Flood Silt Inundation & Sewage Breach")
        elif choice == "3":
            print("\n>>> INJECTING URBAN HEAT DOME SURGE...")
            inject_anomaly("civil_lines_weather", "temperature_c", 47.5, "LST Extreme Microclimate Anomaly")
        elif choice == "4":
            print("\n>>> RESETTING ALL SENSORS TO NOMINAL...")
            inject_anomaly("solani_aqueduct", "water_level_m", 5.42, "Normal Monsoonal Discharge")
            inject_anomaly("purqazi_intake", "turbidity_ntu", 46.8, "Monitored Municipal Breach")
            inject_anomaly("civil_lines_weather", "temperature_c", 39.2, "Typical Ambient Range")
        elif choice == "5":
            print("\n>>> STREAMING LIVE TELEMETRY (Press Ctrl+C to stop)...")
            try:
                while True:
                    data = fetch_snapshot()
                    if data:
                        solani = data["gauges"][0]["water_level_m"]
                        turbidity = data["water_quality"]["turbidity_ntu"]
                        temp = data["meteorological"]["temperature_c"]
                        sla = data["system_health"]["bedrock_nlp_latency_ms"]
                        print(f"\r[LIVE] Solani: {solani}m | Turbidity: {turbidity} NTU | Temp: {temp}°C | Bedrock SLA: {sla}ms  ", end="", flush=True)
                    time.sleep(2)
            except KeyboardInterrupt:
                print("\nStopped telemetry monitor.")
        elif choice == "0":
            print("\nExiting. Good luck at Overclock '26!")
            break
        else:
            print("Invalid selection.")

if __name__ == "__main__":
    main()
