"""
CLIMAGRID - Smart Relief Shelter Logistics & Bed Allocation Engine
Manages emergency evacuation camps, live bed occupancy, food rations,
potable water liters, and intelligent medical-matching shelter allocation.
"""

from typing import Dict, Any, List, Optional
import math

class ShelterService:
    def __init__(self):
        self.shelters: Dict[str, Dict[str, Any]] = {
            "SHELTER-RIT-01": {
                "id": "SHELTER-RIT-01",
                "name": "RIT Roorkee Safe Campus Safe Zone",
                "landmark": "RIT Roorkee Campus, Puhana",
                "latitude": 29.8350,
                "longitude": 77.8920,
                "total_capacity_beds": 650,
                "occupied_beds": 420,
                "available_beds": 230,
                "medical_capabilities": ["24/7 Trauma Triage", "Pediatric Care", "Maternity Ward", "Oxygen Concentrators"],
                "has_pediatric": True,
                "has_maternity": True,
                "potable_water_liters": 18500,
                "dry_ration_kits": 1400,
                "power_backup": "Solar Microgrid + 125kVA Genset",
                "status": "OPERATIONAL_ACCEPTING",
                "contact_officer": "Prof. S. Sharma (Camp Commandant)",
                "contact_phone": "+91-98970-11201"
            },
            "SHELTER-STADIUM-02": {
                "id": "SHELTER-STADIUM-02",
                "name": "Roorkee Sports Stadium Mega-Camp",
                "landmark": "Nehru Stadium, Civil Lines",
                "latitude": 29.8690,
                "longitude": 77.8840,
                "total_capacity_beds": 1200,
                "occupied_beds": 980,
                "available_beds": 220,
                "medical_capabilities": ["General First Aid", "Dehydration Treatment", "Mobile Dispensary"],
                "has_pediatric": False,
                "has_maternity": False,
                "potable_water_liters": 32000,
                "dry_ration_kits": 3200,
                "power_backup": "Municipal Dual Genset",
                "status": "HIGH_OCCUPANCY",
                "contact_officer": "R. K. Verma (District Sports Officer)",
                "contact_phone": "+91-98970-11202"
            },
            "SHELTER-CIVIL-03": {
                "id": "SHELTER-CIVIL-03",
                "name": "Civil Lines Community Center & School",
                "landmark": "Near Shiv Mandir, Civil Lines",
                "latitude": 29.8590,
                "longitude": 77.8940,
                "total_capacity_beds": 400,
                "occupied_beds": 380,
                "available_beds": 20,
                "medical_capabilities": ["Maternity Isolation Ward", "Elderly Care", "Cardiac Defibrillator"],
                "has_pediatric": True,
                "has_maternity": True,
                "potable_water_liters": 8200,
                "dry_ration_kits": 650,
                "power_backup": "Dedicated Generator",
                "status": "CRITICAL_CAPACITY",
                "contact_officer": "Dr. Meenakshi Joshi (Chief Medical Officer)",
                "contact_phone": "+91-98970-11203"
            },
            "SHELTER-SOLANI-04": {
                "id": "SHELTER-SOLANI-04",
                "name": "Solani High-Ground Relief Tent City",
                "landmark": "Solani Aqueduct North High Ridge",
                "latitude": 29.8780,
                "longitude": 77.8900,
                "total_capacity_beds": 500,
                "occupied_beds": 190,
                "available_beds": 310,
                "medical_capabilities": ["Rapid First Aid Tents", "Mobile Jeevan Water Filter"],
                "has_pediatric": False,
                "has_maternity": False,
                "potable_water_liters": 15000,
                "dry_ration_kits": 950,
                "power_backup": "Mobile Solar Towers",
                "status": "OPERATIONAL_ACCEPTING",
                "contact_officer": "Inspector Vikram Rawat (SDRF)",
                "contact_phone": "+91-98970-11204"
            }
        }

    def list_shelters(self) -> List[Dict[str, Any]]:
        return list(self.shelters.values())

    def get_shelter(self, shelter_id: str) -> Optional[Dict[str, Any]]:
        return self.shelters.get(shelter_id)

    def allocate_shelter_for_incident(
        self,
        incident_id: str,
        incident_lat: float,
        incident_lon: float,
        headcount: int,
        vulnerabilities: List[str]
    ) -> Dict[str, Any]:
        """
        Intelligently matches displaced victims to the optimal relief shelter:
        1. Filters shelters with available_beds >= headcount
        2. Scores for specialized medical capabilities (maternity/infants)
        3. Minimizes geodesic distance from incident
        """
        needs_pediatric = any(v.lower() in ["infant", "baby", "child"] for v in vulnerabilities)
        needs_maternity = any(v.lower() in ["pregnant", "pregnancy", "maternity"] for v in vulnerabilities)
        needs_acute_medical = any("medical" in v.lower() or "cardiac" in v.lower() or "unconscious" in v.lower() for v in vulnerabilities)

        candidates = []
        for s in self.shelters.values():
            if s["available_beds"] < headcount:
                continue

            # Compute approximate distance in km (Haversine approximation)
            dlat = (s["latitude"] - incident_lat) * 111.0
            dlon = (s["longitude"] - incident_lon) * 111.0 * math.cos(math.radians(incident_lat))
            dist_km = round(math.sqrt(dlat**2 + dlon**2), 2)

            score = 100.0 - (dist_km * 5.0)

            # Bonus points for specialized care
            if needs_pediatric and s["has_pediatric"]:
                score += 40.0
            if needs_maternity and s["has_maternity"]:
                score += 50.0
            if needs_acute_medical and len(s["medical_capabilities"]) >= 3:
                score += 35.0

            candidates.append({
                "shelter": s,
                "distance_km": dist_km,
                "match_score": round(score, 1)
            })

        if not candidates:
            # Fallback if all full: choose max capacity
            best_shelter = max(self.shelters.values(), key=lambda x: x["available_beds"])
            return {
                "status": "OVERFLOW_WARNING",
                "recommended_shelter": best_shelter,
                "distance_km": 3.5,
                "allocated_beds": headcount,
                "rationale": "All designated shelters near critical threshold; auto-routed to largest regional buffer."
            }

        candidates.sort(key=lambda x: x["match_score"], reverse=True)
        chosen = candidates[0]
        shelter_obj = chosen["shelter"]

        # Book beds
        shelter_obj["occupied_beds"] += headcount
        shelter_obj["available_beds"] = max(0, shelter_obj["total_capacity_beds"] - shelter_obj["occupied_beds"])
        if shelter_obj["available_beds"] < 30:
            shelter_obj["status"] = "CRITICAL_CAPACITY"

        return {
            "status": "ALLOCATED",
            "incident_id": incident_id,
            "recommended_shelter": shelter_obj,
            "distance_km": chosen["distance_km"],
            "allocated_beds": headcount,
            "rationale": f"Matched based on proximity ({chosen['distance_km']}km) and critical facilities: {', '.join(shelter_obj['medical_capabilities'][:2])}.",
            "remaining_shelter_capacity": shelter_obj["available_beds"]
        }

    def update_inventory(self, shelter_id: str, added_water_liters: int = 0, added_rations: int = 0, added_beds: int = 0) -> Dict[str, Any]:
        if shelter_id not in self.shelters:
            return {"status": "NOT_FOUND"}

        s = self.shelters[shelter_id]
        s["potable_water_liters"] += added_water_liters
        s["dry_ration_kits"] += added_rations
        s["total_capacity_beds"] += added_beds
        s["available_beds"] = max(0, s["total_capacity_beds"] - s["occupied_beds"])
        return {
            "status": "UPDATED",
            "shelter": s
        }

shelter_service = ShelterService()
