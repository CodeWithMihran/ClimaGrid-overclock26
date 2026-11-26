from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import List, Optional
from app.services.cap_broadcast import cap_service

router = APIRouter(prefix="/alerts", tags=["NDMA SACHET / CAP Emergency Broadcast Siren"])

class CAPBroadcastRequest(BaseModel):
    event: str = "Flash Flood & River Ingress"
    severity: str = "Extreme"  # Extreme, Severe, Moderate
    headline_en: str
    headline_hi: str
    description_en: str
    description_hi: str
    area_description: str
    polygon_coords: Optional[str] = None

@router.get("/active")
async def get_active_cap_alerts():
    """
    Returns all active Common Alerting Protocol (CAP) emergency broadcasts
    currently transmitted to mobile subscribers via cellular cell towers.
    """
    return cap_service.list_active_alerts()

@router.get("/template")
async def get_preset_cap_templates():
    """
    Returns ready-to-broadcast emergency siren presets for quick 1-click dispatch.
    """
    return [
        {
            "id": "tpl_flood",
            "title": "Solani River Embankment Breach (Flash Flood)",
            "severity": "Extreme",
            "event": "Flash Flood & Inundation",
            "headline_en": "🚨 NDMA URGENT FLASH FLOOD SIREN: Solani River embankment breached in Roorkee. Move to high ground immediately.",
            "headline_hi": "🚨 राष्ट्रीय आपदा प्रबंधन प्राधिकरण: सोलानी नदी तटबंध टूटा। तुरंत सुरक्षित ऊंचे स्थान पर जाएं।",
            "description_en": "Rapid water level ingress in Ramnagar and Solani Basin. Brij Bridge impassable. RIT Roorkee Safe Campus opened for relief shelter.",
            "description_hi": "रामनगर और सोलानी बेसिन में जलस्तर तेजी से बढ़ रहा है। बृज ब्रिज जलमग्न है। आर.आई.टी रुड़की सुरक्षित राहत शिविर में शरण लें।",
            "area_description": "Roorkee - Solani Basin, Ramnagar Ward 4, Civil Lines"
        },
        {
            "id": "tpl_water",
            "title": "Municipal Drinking Water Contamination (Boil Notice)",
            "severity": "Severe",
            "event": "Drinking Water Contamination",
            "headline_en": "⚠️ MUNICIPAL BOIL-WATER ADVISORY: Sewage ingress detected in water pipelines. Boil tap water for 3+ minutes.",
            "headline_hi": "⚠️ नगर निगम चेतावनी: पेयजल पाइपलाइनों में सीवेज रिसाव। नल का पानी कम से कम 3 मिनट उबालकर ही पिएं।",
            "description_en": "Water treatment intake turbidity spiked to 46.8 NTU. Do not consume unboiled tap water. Potable water tankers dispatched.",
            "description_hi": "जल शोधन संयंत्र में भारी गंदगी पाई गई है। उबला पानी ही पिएं। आपातकालीन पानी के टैंकर रवाना कर दिए गए हैं।",
            "area_description": "Roorkee Municipal District & Purqazi Supply Grid"
        },
        {
            "id": "tpl_bridge",
            "title": "Brij Bridge Impassable & Structural Compromise",
            "severity": "Severe",
            "event": "Structural Infrastructure Hazard",
            "headline_en": "⛔ TRAFFIC ALERT: Brij Bridge closed due to 5.5ft flood current. Use Highway bypass.",
            "headline_hi": "⛔ यातायात अलर्ट: बृज ब्रिज पर 5.5 फीट पानी भरने के कारण बंद किया गया। हाईवे बाईपास का उपयोग करें।",
            "description_en": "Brij Bridge underpass is impassable. All vehicles rerouted via Roorkee National Highway bypass corridor.",
            "description_hi": "बृज ब्रिज पर यातायात पूरी तरह रोक दिया गया है। राष्ट्रीय राजमार्ग बाईपास का प्रयोग करें।",
            "area_description": "Brij Bridge Roorkee Crossing"
        }
    ]

@router.post("/broadcast")
async def transmit_cap_broadcast(req: CAPBroadcastRequest):
    """
    Transmits an official ITU-T X.1303 / OASIS CAP v1.2 emergency broadcast alert
    to cell towers and returns structured JSON + raw CAP XML string.
    """
    return cap_service.broadcast_alert(
        event=req.event,
        severity=req.severity,
        headline_en=req.headline_en,
        headline_hi=req.headline_hi,
        description_en=req.description_en,
        description_hi=req.description_hi,
        area_description=req.area_description,
        polygon_coords=req.polygon_coords
    )

@router.get("/{alert_id}/xml")
async def get_raw_cap_xml(alert_id: str):
    """
    Returns standard OASIS CAP v1.2 compliant XML document.
    """
    alerts = cap_service.list_active_alerts()
    match = next((a for a in alerts if a["identifier"] == alert_id), None)
    if not match:
        raise HTTPException(status_code=404, detail="Alert not found")
    return Response(content=match["cap_xml"], media_type="application/xml")

@router.post("/{alert_id}/cancel")
async def cancel_active_alert(alert_id: str):
    """
    Cancels / revokes an active emergency alert siren.
    """
    return cap_service.cancel_alert(alert_id)
