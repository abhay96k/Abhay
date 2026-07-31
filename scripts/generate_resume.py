import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

def generate_pdf():
    pdf_path = os.path.join(os.path.dirname(__file__), "..", "public", "Abhay_Chavan_Resume.pdf")
    pdf_path = os.path.abspath(pdf_path)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Brand Palette
    primary_color = colors.HexColor("#171717")
    accent_color = colors.HexColor("#C56E33")
    sec_color = colors.HexColor("#325C5A")
    text_muted = colors.HexColor("#444444")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=primary_color
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=accent_color
    )

    contact_style = ParagraphStyle(
        'ContactInfo',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=text_muted,
        alignment=TA_RIGHT
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=primary_color,
        spaceAfter=3
    )

    body_bold = ParagraphStyle(
        'BodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=primary_color
    )

    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#333333")
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#333333"),
        leftIndent=12
    )

    sub_info = ParagraphStyle(
        'SubInfo',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=12,
        textColor=sec_color
    )

    date_style = ParagraphStyle(
        'DateStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=accent_color,
        alignment=TA_RIGHT
    )

    story = []

    # --- HEADER SECTION ---
    header_left = [
        Paragraph("<b>ABHAY CHAVAN</b>", title_style),
        Spacer(1, 2),
        Paragraph("Computer Science Student | Full-Stack Developer", subtitle_style)
    ]

    header_right = [
        Paragraph("Email: <b>abhaychavan672@gmail.com</b>", contact_style),
        Paragraph("Phone: <b>+91 9148864651</b>", contact_style),
        Paragraph("Location: <b>Belgavi, Karnataka, India</b>", contact_style),
        Paragraph("GitHub: <b>github.com/abhay96k</b>", contact_style),
        Paragraph("LinkedIn: <b>linkedin.com/in/abhay-chavan96</b>", contact_style)
    ]

    header_table = Table([[header_left, header_right]], colWidths=[310, 230])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))

    story.append(header_table)
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=accent_color, spaceBefore=2, spaceAfter=8))

    # --- SUMMARY ---
    story.append(Paragraph("SUMMARY", section_heading))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#DDDDDD"), spaceBefore=1, spaceAfter=6))
    summary_text = (
        "Computer Science student with practical experience in designing and developing full-stack web applications. "
        "Strong analytical, problem-solving, and teamwork skills, with a keen interest in software engineering and emerging technologies."
    )
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 10))

    # --- EDUCATION ---
    story.append(Paragraph("EDUCATION", section_heading))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#DDDDDD"), spaceBefore=1, spaceAfter=6))

    edu_title = [Paragraph("<b>Computer Science and Engineering</b>", body_bold),
                 Paragraph("Angadi Institute of Technology and Management, Belgavi", sub_info)]
    edu_date = [Paragraph("09/2024 – 06/2028", date_style)]
    edu_table = Table([[edu_title, edu_date]], colWidths=[410, 130])
    edu_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(edu_table)
    story.append(Spacer(1, 3))
    story.append(Paragraph("• Status: <b>3rd Year Student</b>", bullet_style))
    story.append(Paragraph("• CGPA: <b>8.0</b>", bullet_style))
    story.append(Spacer(1, 10))

    # --- SKILLS ---
    story.append(Paragraph("SKILLS", section_heading))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#DDDDDD"), spaceBefore=1, spaceAfter=6))

    skills_data = [
        [Paragraph("<b>Programming Languages:</b>", body_bold), Paragraph("C, C++, Python, HTML, CSS", body_style)],
        [Paragraph("<b>Databases & Web:</b>", body_bold), Paragraph("MongoDB, Full-Stack Web Development (MERN)", body_style)],
        [Paragraph("<b>Soft Skills:</b>", body_bold), Paragraph("Strong Analytical, Problem-Solving, Teamwork", body_style)]
    ]
    skills_table = Table(skills_data, colWidths=[140, 400])
    skills_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(skills_table)
    story.append(Spacer(1, 10))

    # --- PROJECTS ---
    story.append(Paragraph("PROJECTS", section_heading))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#DDDDDD"), spaceBefore=1, spaceAfter=6))

    p1_title = [Paragraph("<b>Mess Tiffen Management Application</b>", body_bold)]
    story.append(p1_title[0])
    story.append(Spacer(1, 2))
    story.append(Paragraph("• Developed a Mess and Tiffin Management application with role-based access, meal scheduling, and automated billing features.", bullet_style))
    story.append(Paragraph("• Designed to optimize daily headcount tracking for vendors and subscription workflows for users.", bullet_style))
    story.append(Spacer(1, 10))

    # --- LANGUAGES ---
    story.append(Paragraph("LANGUAGES", section_heading))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#DDDDDD"), spaceBefore=1, spaceAfter=6))
    story.append(Paragraph("English  •  Hindi  •  Kannada  •  Marathi", body_style))
    story.append(Spacer(1, 10))

    # --- INTERESTS ---
    story.append(Paragraph("INTERESTS", section_heading))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#DDDDDD"), spaceBefore=1, spaceAfter=6))
    story.append(Paragraph("Artificial Intelligence  •  Full-stack Development  •  Coding & Building Projects  •  Listening to Music", body_style))

    doc.build(story)
    print("PDF generated successfully at:", pdf_path)

if __name__ == "__main__":
    generate_pdf()
