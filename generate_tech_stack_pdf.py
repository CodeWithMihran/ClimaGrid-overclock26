"""
LIFELINE360 // CLIMAGRID
Tech Stack Specification & End-to-End System Flowchart PDF Generator
Overclock '26 Hackathon (RIT Roorkee)
Produces a clean, executive 3-page whitepaper with zero awkward overflows.
"""

import sys
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Polygon
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute total page count and add headers/footers."""
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748b")) # slate-500
        
        # Header (pages 2+)
        if self._pageNumber > 1:
            self.drawString(40, 755, "LIFELINE360 // CLIMAGRID — Technical Stack Specification & System Workflow")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(40, 749, 572, 749)

        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(40, 36, 572, 36)
        
        self.setFont("Helvetica", 7.5)
        self.drawString(40, 25, "Overclock '26 Hackathon (RIT Roorkee) | Team Lifeline360 / ClimaGrid | Confidential Architecture Whitepaper")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(572, 25, page_str)
        self.restoreState()

def build_flowchart_drawing():
    """Generates a compact vector flowchart diagram illustrating the 8-stage pipeline."""
    w_total = 532
    h_total = 170
    d = Drawing(w_total, h_total)
    
    # Outer container card
    d.add(Rect(0, 0, w_total, h_total, rx=6, ry=6, fillColor=colors.HexColor("#091024"), strokeColor=colors.HexColor("#1e293b"), strokeWidth=1))

    # Box layout parameters (w=112, gap=18, 4 columns: x = 14, 144, 274, 404)
    # Row 1 (Top, y=92): Ingest -> AI -> Triage -> EOC Queue
    # Row 2 (Bottom, y=14): Heatshield <- Jeevan <- Hazard Route <- Dispatch
    row1 = [
        (14, 92, 112, 64, "1. INGESTION", "Voice SOS, App,\nWhatsApp, SMS\n(Hindi / English)", "#1e293b", "#38bdf8"),
        (144, 92, 112, 64, "2. BEDROCK AI", "Extracts Victims,\nLandmarks, Water\nDepth in <1.2s", "#1e293b", "#06b6d4"),
        (274, 92, 112, 64, "3. TRIAGE SCORE", "Score = 0.35H +\n0.35M + 0.2V + 0.1T\n(P1 - P4 Auditable)", "#1e293b", "#f59e0b"),
        (404, 92, 112, 64, "4. TACTICAL EOC", "P1 Priority Queue\nDark-Navy Map\nSonar Alert Chime", "#1e293b", "#ef4444")
    ]
    
    row2 = [
        (404, 14, 112, 64, "5. HUMAN DISPATCH", "Operator Review\n& 1-Click Fleet\nBoat Deployment", "#1e293b", "#10b981"),
        (274, 14, 112, 64, "6. HAZARD ROUTE", "Bypasses Submerged\nBrij Bridge via\nHigh-Ground Detour", "#1e293b", "#8b5cf6"),
        (144, 14, 112, 64, "7. JEEVAN INTEL", "Water Turbidity\n12h Spike Timeline\nBoil-Water Notice", "#1e293b", "#0284c7"),
        (14, 14, 112, 64, "8. HEATSHIELD", "Pre-Disaster Heat\n35°C->48°C Sim\nTree Canopy ROI", "#1e293b", "#ea580c")
    ]

    for (x, y, w, h, title, sub, bg, border) in row1 + row2:
        d.add(Rect(x, y, w, h, rx=4, ry=4, fillColor=colors.HexColor(bg), strokeColor=colors.HexColor(border), strokeWidth=1.2))
        d.add(String(x + w/2, y + h - 13, title, fontName="Helvetica-Bold", fontSize=7.5, textAnchor="middle", fillColor=colors.HexColor(border)))
        
        lines = sub.split('\n')
        cur_y = y + h - 25
        for line in lines:
            d.add(String(x + w/2, cur_y, line, fontName="Helvetica", fontSize=6.8, textAnchor="middle", fillColor=colors.HexColor("#f1f5f9")))
            cur_y -= 9.5

    # Connectors Row 1 (Left to Right): 1 -> 2 -> 3 -> 4
    for arrow_x in [126, 256, 386]:
        d.add(Line(arrow_x, 124, arrow_x + 18, 124, strokeColor=colors.HexColor("#38bdf8"), strokeWidth=1.5))
        d.add(Polygon(points=[arrow_x + 18, 124, arrow_x + 13, 127, arrow_x + 13, 121], fillColor=colors.HexColor("#38bdf8"), strokeColor=colors.HexColor("#38bdf8")))

    # Connector Down: 4 -> 5
    d.add(Line(460, 92, 460, 78, strokeColor=colors.HexColor("#10b981"), strokeWidth=1.5))
    d.add(Polygon(points=[460, 78, 457, 83, 463, 83], fillColor=colors.HexColor("#10b981"), strokeColor=colors.HexColor("#10b981")))

    # Connectors Row 2 (Right to Left): 5 -> 6 -> 7 -> 8
    for arrow_x, target_x in [(404, 386), (274, 256), (144, 126)]:
        d.add(Line(arrow_x, 46, target_x, 46, strokeColor=colors.HexColor("#10b981"), strokeWidth=1.5))
        d.add(Polygon(points=[target_x, 46, target_x + 5, 49, target_x + 5, 43], fillColor=colors.HexColor("#10b981"), strokeColor=colors.HexColor("#10b981")))

    return d

def generate_pdf(output_path: str):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0b132b")
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#0284c7")
    )

    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=8,
        spaceAfter=4
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=5,
        spaceAfter=2
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#334155")
    )

    body_bold = ParagraphStyle(
        'BodyBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#1e293b")
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#0f172a")
    )

    formula_style = ParagraphStyle(
        'FormulaText',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#0369a1")
    )

    story = []

    # =========================================================================
    # PAGE 1: EXECUTIVE SUMMARY & SYSTEM FLOWCHART
    # =========================================================================
    story.append(Paragraph("LIFELINE360 // CLIMAGRID", title_style))
    story.append(Paragraph("Unified Technical Stack Specification & End-to-End System Architecture", subtitle_style))
    story.append(Spacer(1, 2))
    story.append(Paragraph("<b>Event:</b> Overclock '26 Hackathon (RIT Roorkee) | <b>Geographic Anchor:</b> Roorkee / Solani Aqueduct / Haridwar Ganga Basin", body_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284c7"), spaceBefore=4, spaceAfter=6))

    story.append(Paragraph("1. Executive Summary: What This Project Does (In Simple Language)", h1_style))
    story.append(Paragraph(
        "During extreme cloudbursts and monsoonal river floods, emergency dispatch centers (like 112 / NDRF) freeze due to <b>'Triage Paralysis'</b>—thousands of panicked Hindi/English calls flood in at once, making it impossible to identify who is in life-threatening danger versus who has minor waterlogging. Standard GPS apps (like Google Maps) recommend routes across <b>bridges that are 5 feet underwater</b>, causing boat strandings. Furthermore, when floodwaters recede, contaminated sewage seeps into drinking pipelines, causing secondary cholera outbreaks.",
        body_style
    ))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "<b>Lifeline360 solves this end-to-end through a single unified tactical platform across three critical phases:</b>",
        body_bold
    ))
    story.append(Spacer(1, 4))

    summary_data = [
        [
            Paragraph("<b>Disaster Phase</b>", table_header),
            Paragraph("<b>Real-World Problem</b>", table_header),
            Paragraph("<b>How Lifeline360 Solves It</b>", table_header)
        ],
        [
            Paragraph("<b>DURING</b><br/>(Floods - 60%)", table_cell_bold),
            Paragraph("Panicked voice cries in Hindi; submerged bridges; dispatch paralysis.", table_cell),
            Paragraph("<b>AWS Bedrock AI</b> parses voice notes in &lt;1.2s. An auditable mathematical formula scores urgency (P1 to P4). Dynamic routing detours around flooded bridges.", table_cell)
        ],
        [
            Paragraph("<b>AFTER</b><br/>(Water - 20%)", table_cell_bold),
            Paragraph("Floodwater recedes into municipal pipes; sewage contamination outbreak.", table_cell),
            Paragraph("<b>JEEVAN Module</b> tracks 12h turbidity timelines, detects 9x silt spikes (46.8 NTU), and issues official printable Boil-Water Advisories.", table_cell)
        ],
        [
            Paragraph("<b>BEFORE</b><br/>(Heat - 20%)", table_cell_bold),
            Paragraph("Summer heatwaves turn concrete urban centers into 45°C heat traps.", table_cell),
            Paragraph("<b>HEATSHIELD Module</b> simulates heatwaves (35°C to 48°C), scales emergency cooling centers, and calculates tree canopy cooling ROI (-2.8°C).", table_cell)
        ]
    ]
    t_summary = Table(summary_data, colWidths=[80, 212, 240])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_summary)
    story.append(Spacer(1, 8))

    story.append(Paragraph("2. End-to-End System Workflow (Visual Flowchart)", h1_style))
    story.append(Paragraph("How raw sensory data flows from citizen cry to boat rescue, safe water notice, and cooling shield:", body_style))
    story.append(Spacer(1, 4))
    story.append(build_flowchart_drawing())

    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: HOW THE SYSTEM WORKS (SIMPLE STEP-BY-STEP EXPLANATION)
    # =========================================================================
    story.append(Paragraph("3. Step-by-Step Workflow Explained in Simple Language", h1_style))
    story.append(Paragraph(
        "Here is the simple journey of an emergency incident through Lifeline360 from start to finish:",
        body_style
    ))
    story.append(Spacer(1, 4))

    steps_explanation = [
        ("Step 1: Multi-Channel Citizen Distress Ingestion (Zero App Barrier)",
         "A stranded citizen on a terrace does not need to install an app. They can speak into the mobile web client in Hindi or Hinglish, send a WhatsApp voice note to the NDMA helpline bot, or text via a basic phone 2G SMS. The system records speech, GPS location, and uploaded waterline photos."),
        
        ("Step 2: Sub-Second Multimodal AI Extraction (<1.2s SLA)",
         "In less than 1.2 seconds, AWS Bedrock (Claude 3.5 Sonnet) parses the natural speech. It extracts colloquial phrases like <i>'dadi behosh hai'</i> (elderly unconscious), identifies headcount (4 trapped), locks onto landmark proximity ('Solani Aqueduct'), and gauges water depth from photos."),
        
        ("Step 3: Open & Auditable Mathematical Triage Formula",
         "Rather than using an untrustworthy 'black-box' neural network for life-and-death ranking, Lifeline360 uses a 100% transparent and auditable mathematical equation to rank every incident:"),
        
        ("Step 4: Dark-Navy EOC Operations Command Console",
         "The EOC Commander interface is organized into 3 high-contrast tactical zones: Zone 1 (Center) features Leaflet maps with dark CartoDB WebGL tiles, flood contours, and boat positions; Zone 2 (Left) streams the incident queue sorted strictly by triage score; Zone 3 (Right) displays fleet fuel/battery and sensor gauges."),
        
        ("Step 5: Human-in-the-Loop Fleet Approval & Dispatch",
         "To guarantee ethical AI standards, the AI never dispatches military or rescue units autonomously. An authorized NDRF human dispatcher reviews the verified photo and audio evidence, selects an available boat (e.g., NDRF-BOAT-04), and clicks 'Approve Dispatch'. The citizen's phone immediately shows their assigned unit."),
        
        ("Step 6: Hazard-Aware Dynamic Routing (A* Dijkstra Graph Bypass)",
         "Normal routing engines send rescue boats across Brij Bridge (which is 5.5ft underwater and structurally compromised). Lifeline360 applies high penalty weights to flooded roads and bridges, automatically generating a safe, elevated high-ground detour that keeps rescue crews out of danger."),
        
        ("Step 7: JEEVAN Water Contamination Intelligence (Post-Disaster)",
         "Once the flood recedes, IoT water sensors detect a sudden 9.3x spike in turbidity (46.8 NTU) at the Purqazi water intake. The JEEVAN module alerts operators, automatically generates a printable municipal Boil-Water Advisory notice, and maps emergency potable water tanker locations."),
        
        ("Step 8: HEATSHIELD Urban Heat Island & Tree Canopy ROI (Pre-Disaster)",
         "Before the monsoon, that same area was an intense 44°C concrete heat island. City planners adjust an interactive temperature slider (35°C to 48°C) to simulate heat dome expansion, automatically scale up emergency cooling shelters, and calculate the ROI of planting 450 native trees (-2.8°C cooling).")
    ]

    for title, desc in steps_explanation:
        story.append(Paragraph(f"• <b>{title}</b>", h2_style))
        story.append(Paragraph(desc, body_style))
        if "Mathematical Triage Formula" in title:
            # Highlight formula box
            t_form = Table([[
                Paragraph("<b>AUDITABLE TRIAGE FORMULA:</b><br/>"
                          "<b>Score = (0.35 × Hazard) + (0.35 × Medical) + (0.20 × Vulnerability) + (0.10 × Time Delay)</b><br/>"
                          "• Score &ge; 0.70 &rarr; <b>P1 - CRITICAL</b> (Acoustic Sonar Chime + Immediate Rescue)<br/>"
                          "• Score 0.50 - 0.69 &rarr; <b>P2 - HIGH</b> | Score 0.30 - 0.49 &rarr; <b>P3 - MEDIUM</b> | &lt; 0.30 &rarr; <b>P4 - LOW</b>",
                          formula_style)
            ]], colWidths=[532])
            t_form.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f0fdf4")),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#10b981")),
                ('TOPPADDING', (0,0), (-1,-1), 4),
                ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                ('LEFTPADDING', (0,0), (-1,-1), 8),
                ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ]))
            story.append(Spacer(1, 2))
            story.append(t_form)
            story.append(Spacer(1, 2))
        else:
            story.append(Spacer(1, 2))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 3: COMPLETE TECH STACK MATRIX & SYSTEM VERIFICATION
    # =========================================================================
    story.append(Paragraph("4. Complete Technical Stack & Exact Work Provided", h1_style))
    story.append(Paragraph(
        "The following matrix outlines every technology, library, framework, and cloud service used in Lifeline360, accompanied by its exact functional responsibility:",
        body_style
    ))
    story.append(Spacer(1, 4))

    tech_stack_data = [
        [
            Paragraph("<b>Layer / Domain</b>", table_header),
            Paragraph("<b>Technology / Tool</b>", table_header),
            Paragraph("<b>Exact Functional Responsibility & Work Provided</b>", table_header)
        ],
        # FRONTEND
        [
            Paragraph("<b>Frontend Framework</b>", table_cell_bold),
            Paragraph("<b>Next.js 14</b> (App Router, React 18, TypeScript)", table_cell),
            Paragraph("High-performance server-rendered UI, handles dual-screen citizen client (/citizen) and military EOC console (/). Built-in offline resilient cache guarantees zero blank screens.", table_cell)
        ],
        [
            Paragraph("<b>Tactical Styling</b>", table_cell_bold),
            Paragraph("<b>Tailwind CSS</b> + Lucide React Icons", table_cell),
            Paragraph("Implements military-grade dark-navy (#070D1E) operations layout, glowing hazard badges, dynamic responsive side panels, and high-contrast tactical readability.", table_cell)
        ],
        [
            Paragraph("<b>Geospatial Mapping</b>", table_cell_bold),
            Paragraph("<b>Leaflet.js</b> & React-Leaflet (CartoDB Dark Matter WebGL)", table_cell),
            Paragraph("High-framerate map canvas rendering flood polygon overlays, boat GPS breadcrumbs, safe vs dangerous detour lines, water sensor points, and interactive popups.", table_cell)
        ],
        [
            Paragraph("<b>Client Audio / Voice</b>", table_cell_bold),
            Paragraph("<b>Web Speech API</b> + Web Audio API (Sonar Chimes)", table_cell),
            Paragraph("Real-time in-browser speech recognition in Hindi (hi-IN) and English (en-IN) from citizen mic; tactical acoustic sonar alert chimes when high-urgency P1 distress calls arrive.", table_cell)
        ],
        # BACKEND
        [
            Paragraph("<b>Backend API Server</b>", table_cell_bold),
            Paragraph("<b>FastAPI</b> + Uvicorn ASGI (Python 3.14)", table_cell),
            Paragraph("Asynchronous high-throughput REST and SSE streaming server, automated OpenAPI / Swagger documentation, sub-50ms endpoint response latency.", table_cell)
        ],
        [
            Paragraph("<b>Data Validation</b>", table_cell_bold),
            Paragraph("<b>Pydantic v2</b>", table_cell),
            Paragraph("Strict runtime schema enforcement, type validation for incoming distress payloads, IoT sensor feeds, route coordinates, and image requests.", table_cell)
        ],
        # AI & MULTIMODAL
        [
            Paragraph("<b>AI / LLM Extraction</b>", table_cell_bold),
            Paragraph("<b>AWS Bedrock</b> (Claude 3.5 Sonnet / Indic Vernacular Heuristic)", table_cell),
            Paragraph("Sub-second multimodal NLP: parses panic colloquial Hindi/English into structured JSON (headcount, landmark, medical risk, water depth) in &lt;1.2s.", table_cell)
        ],
        [
            Paragraph("<b>Computer Vision</b>", table_cell_bold),
            Paragraph("<b>Vision Waterline Depth Gauge</b> (Pillow & Edge Analysis)", table_cell),
            Paragraph("Estimates water depth in feet and meters from uploaded flood photos by detecting structural waterline markers (roofs, window frames, car door handles, tire rims).", table_cell)
        ],
        # ROUTING & SPATIAL
        [
            Paragraph("<b>Dynamic Routing</b>", table_cell_bold),
            Paragraph("<b>NetworkX</b> + Weighted Dijkstra / A* Algorithm", table_cell),
            Paragraph("Calculates shortest safe rescue route across Roorkee road graph, dynamically penalizing and bypassing submerged bridges (Brij Bridge).", table_cell)
        ],
        [
            Paragraph("<b>Spatial Geometry</b>", table_cell_bold),
            Paragraph("<b>Shapely</b> + GeoJSON Standard", table_cell),
            Paragraph("Point-in-polygon collision detection, flood inundation buffer zones, and thermal boundary generation for heatwave simulation.", table_cell)
        ],
        # REALTIME & IOT
        [
            Paragraph("<b>Real-time Stream</b>", table_cell_bold),
            Paragraph("<b>Server-Sent Events (SSE)</b> + AsyncIO Stream", table_cell),
            Paragraph("Continuously streams live river gauges (Solani Aqueduct, Ganga Canal) and turbidity telemetry into the EOC ticker without page refresh.", table_cell)
        ],
        [
            Paragraph("<b>Citizen Webhooks</b>", table_cell_bold),
            Paragraph("<b>Meta / Twilio WhatsApp & SMS</b> Webhook Handlers", table_cell),
            Paragraph("Direct webhook endpoints (/webhook/whatsapp and /webhook/sms) allowing citizens without smart apps to register emergency calls via text.", table_cell)
        ],
        # CLOUD DEPLOYMENT
        [
            Paragraph("<b>Cloud Architecture</b>", table_cell_bold),
            Paragraph("<b>AWS Serverless</b> (Lambda, DynamoDB, EventBridge, S3)", table_cell),
            Paragraph("Production-ready decoupled deployment: event-driven architecture scales from 0 to 100,000 concurrent requests during a catastrophic cloudburst.", table_cell)
        ]
    ]

    t_tech = Table(tech_stack_data, colWidths=[90, 142, 300])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0b132b")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_tech)
    story.append(Spacer(1, 8))

    # =========================================================================
    # CLOSING / STAGE READINESS CERTIFICATE
    # =========================================================================
    story.append(Paragraph("5. Verification, Defense & UN SDG Alignment", h1_style))
    
    cert_data = [[
        Paragraph(
            "<b>STAGE READINESS AUDIT: 100% PASS (44/44 Tests Verified)</b><br/>"
            "• <b>Automated Platform Test Suite:</b> 44 / 44 tests passing (100% success rate) covering all 6 API modules.<br/>"
            "• <b>Offline Resilience:</b> Integrated fallback cache ensures zero blank screens during venue Wi-Fi outages.<br/>"
            "• <b>UN SDG Alignment:</b> Directly satisfies <b>UN SDG 11</b> (Sustainable Cities & Resilient Communities) and <b>UN SDG 13</b> (Climate Action).<br/>"
            "• <b>GitHub Repository:</b> <u>https://github.com/CodeWithMihran/ClimaGrid-overclock26</u> (Branch: <i>main</i>, Clean Tree)",
            body_style
        )
    ]]
    t_cert = Table(cert_data, colWidths=[532])
    t_cert.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#0284c7")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_cert)

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[✓] Successfully generated technical specification PDF at: {output_path}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "LIFELINE360_TECH_STACK_AND_ARCHITECTURE.pdf"
    generate_pdf(out_file)
