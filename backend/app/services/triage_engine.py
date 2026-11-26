from typing import List, Tuple
from app.config import settings
from app.models.schemas import TriageScoreBreakdown

def calculate_triage_score(
    hazard_score: float,
    med_urgency_score: float,
    vulnerabilities: List[str],
    waiting_minutes: float = 0.0
) -> TriageScoreBreakdown:
    """
    AAPDA360 Transparent & Auditable Mathematical Triage Formula:
    Score P = (0.35 * Hazard) + (0.35 * MedUrgency) + (0.20 * Vuln) + (0.10 * Time)
    """
    # 1. Vulnerability score calculation
    vuln_weights = {
        "infant": 0.35,
        "baby": 0.35,
        "elderly": 0.30,
        "pregnant": 0.30,
        "unconscious": 0.35,
        "disabled": 0.25,
        "injured": 0.25,
        "ground_floor_trapped": 0.20
    }
    
    vuln_score = 0.0
    detected_vulns = []
    for v in vulnerabilities:
        v_lower = v.lower()
        for key, weight in vuln_weights.items():
            if key in v_lower and key not in detected_vulns:
                vuln_score += weight
                detected_vulns.append(key)
    
    vuln_score = min(1.0, max(0.1, vuln_score if detected_vulns else 0.1))

    # 2. Time delay score (normalizes waiting time up to 120 mins)
    time_score = min(1.0, waiting_minutes / 120.0)

    # 3. Apply exact AAPDA360 blueprint weights
    w_h = settings.WEIGHT_HAZARD
    w_m = settings.WEIGHT_MED_URGENCY
    w_v = settings.WEIGHT_VULNERABILITY
    w_t = settings.WEIGHT_TIME_DELAY

    final_score = (w_h * hazard_score) + (w_m * med_urgency_score) + (w_v * vuln_score) + (w_t * time_score)
    final_score = round(min(1.0, max(0.05, final_score)), 3)

    # 4. Map to Priority Tier
    if final_score >= 0.70:
        tier = "P1 - CRITICAL"
    elif final_score >= 0.48:
        tier = "P2 - HIGH"
    elif final_score >= 0.28:
        tier = "P3 - MEDIUM"
    else:
        tier = "P4 - LOW"

    # 5. Explainable Reasoning (never a black box)
    reasons = []
    if med_urgency_score >= 0.7:
        reasons.append("acute life-threatening medical emergency detected")
    if hazard_score >= 0.7:
        reasons.append("rapidly rising / deep water level threatening structural safety")
    if detected_vulns:
        reasons.append(f"high-risk vulnerable individuals present ({', '.join(detected_vulns)})")
    if time_score >= 0.5:
        reasons.append(f"extended waiting time ({int(waiting_minutes)}m without response)")
    
    explanation = f"Ranked {tier} (Score: {final_score:.2f}) because of: " + ("; ".join(reasons) if reasons else "routine evacuation request with low immediate danger.")

    return TriageScoreBreakdown(
        hazard_score=round(hazard_score, 2),
        medical_urgency_score=round(med_urgency_score, 2),
        vulnerability_score=round(vuln_score, 2),
        time_delay_score=round(time_score, 2),
        final_score=final_score,
        priority_tier=tier,
        explanation=explanation
    )
