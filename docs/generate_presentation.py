from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

# Initialize Presentation
prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

# --- COLOR PALETTE & FONT ---
FONT_FAMILY = "Times New Roman"
COLOR_TITLE = RGBColor(27, 54, 93)      # Dark Blue
COLOR_TEXT = RGBColor(50, 50, 50)       # Dark Gray/Black
COLOR_BG = RGBColor(255, 255, 255)      # White
COLOR_HEADER_BG = RGBColor(230, 230, 230) # Light Gray for tables

def add_header(slide, title_text):
    tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.8))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = title_text
    p.font.name = FONT_FAMILY
    p.font.size = Pt(28)
    p.font.bold = True
    p.font.color.rgb = COLOR_TITLE

# ==========================================
# SLIDE 1: Title Slide
# ==========================================
slide1 = prs.slides.add_slide(prs.slide_layouts[6])
tb1 = slide1.shapes.add_textbox(Inches(1.0), Inches(2.2), Inches(11.333), Inches(3.0))
tf1 = tb1.text_frame

p1 = tf1.paragraphs[0]
p1.text = "Team Progress Analysis & Work Audit"
p1.font.name = FONT_FAMILY
p1.font.size = Pt(38)
p1.font.bold = True
p1.font.color.rgb = COLOR_TITLE
p1.alignment = PP_ALIGN.LEFT

p2 = tf1.add_paragraph()
p2.text = "Institutional ERP System Development (Week 03 / Week 04)"
p2.font.name = FONT_FAMILY
p2.font.size = Pt(22)
p2.font.color.rgb = COLOR_TEXT
p2.space_before = Pt(14)

p3 = tf1.add_paragraph()
p3.text = "Prepared by: Lakshya Singhal | Lead Frontend Architect"
p3.font.name = FONT_FAMILY
p3.font.size = Pt(18)
p3.font.italic = True
p3.font.color.rgb = COLOR_TEXT
p3.space_before = Pt(30)

# ==========================================
# SLIDE 2: Work Analysis Overview
# ==========================================
slide2 = prs.slides.add_slide(prs.slide_layouts[6])
add_header(slide2, "Work Analysis Overview — Prashant Jain")

tb2 = slide2.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(11.7), Inches(5.0))
tf2 = tb2.text_frame
tf2.word_wrap = True

bullets_s2 = [
    ("Assigned Domain:", " Academic & Institutional Backend Modules."),
    ("Audit Objective:", " Cross-examine assigned tasks against logged progress in the Developer Diary (dev_diary.md)."),
    ("Key Summary Findings:", ""),
    ("  • Execution Alignment:", " Core assigned modules (Campus, Department, Academic Year) were completed."),
    ("  • Schedule Shifts:", " Significant timing differences exist between the task assignment tracker and logged execution."),
    ("  • Deliverable Deviations:", " Architectural changes and additional database migrations occurred during Day 01 setup.")
]

for title, body in bullets_s2:
    p = tf2.add_paragraph()
    p.space_after = Pt(12)
    run1 = p.add_run()
    run1.text = title + " "
    run1.font.name = FONT_FAMILY
    run1.font.size = Pt(18)
    run1.font.bold = True
    run1.font.color.rgb = COLOR_TEXT
    
    if body:
        run2 = p.add_run()
        run2.text = body
        run2.font.name = FONT_FAMILY
        run2.font.size = Pt(18)
        run2.font.color.rgb = COLOR_TEXT

# ==========================================
# SLIDE 3: Assigned vs. Actual Execution Table
# ==========================================
slide3 = prs.slides.add_slide(prs.slide_layouts[6])
add_header(slide3, "Prashant Jain — Assigned vs. Actual Execution")

rows, cols = 7, 4
left, top, width, height = Inches(0.8), Inches(1.5), Inches(11.7), Inches(5.2)
table_shape = slide3.shapes.add_table(rows, cols, left, top, width, height)
table = table_shape.table

table.columns[0].width = Inches(1.2)
table.columns[1].width = Inches(2.8)
table.columns[2].width = Inches(3.7)
table.columns[3].width = Inches(4.0)

table_data = [
    ["Day", "Assigned Task (Tracker)", "Actual Logged Activity (Dev Diary)", "Audit / Status"],
    ["Day 01", "Institution Schema", "Architecture Reset & Global Exception Handler", "Deviated: Base setup focused; V1 schema added."],
    ["Day 02", "Campus Management", "Campus CRUD & Migration (V2 SQL)", "Completed: Aligned with domain."],
    ["Day 03", "Department Management", "Department CRUD & Migration (V3 SQL)", "Completed: Aligned with domain."],
    ["Day 04", "Academic Year", "AcademicYear CRUD & Migration (V4 SQL)", "Completed: Package naming resolved."],
    ["Day 05", "Halt", "Semester CRUD & Migration (V5 SQL)", "Completed: Executed during planned halt."],
    ["Day 06", "Halt", "Program & Batch CRUD (V6, V7 SQL)", "Completed: Executed during planned halt."]
]

for row_idx, row_data in enumerate(table_data):
    for col_idx, text in enumerate(row_data):
        cell = table.cell(row_idx, col_idx)
        cell.text = text
        p = cell.text_frame.paragraphs[0]
        p.font.name = FONT_FAMILY
        p.font.size = Pt(13 if row_idx > 0 else 14)
        if row_idx == 0:
            p.font.bold = True
            cell.fill.solid()
            cell.fill.fore_color.rgb = COLOR_HEADER_BG

# ==========================================
# SLIDE 4: Discrepancies & Audit
# ==========================================
slide4 = prs.slides.add_slide(prs.slide_layouts[6])
add_header(slide4, "Prashant Jain — Discrepancies & Work Audit")

tb4 = slide4.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(11.7), Inches(5.0))
tf4 = tb4.text_frame
tf4.word_wrap = True

discrepancies = [
    ("1. Documentation Reporting vs. Logged Output", 
     "The tracking sheet logs 'Delayed' for documentation across Days 02–04, whereas dev_diary.md contains detailed package mappings, problem statements, and solutions."),
    ("2. Code Submission Status on Day 01", 
     "Tracker marks Day 01 Code Submission as 'null', but the Developer Diary documents a full architecture reset, monorepo backend creation, and GlobalExceptionHandler setup."),
    ("3. Schedule & Phase Misalignment", 
     "The task breakdown assigns Semester, Program, Course, and Curriculum to Week 04. However, dev_diary.md records Semester, Program, and Batch as completed in Days 05–06 of Week 03.")
]

for title, desc in discrepancies:
    p1 = tf4.add_paragraph()
    p1.space_before = Pt(10)
    r1 = p1.add_run()
    r1.text = title
    r1.font.name = FONT_FAMILY
    r1.font.size = Pt(17)
    r1.font.bold = True
    r1.font.color.rgb = COLOR_TITLE

    p2 = tf4.add_paragraph()
    p2.space_after = Pt(10)
    r2 = p2.add_run()
    r2.text = desc
    r2.font.name = FONT_FAMILY
    r2.font.size = Pt(15)
    r2.font.color.rgb = COLOR_TEXT

# ==========================================
# SLIDE 5: My Work — Lakshya Singhal
# ==========================================
slide5 = prs.slides.add_slide(prs.slide_layouts[6])
add_header(slide5, "My Work & Deliverables — Lakshya Singhal")

tb5 = slide5.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(11.7), Inches(5.0))
tf5 = tb5.text_frame
tf5.word_wrap = True

bullets_s5 = [
    ("Role:", " Lead Software Architect & Core Frontend Lead"),
    ("Core Architectural Achievements (Days 01 – 06):", ""),
    ("  • Enterprise Foundation:", " Built a complete frontend architecture using React 19, TypeScript 5.9, Vite 5, and Tailwind CSS 3.4."),
    ("  • Codebase Volume:", " Engineered 140 fully implemented source files containing 9,763 lines of clean TypeScript code."),
    ("  • Verified Build Quality:", " Production build (npm run build) completed with Exit Code 0 across 2,755 transformed modules and 0 compiler errors.")
]

for title, body in bullets_s5:
    p = tf5.add_paragraph()
    p.space_after = Pt(12)
    r1 = p.add_run()
    r1.text = title
    r1.font.name = FONT_FAMILY
    r1.font.size = Pt(18)
    r1.font.bold = True
    r1.font.color.rgb = COLOR_TEXT
    if body:
        r2 = p.add_run()
        r2.text = body
        r2.font.name = FONT_FAMILY
        r2.font.size = Pt(18)
        r2.font.color.rgb = COLOR_TEXT

# ==========================================
# SLIDE 6: Frontend Architecture Highlights
# ==========================================
slide6 = prs.slides.add_slide(prs.slide_layouts[6])
add_header(slide6, "Lakshya Singhal — System Architecture & Components")

tb6 = slide6.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(11.7), Inches(5.0))
tf6 = tb6.text_frame
tf6.word_wrap = True

arch_items = [
    ("Design System & Layout Shell", "Implemented AppLayout, Sidebar, Topbar, design tokens (colors, typography), and Cmd+K Global Search modal."),
    ("Centralized API & Interceptor Hub", "Axios client with JWT bearer injection, correlation IDs, status error mapping (200-504), and a 401 silent token refresh queue to handle race conditions."),
    ("Enterprise Form & Validation Engine", "React Hook Form + Zod validation, dependent select fields, autosave, dirty state tracking, and normalized error formatters.")
]

for title, desc in arch_items:
    p = tf6.add_paragraph()
    p.space_before = Pt(8)
    r1 = p.add_run()
    r1.text = "• " + title + ": "
    r1.font.name = FONT_FAMILY
    r1.font.size = Pt(17)
    r1.font.bold = True
    r1.font.color.rgb = COLOR_TITLE
    
    r2 = p.add_run()
    r2.text = desc
    r2.font.name = FONT_FAMILY
    r2.font.size = Pt(16)
    r2.font.color.rgb = COLOR_TEXT

# ==========================================
# SLIDE 7: My Implementation Roadmap
# ==========================================
slide7 = prs.slides.add_slide(prs.slide_layouts[6])
add_header(slide7, "Lakshya Singhal — Week 03 / Week 04 Plan")

tb7 = slide7.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(11.7), Inches(5.0))
tf7 = tb7.text_frame
tf7.word_wrap = True

roadmap = [
    ("Day 01 — Advanced Data Management:", " API client abstractions, loading/error states, and server-side table hook (useServerTable)."),
    ("Day 02 — Frontend-Backend Integration:", " Direct Spring Boot REST API integration, environment configuration, and token handling."),
    ("Day 03 — Student Module UI:", " Complete UI screens for Student Dashboard, Student CRUD, and Student Status lifecycle."),
    ("Day 04 — Institution Module UI:", " Management UI for Institution, Campus, and Department entries."),
    ("Day 05–06 — Reusable Forms & DataTables:", " Dynamic field validation, server-side pagination, multi-column sorting, and instant CSV exports.")
]

for day, desc in roadmap:
    p = tf7.add_paragraph()
    p.space_after = Pt(10)
    r1 = p.add_run()
    r1.text = day
    r1.font.name = FONT_FAMILY
    r1.font.size = Pt(16)
    r1.font.bold = True
    r1.font.color.rgb = COLOR_TEXT
    
    r2 = p.add_run()
    r2.text = desc
    r2.font.name = FONT_FAMILY
    r2.font.size = Pt(16)
    r2.font.color.rgb = COLOR_TEXT

# ==========================================
# SLIDE 8: Summary & Team Alignment
# ==========================================
slide8 = prs.slides.add_slide(prs.slide_layouts[6])
add_header(slide8, "Summary & Project Readiness")

tb8 = slide8.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(11.7), Inches(5.0))
tf8 = tb8.text_frame
tf8.word_wrap = True

summary_points = [
    ("Audit Summary:", " Prashant Jain completed key backend domain modules[cite: 5], though timing and documentation entries showed variations between tracking logs[cite: 8] and Developer Diary entries[cite: 5]."),
    ("Frontend Readiness:", " Core frontend architecture (Lakshya Singhal) is 100% built, compiled with zero errors, and ready for full REST API integration[cite: 7]."),
    ("Next Steps:", " Connect Spring Boot services to frontend API client hooks and execute full end-to-end integration testing[cite: 6, 7].")
]

for title, desc in summary_points:
    p = tf8.add_paragraph()
    p.space_before = Pt(10)
    r1 = p.add_run()
    r1.text = title + " "
    r1.font.name = FONT_FAMILY
    r1.font.size = Pt(18)
    r1.font.bold = True
    r1.font.color.rgb = COLOR_TITLE
    
    r2 = p.add_run()
    r2.text = desc
    r2.font.name = FONT_FAMILY
    r2.font.size = Pt(17)
    r2.font.color.rgb = COLOR_TEXT

# Save Presentation
prs.save("Team_Work_Analysis_Presentation.pptx")
print("Presentation generated successfully: Team_Work_Analysis_Presentation.pptx")