import os
import sys
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

artifact_dir = r"C:\Users\singh\.gemini\antigravity\brain\b9078291-b037-47a0-99b1-4720a67e5634"
md_path = os.path.join(artifact_dir, "Institutional_ERP_Development_Progress_Report.md")
docx_path_brain = os.path.join(artifact_dir, "Institutional_ERP_Development_Progress_Report.docx")
docx_path_docs = r"c:\Users\singh\OneDrive\Desktop\AI-RESEARCH\personal_report\5th-SemResearch\frontend-design-system\docs\Institutional_ERP_Development_Progress_Report.docx"

print("Starting generation script...")
