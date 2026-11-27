"""
CLIMAGRID - Autonomous Post-Disaster Damage & SDRF Relief Loss Calculator
Quantifies structural, utility, agricultural, and humanitarian losses across
the Roorkee / Solani Basin following MHA (Ministry of Home Affairs) SDRF norms.
"""

from typing import Dict, Any, List, Optional
import time

class DamageAssessmentService:
    def __init__(self):
        pass

    def calculate_assessment(
        self,
        flooded_hectares: float = 470.0,
        affected_families: int = 1480,
        road_washout_km: float = 7.8
    ) -> Dict[str, Any]:
        """
        Computes damage assessment across 4 Roorkee sectors and generates
        official SDRF (State Disaster Response Fund) compensation claim values.
        """
        scale_factor = max(0.5, flooded_hectares / 470.0)

        # 4 Discrete Geographical Survey Sectors
        sectors = [
            {
                "sector_id": "SEC-01-SOLANI",
                "name": "Solani River Embankment & Aqueduct Corridor",
                "inundated_hectares": round(flooded_hectares * 0.38, 1),
                "affected_dwellings": int(affected_families * 0.28),
                "damage_category": "Embankment Scouring & Riparian Erosion",
                "severity_grade": "SEVERE",
                "drone_survey_score": 8.4,  # /10
                "structural_loss_inr": round(14500000 * scale_factor),
                "crop_loss_inr": round(4800000 * scale_factor),
                "key_failures": [
                    "Solani Aqueduct northern revetment compromised (240m)",
                    "Drainage sluice gates #2 and #4 silt-jammed",
                    "34 rural pakka houses partially washed out"
                ]
            },
            {
                "sector_id": "SEC-02-RAMNAGAR",
                "name": "Brij Bridge & Ramnagar Lowlands",
                "inundated_hectares": round(flooded_hectares * 0.32, 1),
                "affected_dwellings": int(affected_families * 0.44),
                "damage_category": "Bridge Deck & Residential Submergence",
                "severity_grade": "CRITICAL_COLLAPSE_RISK",
                "drone_survey_score": 9.2,  # /10
                "structural_loss_inr": round(21000000 * scale_factor),
                "crop_loss_inr": round(1200000 * scale_factor),
                "key_failures": [
                    "Brij Bridge pier footing scouring (5.5ft rushing current)",
                    "Ramnagar arterial link road washed out (3.2 km)",
                    "680 residential ground floors submerged past ceiling level"
                ]
            },
            {
                "sector_id": "SEC-03-CIVIL-LINES",
                "name": "Civil Lines Municipal & Electrical Substation Grid",
                "inundated_hectares": round(flooded_hectares * 0.14, 1),
                "affected_dwellings": int(affected_families * 0.16),
                "damage_category": "Power Grid & Drainage Pump Failures",
                "severity_grade": "HIGH_UTILITY_LOSS",
                "drone_survey_score": 7.6,  # /10
                "structural_loss_inr": round(9500000 * scale_factor),
                "crop_loss_inr": 0,
                "key_failures": [
                    "33kV Civil Lines substation transformers inundated",
                    "Municipal stormwater lift pumps #1-#3 burned out",
                    "Commercial market basement silt ingress"
                ]
            },
            {
                "sector_id": "SEC-04-PURQAZI",
                "name": "Purqazi Water Intake & Pipeline Network",
                "inundated_hectares": round(flooded_hectares * 0.16, 1),
                "affected_dwellings": int(affected_families * 0.12),
                "damage_category": "Municipal Drinking Water Contamination",
                "severity_grade": "CRITICAL_HEALTH_HAZARD",
                "drone_survey_score": 8.8,  # /10
                "structural_loss_inr": round(6200000 * scale_factor),
                "crop_loss_inr": round(3500000 * scale_factor),
                "key_failures": [
                    "Drinking water intake choked with 46.8 NTU turbidity silt",
                    "Primary distribution feeder pipe fractured by hydrostatic pressure",
                    "14,000 households cut off from safe municipal water"
                ]
            }
        ]

        total_structural = sum(s["structural_loss_inr"] for s in sectors)
        total_agri = sum(s["crop_loss_inr"] for s in sectors)
        total_economic_loss = total_structural + total_agri

        # Official SDRF/NDRF Compensation Norms (MHA Govt of India)
        # Ex-gratia relief: ~₹12,000 per fully affected family + shelter assistance
        ex_gratia_relief = round(affected_families * 12500)
        # Infrastructure restoration (roads, bridges, power)
        infra_restoration = round(total_structural * 0.85)
        # Water/Sanitation restoration
        water_restoration = 4500000  # 45 Lakhs

        total_sdrf_claim = ex_gratia_relief + infra_restoration + total_agri + water_restoration

        return {
            "assessment_id": f"SDRF-UK-ROORKEE-{time.strftime('%Y%m%d')}-001",
            "survey_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "district": "Haridwar / Roorkee Basin",
            "state": "Uttarakhand",
            "governing_standard": "MHA SDRF / NDRF Operational Guidelines (2025-2026)",
            "summary_metrics": {
                "total_flooded_hectares": flooded_hectares,
                "total_affected_families": affected_families,
                "road_network_washout_km": road_washout_km,
                "total_economic_loss_inr": total_economic_loss,
                "total_economic_loss_cr": round(total_economic_loss / 10000000, 2),
                "total_sdrf_grant_claim_inr": total_sdrf_claim,
                "total_sdrf_grant_claim_cr": round(total_sdrf_claim / 10000000, 2),
                "average_drone_severity_score": 8.5
            },
            "sdrf_grant_breakdown": {
                "ex_gratia_family_relief_inr": ex_gratia_relief,
                "infrastructure_reconstruction_inr": infra_restoration,
                "agricultural_input_subsidy_inr": total_agri,
                "water_sanitation_rehabilitation_inr": water_restoration
            },
            "sectors": sectors,
            "dossier_text": self._generate_dossier_text(
                total_sdrf_claim, total_economic_loss, flooded_hectares, affected_families, road_washout_km, sectors
            )
        }

    def _generate_dossier_text(
        self,
        claim_inr: int,
        loss_inr: int,
        hectares: float,
        families: int,
        roads: float,
        sectors: List[Dict[str, Any]]
    ) -> str:
        dossier = (
            f"GOVERNMENT OF UTTARAKHAND — STATE DISASTER MANAGEMENT AUTHORITY (USDMA)\n"
            f"PRELIMINARY POST-FLOOD DAMAGE & SDRF RELIEF GRANT MEMORANDUM\n"
            f"Basin: Roorkee - Solani River - Upper Ganga Canal (Haridwar District)\n"
            f"Date of Submission: {time.strftime('%d-%B-%Y')}\n"
            f"------------------------------------------------------------------------\n\n"
            f"1. EXECUTIVE OVERVIEW:\n"
            f"Following catastrophic monsoonal discharge and riverbank breaches along the\n"
            f"Solani Aqueduct, an autonomous multimodal survey was conducted across {hectares} Ha.\n"
            f"Total Affected Population: {families} Families ({families * 4} Citizens approx).\n"
            f"Total Damaged Roadways: {roads} km washed out.\n\n"
            f"2. ESTIMATED FINANCIAL IMPACT:\n"
            f"• Total Direct Economic Damage: ₹{loss_inr / 10000000:.2f} Crores (INR {loss_inr:,})\n"
            f"• TOTAL SDRF GRANT CLAIM RECOMMENDED: ₹{claim_inr / 10000000:.2f} Crores (INR {claim_inr:,})\n\n"
            f"3. SECTORAL DAMAGE BREAKDOWN:\n"
        )
        for s in sectors:
            dossier += (
                f"\n[{s['sector_id']}] {s['name']}\n"
                f"  • Severity Grade: {s['severity_grade']} (Drone Score: {s['drone_survey_score']}/10)\n"
                f"  • Submerged: {s['inundated_hectares']} Ha | Damaged Dwellings: {s['affected_dwellings']}\n"
                f"  • Structural Loss: ₹{s['structural_loss_inr'] / 100000:.2f} Lakhs\n"
                f"  • Key Failures: {'; '.join(s['key_failures'][:2])}\n"
            )
        dossier += (
            f"\n------------------------------------------------------------------------\n"
            f"Submitted under Rule 12 of the Disaster Management Act (2005).\n"
            f"Endorsed by: Emergency Operations Command, Roorkee Sector.\n"
        )
        return dossier

damage_service = DamageAssessmentService()
