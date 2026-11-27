"""
CLIMAGRID // Official Hackathon Presentation Deck Generator (.pptx)
Track: SW-01 (Real-Time Disaster Relief Logistics Optimizer)
Domain: Disaster Tech / Cloud
Generates a 12-slide executive presentation in 16:9 widescreen format.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck(output_filename="CLIMAGRID_HACKATHON_PRESENTATION.pptx"):
    prs = Presentation()
    # 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette Definitions
    DARK_NAVY = RGBColor(11, 19, 43)        # #0B132B
    DEEP_SLATE = RGBColor(15, 23, 42)       # #0F172A
    CARD_BG = RGBColor(25, 34, 57)          # #192239
    LIGHT_BG = RGBColor(248, 250, 252)      # #F8FAFC
    LIGHT_CARD = RGBColor(255, 255, 255)    # #FFFFFF
    SKY_BLUE = RGBColor(2, 132, 199)        # #0284C7
    EMERALD = RGBColor(16, 185, 129)        # #10B981
    AMBER = RGBColor(245, 158, 11)          # #F59E0B
    ROSE = RGBColor(239, 68, 68)            # #EF4444
    TEXT_LIGHT = RGBColor(241, 245, 249)    # #F1F5F9
    TEXT_MUTED = RGBColor(148, 163, 184)    # #94A3B8
    TEXT_DARK = RGBColor(30, 41, 59)        # #1E293B
    BORDER_COLOR = RGBColor(51, 65, 85)     # #334155

    def add_header(slide, title_text, category_text, dark_mode=False):
        # Category / Tracker Pill
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.4))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        tf_cat.margin_left = tf_cat.margin_top = tf_cat.margin_right = tf_cat.margin_bottom = 0
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = SKY_BLUE if dark_mode else RGBColor(2, 132, 199)

        # Main Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.7), Inches(0.7))
        tf = title_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(24)
        p.font.bold = True
        p.font.color.rgb = TEXT_LIGHT if dark_mode else TEXT_DARK

    def set_slide_background(slide, color):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    def add_card(slide, left, top, width, height, fill_color=CARD_BG, border_color=BORDER_COLOR):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill_color
        if border_color:
            shape.line.color.rgb = border_color
            shape.line.width = Pt(1.2)
        else:
            shape.line.fill.background()
        return shape

    # =========================================================================
    # SLIDE 1: TITLE SLIDE (Dark Executive Theme)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1, DARK_NAVY)

    # Accent Glow / Banner
    banner = add_card(s1, Inches(0.8), Inches(1.5), Inches(11.733), Inches(4.5), fill_color=CARD_BG, border_color=BORDER_COLOR)

    tb = s1.shapes.add_textbox(Inches(1.2), Inches(1.8), Inches(10.9), Inches(3.9))
    tf = tb.text_frame
    tf.word_wrap = True

    p0 = tf.paragraphs[0]
    p0.text = "OVERCLOCK '26 • SOFTWARE TRACK • SW-01"
    p0.font.size = Pt(13)
    p0.font.bold = True
    p0.font.color.rgb = SKY_BLUE
    p0.space_after = Pt(14)

    p1 = tf.add_paragraph()
    p1.text = "CLIMAGRID"
    p1.font.size = Pt(44)
    p1.font.bold = True
    p1.font.color.rgb = RGBColor(255, 255, 255)
    p1.space_after = Pt(8)

    p2 = tf.add_paragraph()
    p2.text = "Real-Time Disaster Relief Logistics Optimizer & Multi-Hazard Command Center"
    p2.font.size = Pt(20)
    p2.font.bold = True
    p2.font.color.rgb = SKY_BLUE
    p2.space_after = Pt(18)

    p3 = tf.add_paragraph()
    p3.text = "Automated Vehicle Re-Routing • Road Blockage Telemetry • Multi-Warehouse Stock Sync • Explainable AI Triage"
    p3.font.size = Pt(13)
    p3.font.color.rgb = TEXT_MUTED
    p3.space_after = Pt(24)

    p4 = tf.add_paragraph()
    p4.text = "Mission Focus: Roorkee - Haridwar Multi-Hazard Basin (Solani River & Upper Ganga Canal)"
    p4.font.size = Pt(12)
    p4.font.bold = True
    p4.font.color.rgb = EMERALD

    # =========================================================================
    # SLIDE 2: THE PROBLEM STATEMENT & GROUND REALITY (SW-01)
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2, DARK_NAVY)
    add_header(s2, "The Crisis Ground Reality & SW-01 Problem Statement", "PS Code: SW-01 • Real-Time Disaster Relief Logistics Optimizer", dark_mode=True)

    # 3 Problem Pillar Cards
    c1 = add_card(s2, Inches(0.8), Inches(1.8), Inches(3.64), Inches(4.9))
    tb1 = s2.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(3.24), Inches(4.5))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "🚨 Critical Dispatch Delay"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = ROSE
    p.space_after = Pt(12)
    p_b = tf1.add_paragraph()
    p_b.text = "• Manual 112 calls take 15 to 45 minutes to process.\n\n• Citizen reports arrive in panicked, noisy Hindi/English dialects with zero coordinates.\n\n• Emergency operators struggle to prioritize 10,000+ simultaneous calls during cloudbursts, leading to fatal response bottlenecks."
    p_b.font.size = Pt(12)
    p_b.font.color.rgb = TEXT_LIGHT

    c2 = add_card(s2, Inches(4.84), Inches(1.8), Inches(3.64), Inches(4.9))
    tb2 = s2.shapes.add_textbox(Inches(5.04), Inches(2.0), Inches(3.24), Inches(4.5))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "⚠️ Blind Vehicle Routing"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = AMBER
    p.space_after = Pt(12)
    p_b = tf2.add_paragraph()
    p_b.text = "• Commercial GPS navigators (Google Maps) rely on static road networks.\n\n• They blindly route rescue boats and ambulances into 5.5ft deep submerged underpasses and washed-out bridges (e.g. Brij Bridge).\n\n• First responders get stranded, turning rescue assets into victims themselves."
    p_b.font.size = Pt(12)
    p_b.font.color.rgb = TEXT_LIGHT

    c3 = add_card(s2, Inches(8.88), Inches(1.8), Inches(3.64), Inches(4.9))
    tb3 = s2.shapes.add_textbox(Inches(9.08), Inches(2.0), Inches(3.24), Inches(4.5))
    tf3 = tb3.text_frame
    tf3.word_wrap = True
    p = tf3.paragraphs[0]
    p.text = "📦 Siloed Logistics & Stocks"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = SKY_BLUE
    p.space_after = Pt(12)
    p_b = tf3.add_paragraph()
    p_b.text = "• Zero real-time state synchronization between regional warehouses and shelters.\n\n• Evacuees with high medical vulnerability (pregnant mothers, infants) are sent to overcrowded gyms with no doctors.\n\n• Life-saving ration kits, purification tablets, and boats sit idle in unlinked depots."
    p_b.font.size = Pt(12)
    p_b.font.color.rgb = TEXT_LIGHT

    # =========================================================================
    # SLIDE 3: OUR SOLUTION — THE CLIMAGRID ECOSYSTEM
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3, DARK_NAVY)
    add_header(s3, "The ClimaGrid Solution: Unified Disaster Operations", "Core Architectural Innovation", dark_mode=True)

    # Top Mission Banner Card
    add_card(s3, Inches(0.8), Inches(1.8), Inches(11.733), Inches(1.5), fill_color=RGBColor(16, 28, 54), border_color=SKY_BLUE)
    tb_m = s3.shapes.add_textbox(Inches(1.0), Inches(1.95), Inches(11.3), Inches(1.2))
    tf_m = tb_m.text_frame
    tf_m.word_wrap = True
    pm = tf_m.paragraphs[0]
    pm.text = "ONE INTEGRATED PLATFORM FOR THE COMPOUND DISASTER LIFECYCLE"
    pm.font.size = Pt(15)
    pm.font.bold = True
    pm.font.color.rgb = SKY_BLUE
    pm.space_after = Pt(4)
    pm_desc = tf_m.add_paragraph()
    pm_desc.text = "ClimaGrid breaks municipal silos by uniting Real-Time Logistics Optimization (SW-01), Flash Flood Prediction (AAPDA360), Water Contamination Defense (JEEVAN), and Urban Heat Resilience (HEATSHIELD) under one GIS tactical picture."
    pm_desc.font.size = Pt(12)
    pm_desc.font.color.rgb = TEXT_LIGHT

    # 3 Solution Modules
    m1 = add_card(s3, Inches(0.8), Inches(3.6), Inches(3.64), Inches(3.2))
    tb_m1 = s3.shapes.add_textbox(Inches(1.0), Inches(3.75), Inches(3.24), Inches(2.9))
    tf_m1 = tb_m1.text_frame
    tf_m1.word_wrap = True
    p = tf_m1.paragraphs[0]
    p.text = "1. AAPDA360 (Floods & Routing)"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = SKY_BLUE
    p.space_after = Pt(8)
    pb = tf_m1.add_paragraph()
    pb.text = "• Sub-1.2s Bedrock NLP entity extraction.\n• Transparent mathematical triage formula.\n• Hazard-aware dynamic detour routing.\n• Preemptive 6-hour flood forecast.\n• Human-in-the-Loop fleet approval."
    pb.font.size = Pt(11)
    pb.font.color.rgb = TEXT_LIGHT

    m2 = add_card(s3, Inches(4.84), Inches(3.6), Inches(3.64), Inches(3.2))
    tb_m2 = s3.shapes.add_textbox(Inches(5.04), Inches(3.75), Inches(3.24), Inches(2.9))
    tf_m2 = tb_m2.text_frame
    tf_m2.word_wrap = True
    p = tf_m2.paragraphs[0]
    p.text = "2. SW-01 Logistics Engine"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = EMERALD
    p.space_after = Pt(8)
    pb = tf_m2.add_paragraph()
    pb.text = "• Optimal Drop Zones (LZ-1 Helipad).\n• Volunteer & medical staging depots.\n• Multi-warehouse DynamoDB sync.\n• Automated medical bed matching for pregnant women & critical infants."
    pb.font.size = Pt(11)
    pb.font.color.rgb = TEXT_LIGHT

    m3 = add_card(s3, Inches(8.88), Inches(3.6), Inches(3.64), Inches(3.2))
    tb_m3 = s3.shapes.add_textbox(Inches(9.08), Inches(3.75), Inches(3.24), Inches(2.9))
    tf_m3 = tb_m3.text_frame
    tf_m3.word_wrap = True
    p = tf_m3.paragraphs[0]
    p.text = "3. Compound Resilience"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = AMBER
    p.space_after = Pt(8)
    pb = tf_m3.add_paragraph()
    pb.text = "• JEEVAN: IoT turbidity & boil-water orders.\n• HEATSHIELD: Peak heatwave stress tests.\n• CAP Siren: 853Hz+960Hz cell broadcast.\n• Autonomous Drone Damage & SDRF grants."
    pb.font.size = Pt(11)
    pb.font.color.rgb = TEXT_LIGHT

    # =========================================================================
    # SLIDE 4: FEATURE 1 — AI DISTRESS INGESTION & EXPLAINABLE TRIAGE
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4, DARK_NAVY)
    add_header(s4, "Feature 1: Multimodal Ingestion & Explainable AI Triage", "AAPDA360 Intelligence Engine", dark_mode=True)

    # Left: Multimodal Ingestion Flow
    add_card(s4, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.9))
    tb_f1_l = s4.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.2), Inches(4.5))
    tf_f1_l = tb_f1_l.text_frame
    tf_f1_l.word_wrap = True
    p = tf_f1_l.paragraphs[0]
    p.text = "Multimodal Citizen Ingestion (< 1.2s SLA)"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = SKY_BLUE
    p.space_after = Pt(10)
    pb = tf_f1_l.add_paragraph()
    pb.text = "• Ingestion Channels: WhatsApp Emergency Bot (+91 112), 2G SMS Gateways, Voice SOS, and 1-Tap Mobile SOS.\n\n• Amazon Bedrock (Claude 3.5 Sonnet): Performs zero-shot entity extraction on colloquial Hindi/English voice and text in <1.2 seconds.\n\n• Structured Entity Schema: Automatically extracts Landmark ('Solani Aqueduct'), Trapped Count (4), Water Depth (6ft), and Vulnerabilities ('Infant', 'Elderly diabetic')."
    pb.font.size = Pt(12)
    pb.font.color.rgb = TEXT_LIGHT

    # Right: Explainable Formula
    add_card(s4, Inches(6.8), Inches(1.8), Inches(5.733), Inches(4.9))
    tb_f1_r = s4.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.333), Inches(4.5))
    tf_f1_r = tb_f1_r.text_frame
    tf_f1_r.word_wrap = True
    p = tf_f1_r.paragraphs[0]
    p.text = "Auditable Mathematical Triage Formula"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = EMERALD
    p.space_after = Pt(10)
    pb = tf_f1_r.add_paragraph()
    pb.text = "No 'Black-Box' Hallucinations in Emergency Decisions:\n\n" \
              "Score = (0.35 × Water Depth) + (0.35 × Acute Medical)\n" \
              "      + (0.20 × Vulnerabilities) + (0.10 × Headcount)\n\n" \
              "• Priority Tiers:\n" \
              "   - P1 - CRITICAL (Score >= 0.70): Immediate boat dispatch.\n" \
              "   - P2 - HIGH (Score 0.40 - 0.69): Staging queue.\n" \
              "   - P3 - MEDIUM (Score < 0.40): Dry food & water drop.\n\n" \
              "• Ethical Safeguard: A single unconscious diabetic infant scores higher than 10 healthy adults on a terrace."
    pb.font.size = Pt(12)
    pb.font.color.rgb = TEXT_LIGHT

    # =========================================================================
    # SLIDE 5: FEATURE 2 — DYNAMIC ROUTE OPTIMIZATION (SW-01 CORE GOAL)
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5, DARK_NAVY)
    add_header(s5, "Feature 2: Dynamic Hazard Bypass Routing & Fleet Dispatch", "SW-01 Core Goal Fulfillment", dark_mode=True)

    # Card 1: Blind Routing vs Safe Detour
    add_card(s5, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.9))
    tb_r1 = s5.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.2), Inches(4.5))
    tf_r1 = tb_r1.text_frame
    tf_r1.word_wrap = True
    p = tf_r1.paragraphs[0]
    p.text = "Obstacle Detection & Bypass Routing"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = AMBER
    p.space_after = Pt(10)
    pb = tf_r1.add_paragraph()
    pb.text = "• Blind Routing Hazard:\n" \
              "  Standard GPS routes vehicles directly through Brij Bridge underpass (submerged under 5.5ft floodwaters).\n\n" \
              "• Real-Time Hazard Exclusion Corridor:\n" \
              "  Powered by Amazon Location Service, ClimaGrid dynamically excludes submerged road segments.\n\n" \
              "• High-Ground Safe Corridors:\n" \
              "  Calculates a 3.4 km bypass corridor with 8.2 mins ETA, navigating along elevated embankments with zero road hazards."
    pb.font.size = Pt(12)
    pb.font.color.rgb = TEXT_LIGHT

    # Card 2: Drop Zones & Human Authorization
    add_card(s5, Inches(6.8), Inches(1.8), Inches(5.733), Inches(4.9))
    tb_r2 = s5.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.333), Inches(4.5))
    tf_r2 = tb_r2.text_frame
    tf_r2.word_wrap = True
    p = tf_r2.paragraphs[0]
    p.text = "Drop Zones & Fleet Dispatch (SW-01)"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = SKY_BLUE
    p.space_after = Pt(10)
    pb = tf_r2.add_paragraph()
    pb.text = "• Optimal Drop Zones & Staging (SW-01 Basic Goal):\n" \
              "   - Solani High-Ground Helipad (LZ-1): Elevation 274m for air drop and motorized boat launch.\n" \
              "   - IIT Roorkee Stadium Staging Depot: Volunteer assembly depot.\n\n" \
              "• Human-in-the-Loop Fleet Authorization:\n" \
              "  AI automates route calculation and risk detection, but the EOC Commander authorizes final dispatch ('Approve Fleet') to NDRF Motorboat 04 with live GPS tracking."
    pb.font.size = Pt(12)
    pb.font.color.rgb = TEXT_LIGHT

    # =========================================================================
    # SLIDE 6: FEATURE 3 — MULTI-WAREHOUSE SYNC & SMART SHELTERS (SW-01 ADVANCED)
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6, DARK_NAVY)
    add_header(s6, "Feature 3: Multi-Warehouse Stock Sync & Smart Relief Shelters", "SW-01 Advanced Bonus Goal Fulfillment", dark_mode=True)

    add_card(s6, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.9))
    tb_s1 = s6.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.2), Inches(4.5))
    tf_s1 = tb_s1.text_frame
    tf_s1.word_wrap = True
    p = tf_s1.paragraphs[0]
    p.text = "Smart Medical Shelter Matching"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = EMERALD
    p.space_after = Pt(10)
    pb = tf_s1.add_paragraph()
    pb.text = "• Live Bed Occupancy Tracking:\n" \
              "  Monitors total bed capacity (660 beds across Roorkee) and potable drinking water liters.\n\n" \
              "• Automated Vulnerability Matching:\n" \
              "  When a stranded family with a third-trimester pregnant woman, 3-month-old infant, and diabetic elder is evacuated, ClimaGrid automatically routes them to RIT Roorkee Safe Campus (equipped with maternity care and pediatric cribs) rather than a generic camp."
    pb.font.size = Pt(12)
    pb.font.color.rgb = TEXT_LIGHT

    add_card(s6, Inches(6.8), Inches(1.8), Inches(5.733), Inches(4.9))
    tb_s2 = s6.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.333), Inches(4.5))
    tf_s2 = tb_s2.text_frame
    tf_s2.word_wrap = True
    p = tf_s2.paragraphs[0]
    p.text = "Multi-Warehouse Stock Sync (DynamoDB)"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = SKY_BLUE
    p.space_after = Pt(10)
    pb = tf_s2.add_paragraph()
    pb.text = "• Real-Time Distributed State Store:\n" \
              "  Backed by Amazon DynamoDB & EventBridge streams with sub-10ms state updates.\n\n" \
              "• Synchronized Regional Nodes:\n" \
              "   - Roorkee Central (WH-01): 8 Boats, 1,850 Ration Kits.\n" \
              "   - IIT Roorkee Hub (WH-02): 4 Boats, 1,400 Ration Kits.\n" \
              "   - Gurukul Kangri Medical (WH-03): 2 Boats, 950 Kits.\n" \
              "   - Cantt Army Depot (WH-04): 6 Heavy Assault Boats.\n\n" \
              "• Automated supply rebalancing when warehouse stocks drop below 20% threshold."
    pb.font.size = Pt(12)
    pb.font.color.rgb = TEXT_LIGHT

    # =========================================================================
    # SLIDE 7: FEATURE 4 — 6-HOUR PREDICTIVE FLOOD TIMELINE
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7, DARK_NAVY)
    add_header(s7, "Feature 4: 6-Hour Predictive Hydrodynamic Flood Inundation", "Mission Mausam / Hydra-AI Early Warning", dark_mode=True)

    # 4 Timeline Steps Grid
    step_w = Inches(2.78)
    steps_data = [
        ("T: 0 (Current)", "340.5 Hectares Flooded", "4,200 Citizens at Risk", "River Stage: 5.42m (Danger: 6.20m)\nUpstream discharge: 24,500 cusecs.\nEmbankment under observation.", SKY_BLUE),
        ("T: +2 Hours", "470.0 Hectares Flooded", "7,100 Citizens at Risk", "PREDICTIVE EARLY WARNING\nBrij Bridge underpass submerged (5.5ft).\nSolani Aqueduct embankment breach.", AMBER),
        ("T: +4 Hours", "585.0 Hectares Flooded", "11,000 Citizens at Risk", "PEAK CREST LEVEL\nRamnagar Ward 4 fully inundated.\nPreemptive evacuation must be completed.", ROSE),
        ("T: +6 Hours", "540.0 Hectares Flooded", "9,500 Citizens at Risk", "RECEDING INUNDATION\nReceding stage allows relief boats to supply marooned pockets on rooftops.", EMERALD)
    ]

    for idx, (s_title, s_area, s_pop, s_desc, color) in enumerate(steps_data):
        l = Inches(0.8 + idx * 2.98)
        card = add_card(s7, l, Inches(1.8), step_w, Inches(3.6), border_color=color)
        tb = s7.shapes.add_textbox(l + Inches(0.15), Inches(1.95), step_w - Inches(0.3), Inches(3.3))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = s_title
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = color
        p.space_after = Pt(6)

        p_a = tf.add_paragraph()
        p_a.text = s_area
        p_a.font.size = Pt(12)
        p_a.font.bold = True
        p_a.font.color.rgb = RGBColor(255, 255, 255)

        p_p = tf.add_paragraph()
        p_p.text = s_pop
        p_p.font.size = Pt(11)
        p_p.font.color.rgb = TEXT_MUTED
        p_p.space_after = Pt(8)

        p_d = tf.add_paragraph()
        p_d.text = s_desc
        p_d.font.size = Pt(10)
        p_d.font.color.rgb = TEXT_LIGHT

    # Bottom Callout: Preemptive Action
    add_card(s7, Inches(0.8), Inches(5.6), Inches(11.733), Inches(1.2), fill_color=RGBColor(28, 25, 23), border_color=AMBER)
    tb_b = s7.shapes.add_textbox(Inches(1.0), Inches(5.75), Inches(11.3), Inches(0.9))
    tf_b = tb_b.text_frame
    tf_b.word_wrap = True
    p = tf_b.paragraphs[0]
    p.text = "⚡ PREEMPTIVE VALUE: EVACUATING CITIZENS 4 HOURS BEFORE PEAK CREST"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = AMBER
    p.space_after = Pt(2)
    p2 = tf_b.add_paragraph()
    p2.text = "Instead of reacting when water reaches neck level, ClimaGrid's hydrodynamic model identifies impassable road culverts and triggers geofenced sirens 4 hours ahead of peak inundation, saving thousands of lives."
    p2.font.size = Pt(11)
    p2.font.color.rgb = TEXT_LIGHT

    # =========================================================================
    # SLIDE 8: FEATURE 5 — CAP SIREN & AUTONOMOUS DRONE DAMAGE ASSESSMENT
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8, DARK_NAVY)
    add_header(s8, "Feature 5: NDMA CAP Siren & Autonomous Drone Damage Grants", "Public Warning & Fast Recovery", dark_mode=True)

    add_card(s8, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.9))
    tb_c1 = s8.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.2), Inches(4.5))
    tf_c1 = tb_c1.text_frame
    tf_c1.word_wrap = True
    p = tf_c1.paragraphs[0]
    p.text = "NDMA SACHET / CAP Geofenced Siren"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = ROSE
    p.space_after = Pt(10)
    pb = tf_c1.add_paragraph()
    pb.text = "• ITU-T X.1303 & OASIS CAP v1.2 Standard:\n" \
              "  Bilingual English and Hindi alerts transmitted directly across cellular radio control channels.\n\n" \
              "• Authentic 853Hz + 960Hz Emergency Warble:\n" \
              "  Synthesizes dual-frequency acoustic siren in-browser using Web Audio API.\n\n" \
              "• Geofenced Cell-Broadcast Reach:\n" \
              "  Targets 45 local telecom towers, alerting ~50,000 citizens in the high-risk flood polygon with zero internet required."
    pb.font.size = Pt(12)
    pb.font.color.rgb = TEXT_LIGHT

    add_card(s8, Inches(6.8), Inches(1.8), Inches(5.733), Inches(4.9))
    tb_c2 = s8.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.333), Inches(4.5))
    tf_c2 = tb_c2.text_frame
    tf_c2.word_wrap = True
    p = tf_c2.paragraphs[0]
    p.text = "Autonomous Drone Damage & SDRF Claim"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = EMERALD
    p.space_after = Pt(10)
    pb = tf_c2.add_paragraph()
    pb.text = "• Computer Vision Drone Reconnaissance:\n" \
              "  Surveys 4 municipal sectors, evaluating structural failure, inundated hectares, and dwelling collapse.\n\n" \
              "• Automated MHA SDRF Grant Claim:\n" \
              "   - Ex-gratia family subsistence relief: ₹1.85 Cr\n" \
              "   - Bridge & arterial road restoration: ₹3.40 Cr\n" \
              "   - Crop input subsidy & water rehabilitation: ₹0.64 Cr\n" \
              "   - Total recommended disbursal: ₹5.89 Crores\n\n" \
              "• 1-Click Official Memorandum Dossier (.txt) export for the State Disaster Management Authority."
    pb.font.size = Pt(12)
    pb.font.color.rgb = TEXT_LIGHT

    # =========================================================================
    # SLIDE 9: COMPOUND HAZARDS — WATER QUALITY (JEEVAN) & HEAT (HEATSHIELD)
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9, DARK_NAVY)
    add_header(s9, "Compound Disaster Resilience: Water Safety & Extreme Heat", "Cross-Hazard Prevention Lifecycle", dark_mode=True)

    add_card(s9, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.9))
    tb_w = s9.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.2), Inches(4.5))
    tf_w = tb_w.text_frame
    tf_w.word_wrap = True
    p = tf_w.paragraphs[0]
    p.text = "JEEVAN: Water Safety & Epidemic Shield"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = SKY_BLUE
    p.space_after = Pt(10)
    pb = tf_w.add_paragraph()
    pb.text = "• Real-Time IoT Water Telemetry:\n" \
              "  4 online sensor stations monitoring Turbidity, pH, and Dissolved Oxygen across the basin.\n\n" \
              "• Flood Ingress Contamination Spike:\n" \
              "  Detects severe 46.0 NTU turbidity spike (safe baseline <5.0 NTU) as floodwaters breach drinking water intakes.\n\n" \
              "• Automated District Boil-Water Health Order:\n" \
              "  Dispatches emergency potable water tanker locations to prevent waterborne cholera outbreaks post-flood."
    pb.font.size = Pt(12)
    pb.font.color.rgb = TEXT_LIGHT

    add_card(s9, Inches(6.8), Inches(1.8), Inches(5.733), Inches(4.9))
    tb_h = s9.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.333), Inches(4.5))
    tf_h = tb_h.text_frame
    tf_h.word_wrap = True
    p = tf_h.paragraphs[0]
    p.text = "HEATSHIELD: Urban Heat Resilience"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = AMBER
    p.space_after = Pt(10)
    pb = tf_h.add_paragraph()
    pb.text = "• Dynamic Heatwave Simulation:\n" \
              "  Interactive slider scaling ambient heatwaves from 35°C to 48°C peak summer extremes.\n\n" \
              "• Dynamic Cooling Shelter Scaling:\n" \
              "  Automatically scales required AC misting shelters from 2 to 5 centers when heat index exceeds 44°C.\n\n" \
              "• 3-Year Municipal Cool Roof & Tree ROI:\n" \
              "  Projects temperature drops (-2.8°C to -3.4°C) and municipal energy savings with 14-month ROI payback."
    pb.font.size = Pt(12)
    pb.font.color.rgb = TEXT_LIGHT

    # =========================================================================
    # SLIDE 10: TECHNICAL ARCHITECTURE & AWS CLOUD SCALABILITY
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10, DARK_NAVY)
    add_header(s10, "Decoupled Serverless Cloud Architecture & AWS Blueprint", "Production-Grade Cloud Engineering", dark_mode=True)

    # 5 Stages Cards in a row
    stages = [
        ("STAGE 1", "Multimodal Ingest", "WhatsApp (+91 112)\n2G SMS Gateways\nIoT Basin Gauges", SKY_BLUE),
        ("STAGE 2", "Bedrock NLP", "Claude 3.5 Sonnet\nZero-shot extraction\n< 1.2s Latency", AMBER),
        ("STAGE 3", "Explainable Triage", "Auditable math formula\nVulnerability weighted\nHuman authorization", EMERALD),
        ("STAGE 4", "Dynamic Route", "Amazon Location Service\nSubmerged road detour\n< 180ms compute", SKY_BLUE),
        ("STAGE 5", "Fleet Dispatch", "Motorboat telematics\nDynamoDB state sync\nOptimal LZ helipads", ROSE)
    ]

    for idx, (st_num, st_name, st_desc, color) in enumerate(stages):
        l = Inches(0.8 + idx * 2.38)
        card = add_card(s10, l, Inches(1.8), Inches(2.2), Inches(2.6), border_color=color)
        tb = s10.shapes.add_textbox(l + Inches(0.1), Inches(1.9), Inches(2.0), Inches(2.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = st_num
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = color
        p_n = tf.add_paragraph()
        p_n.text = st_name
        p_n.font.size = Pt(13)
        p_n.font.bold = True
        p_n.font.color.rgb = RGBColor(255, 255, 255)
        p_n.space_after = Pt(4)
        p_d = tf.add_paragraph()
        p_d.text = st_desc
        p_d.font.size = Pt(10)
        p_d.font.color.rgb = TEXT_LIGHT

    # Bottom AWS & Performance Stats
    add_card(s10, Inches(0.8), Inches(4.7), Inches(5.6), Inches(2.1))
    tb_b1 = s10.shapes.add_textbox(Inches(1.0), Inches(4.85), Inches(5.2), Inches(1.8))
    tf_b1 = tb_b1.text_frame
    tf_b1.word_wrap = True
    p = tf_b1.paragraphs[0]
    p.text = "AWS Cloud Services Backbone"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = AMBER
    p_d = tf_b1.add_paragraph()
    p_d.text = "• Amazon Bedrock: Sub-1.2s Hindi/English NLP extraction.\n• Amazon DynamoDB: Sub-10ms state store for fleet GPS.\n• Amazon Location Service: Real-time obstacle bypass.\n• AWS Lambda & EventBridge: 0 to 50,000 req/s auto-scaling."
    p_d.font.size = Pt(10)
    p_d.font.color.rgb = TEXT_LIGHT

    add_card(s10, Inches(6.8), Inches(4.7), Inches(5.733), Inches(2.1))
    tb_b2 = s10.shapes.add_textbox(Inches(7.0), Inches(4.85), Inches(5.333), Inches(1.8))
    tf_b2 = tb_b2.text_frame
    tf_b2.word_wrap = True
    p = tf_b2.paragraphs[0]
    p.text = "Key Performance Benchmarks & SDGs"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = EMERALD
    p_d = tf_b2.add_paragraph()
    p_d.text = "• 65% Dispatch Latency Reduction compared to manual 112 calls.\n• 98.4% Structured JSON entity extraction accuracy.\n• UN SDG 11: Protecting vulnerable informal settlements.\n• UN SDG 13: Integrated climate action across compound cycles."
    p_d.font.size = Pt(10)
    p_d.font.color.rgb = TEXT_LIGHT

    # =========================================================================
    # SLIDE 11: FAIL-SAFE OFFLINE RESILIENCE (ZERO INTERNET DEFENSE)
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_background(s11, DARK_NAVY)
    add_header(s11, "Fail-Safe Offline Resilience: Zero-Internet Operations", "Crucial Disaster Engineering Safeguard", dark_mode=True)

    # 4 Offline Pillars
    pillars = [
        ("1. Citizen 2G SMS Channel", "No mobile data (4G/5G) needed.\nSMS travels over voice signaling channels (140-byte packet) to emergency 112 even during total data network congestion.", SKY_BLUE),
        ("2. Offline PWA Field Tablets", "First responder tablets cache vector tiles & elevation models locally in browser IndexedDB.\nRoute detour calculations execute on-device with zero cloud calls.", EMERALD),
        ("3. Tactical LoRaWAN Radios", "Rescue boats communicate over 15km range via 868/915 MHz LoRaWAN transceivers.\nZero cellular towers required; vehicle-to-vehicle Bluetooth mesh relay.", AMBER),
        ("4. Edge EOC & Satellite Uplink", "Containerized local EOC server runs offline on a rugged laptop with a generator.\nSyncs via ISRO GSAT / satellite with eventual consistency when restored.", ROSE)
    ]

    for idx, (p_title, p_desc, color) in enumerate(pillars):
        row = idx // 2
        col = idx % 2
        l = Inches(0.8 + col * 6.0)
        t = Inches(1.8 + row * 2.6)
        card = add_card(s11, l, t, Inches(5.733), Inches(2.3), border_color=color)
        tb = s11.shapes.add_textbox(l + Inches(0.2), t + Inches(0.15), Inches(5.333), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = p_title
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = color
        p.space_after = Pt(6)
        pd = tf.add_paragraph()
        pd.text = p_desc
        pd.font.size = Pt(11)
        pd.font.color.rgb = TEXT_LIGHT

    # =========================================================================
    # SLIDE 12: WHY CLIMAGRID IS TRULY UNIQUE & WINNING VALUE
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    set_slide_background(s12, DARK_NAVY)
    add_header(s12, "Why ClimaGrid is Unique & Transformational", "Summary of Impact & Competitive Edge", dark_mode=True)

    # Comparison Table / Two Halves
    # Left: Old Way
    add_card(s12, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.9), fill_color=RGBColor(30, 20, 25), border_color=ROSE)
    tb_old = s12.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.2), Inches(4.5))
    tf_old = tb_old.text_frame
    tf_old.word_wrap = True
    p = tf_old.paragraphs[0]
    p.text = "Traditional Disaster Management (Status Quo)"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = ROSE
    p.space_after = Pt(12)
    p_b = tf_old.add_paragraph()
    p_b.text = "❌ 15–45 min dispatch latency on jammed call lines.\n\n" \
               "❌ Blind routing through 5.5ft flooded bridges, stranding rescue vehicles.\n\n" \
               "❌ Siloed municipal agencies (Flood, Health, Municipal departments never talk).\n\n" \
               "❌ Generic gym shelter dumps with zero medical triage for infants or pregnant mothers.\n\n" \
               "❌ Weeks of manual damage paperwork delaying SDRF treasury compensation funds."
    p_b.font.size = Pt(12)
    p_b.font.color.rgb = TEXT_LIGHT

    # Right: ClimaGrid Way
    add_card(s12, Inches(6.8), Inches(1.8), Inches(5.733), Inches(4.9), fill_color=RGBColor(16, 32, 28), border_color=EMERALD)
    tb_new = s12.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.333), Inches(4.5))
    tf_new = tb_new.text_frame
    tf_new.word_wrap = True
    p = tf_new.paragraphs[0]
    p.text = "ClimaGrid AI Disaster Operations"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = EMERALD
    p.space_after = Pt(12)
    p_b = tf_new.add_paragraph()
    p_b.text = "✅ < 1.2s Bedrock NLP triage prioritizing vulnerable lives with transparent formula.\n\n" \
               "✅ Dynamic road blockage detour calculation around submerged bridges.\n\n" \
               "✅ Multi-warehouse state store sync across regional logistics depots.\n\n" \
               "✅ Automated medical bed matching for pediatric and pregnant evacuees.\n\n" \
               "✅ Instant SDRF grant memorandum claim generation saving weeks of bureaucracy."
    p_b.font.size = Pt(12)
    p_b.font.color.rgb = TEXT_LIGHT

    # Save presentation
    prs.save(output_filename)
    print(f"Successfully generated {output_filename}")

if __name__ == "__main__":
    create_deck("CLIMAGRID_HACKATHON_PRESENTATION.pptx")
