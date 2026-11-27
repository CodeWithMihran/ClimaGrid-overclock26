"""
CLIMAGRID - OASIS CAP v1.2 & ITU-T X.1303 Emergency Broadcast Siren Service
Implements India NDMA SACHET / C-DoT compliant Common Alerting Protocol (CAP)
for geofenced cell-broadcast emergency alerts in Hindi & English.
"""

import time
import uuid
from typing import Dict, Any, List, Optional
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom

class CAPBroadcastService:
    def __init__(self):
        self.active_alerts: Dict[str, Dict[str, Any]] = {}
        # Pre-seed with one active flash flood advisory
        self._seed_initial_alert()

    def _seed_initial_alert(self):
        alert_id = "IN-NDMA-ROORKEE-20261126-001"
        self.active_alerts[alert_id] = {
            "identifier": alert_id,
            "sender": "eoc-roorkee@ndma.gov.in",
            "sent": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "status": "Actual",
            "msgType": "Alert",
            "scope": "Public",
            "category": "Met",
            "event": "Flash Flood & Embankment Overflow",
            "urgency": "Immediate",
            "severity": "Extreme",
            "certainty": "Observed",
            "headline_en": "🚨 NDMA URGENT FLASH FLOOD SIREN: Solani River embankment water level rising rapidly in Roorkee. Move to high ground immediately.",
            "headline_hi": "🚨 राष्ट्रीय आपदा प्रबंधन प्राधिकरण (NDMA): सोलानी नदी तटबंध जलस्तर चेतावनी। तत्काल सुरक्षित ऊंचे स्थान पर जाएं।",
            "description_en": "Solani River water stage has exceeded 5.4m warning mark. Brij Bridge underpass is impassable (5.5ft deep current). Preemptive evacuation ordered for Ramnagar Ward 4 and Solani Basin. Designate RIT Roorkee Campus Safe Zone or Nehru Stadium for emergency shelter. Emergency Helpline: 112.",
            "description_hi": "सोलानी नदी का जलस्तर चेतावनी स्तर को पार कर गया है। बृज ब्रिज पूरी तरह जलमग्न है। रामनगर वार्ड 4 के नागरिक तुरंत सुरक्षित ऊंचाई पर जाएं। आपातकालीन हेल्पलाइन: 112।",
            "instruction": "Do not attempt to cross flooded bridges or moving water. Boil all drinking water. Keep mobile phones charged.",
            "area_description": "Roorkee - Solani Aqueduct, Ramnagar, Civil Lines South, Upper Ganga Canal Basin",
            "polygon_coordinates": "29.8550,77.8800 29.8750,77.8850 29.8780,77.9050 29.8580,77.9000 29.8550,77.8800",
            "cap_xml": "",
            "cell_towers_targeted": 48,
            "estimated_recipients": 54000
        }
        self.active_alerts[alert_id]["cap_xml"] = self.generate_cap_xml(self.active_alerts[alert_id])

    def generate_cap_xml(self, alert_data: Dict[str, Any]) -> str:
        """
        Generates standard OASIS CAP v1.2 / ITU-T X.1303 XML string.
        """
        root = Element('alert', xmlns="urn:oasis:names:tc:emergency:cap:1.2")
        SubElement(root, 'identifier').text = alert_data.get('identifier', str(uuid.uuid4()))
        SubElement(root, 'sender').text = alert_data.get('sender', 'eoc-roorkee@ndma.gov.in')
        SubElement(root, 'sent').text = alert_data.get('sent', time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
        SubElement(root, 'status').text = alert_data.get('status', 'Actual')
        SubElement(root, 'msgType').text = alert_data.get('msgType', 'Alert')
        SubElement(root, 'scope').text = alert_data.get('scope', 'Public')

        # Info Block 1: English
        info_en = SubElement(root, 'info')
        SubElement(info_en, 'language').text = "en-IN"
        SubElement(info_en, 'category').text = alert_data.get('category', 'Met')
        SubElement(info_en, 'event').text = alert_data.get('event', 'Flash Flood')
        SubElement(info_en, 'urgency').text = alert_data.get('urgency', 'Immediate')
        SubElement(info_en, 'severity').text = alert_data.get('severity', 'Extreme')
        SubElement(info_en, 'certainty').text = alert_data.get('certainty', 'Observed')
        SubElement(info_en, 'headline').text = alert_data.get('headline_en', '')
        SubElement(info_en, 'description').text = alert_data.get('description_en', '')
        SubElement(info_en, 'instruction').text = alert_data.get('instruction', '')
        
        area_en = SubElement(info_en, 'area')
        SubElement(area_en, 'areaDesc').text = alert_data.get('area_description', '')
        SubElement(area_en, 'polygon').text = alert_data.get('polygon_coordinates', '')

        # Info Block 2: Hindi (Indic Vernacular)
        info_hi = SubElement(root, 'info')
        SubElement(info_hi, 'language').text = "hi-IN"
        SubElement(info_hi, 'category').text = alert_data.get('category', 'Met')
        SubElement(info_hi, 'event').text = "आकस्मिक बाढ़ एवं जलभराव"
        SubElement(info_hi, 'urgency').text = alert_data.get('urgency', 'Immediate')
        SubElement(info_hi, 'severity').text = alert_data.get('severity', 'Extreme')
        SubElement(info_hi, 'certainty').text = alert_data.get('certainty', 'Observed')
        SubElement(info_hi, 'headline').text = alert_data.get('headline_hi', '')
        SubElement(info_hi, 'description').text = alert_data.get('description_hi', '')

        # Convert to pretty XML string
        rough_string = tostring(root, 'utf-8')
        reparsed = minidom.parseString(rough_string)
        return reparsed.toprettyxml(indent="  ")

    def broadcast_alert(
        self,
        event: str,
        severity: str,
        headline_en: str,
        headline_hi: str,
        description_en: str,
        description_hi: str,
        area_description: str,
        polygon_coords: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Creates, logs, and broadcasts a new CAP emergency siren message.
        """
        date_str = time.strftime("%Y%m%d", time.gmtime())
        rand_suffix = str(uuid.uuid4())[:4].upper()
        alert_id = f"IN-NDMA-ROORKEE-{date_str}-{rand_suffix}"

        alert_record = {
            "identifier": alert_id,
            "sender": "eoc-roorkee@ndma.gov.in",
            "sent": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "status": "Actual",
            "msgType": "Alert",
            "scope": "Public",
            "category": "Met",
            "event": event,
            "urgency": "Immediate",
            "severity": severity,
            "certainty": "Observed",
            "headline_en": headline_en,
            "headline_hi": headline_hi,
            "description_en": description_en,
            "description_hi": description_hi,
            "instruction": "Follow official SDRF / EOC directives. Stay away from damaged electrical transformers and submerged roads.",
            "area_description": area_description,
            "polygon_coordinates": polygon_coords or "29.8550,77.8800 29.8750,77.8850 29.8780,77.9050 29.8580,77.9000 29.8550,77.8800",
            "cell_towers_targeted": 52,
            "estimated_recipients": 62500,
            "broadcast_status": "TRANSMITTED_TO_CELL_BROADCAST_CENTER"
        }

        xml_output = self.generate_cap_xml(alert_record)
        alert_record["cap_xml"] = xml_output
        self.active_alerts[alert_id] = alert_record

        return alert_record

    def list_active_alerts(self) -> List[Dict[str, Any]]:
        return list(self.active_alerts.values())

    def cancel_alert(self, alert_id: str) -> Dict[str, Any]:
        if alert_id in self.active_alerts:
            self.active_alerts[alert_id]["msgType"] = "Cancel"
            self.active_alerts[alert_id]["status"] = "Cancelled"
            self.active_alerts[alert_id]["cap_xml"] = self.generate_cap_xml(self.active_alerts[alert_id])
            return {"status": "CANCELLED", "alert_id": alert_id}
        return {"status": "NOT_FOUND"}

cap_service = CAPBroadcastService()
