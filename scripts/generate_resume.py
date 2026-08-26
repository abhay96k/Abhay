import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

def create_section_header(title, style):
    p = Paragraph(f"<b>{title}</b>", style)
    t = Table([[p]], colWidths=[540])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#EAECEE")),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    return t

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

    # Colors
    text_primary = colors.HexColor("#1A2B4C")
    text_body = colors.HexColor("#222222")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=text_primary
    )

    contact_style = ParagraphStyle(
        'ContactInfo',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=text_body
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=text_primary,
        alignment=TA_CENTER
    )

    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=text_body
    )

    body_bold = ParagraphStyle(
        'BodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=14,
        textColor=text_body
    )

    sub_info = ParagraphStyle(
        'SubInfo',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9.5,
        leading=14,
        textColor=text_body
    )

    story = []

    # --- HEADER SECTION ---
    header_name = Paragraph("<b>Abhay Chavan</b> &nbsp;&nbsp;<font size=13 color='#1A2B4C'><i>Student</i></font>", title_style)
    story.append(header_name)
    story.append(Spacer(1, 8))

    contact_left = [
        Paragraph("Email: <b>abhaychavan672@gmail.com</b>", contact_style),
        Paragraph("Location: <b>Belgavi, India</b>", contact_style),
        Paragraph("GitHub: <b>github.com/abhay96k</b>", contact_style)
    ]
    contact_right = [
        Paragraph("Phone: <b>9148864651</b>", contact_style),
        Paragraph("LinkedIn: <b>linkedin.com/in/abhay-chavan96</b>", contact_style)
    ]

    contact_table = Table([[contact_left, contact_right]], colWidths=[300, 240])
    contact_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(contact_table)
    story.append(Spacer(1, 12))

    # --- SUMMARY ---
    story.append(create_section_header("Summary", section_heading))
    story.append(Spacer(1, 8))
    summary_text = (
        "Computer Science student with practical experience in designing and developing full-stack web applications. "
        "Strong analytical, problem-solving, and teamwork skills, with a keen interest in software engineering and emerging technologies."
    )
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 12))

    # --- EDUCATION ---
    story.append(create_section_header("Education", section_heading))
    story.append(Spacer(1, 8))

    edu_left = [
        Paragraph("<b>09/2024 – 06/2028</b>", body_style),
        Paragraph("Belgavi, Karnataka, India", body_style)
    ]
    edu_right = [
        Paragraph("<b>Computer science and engineering,</b>", body_bold),
        Paragraph("<i>Angadi Institute of Technology and Management, Belgavi</i>", sub_info),
        Paragraph("• 2nd year", body_style),
        Paragraph("• CGPA : 8.5", body_style)
    ]

    edu_table = Table([[edu_left, edu_right]], colWidths=[160, 380])
    edu_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(edu_table)
    story.append(Spacer(1, 12))

    # --- SKILLS ---
    story.append(create_section_header("Skills", section_heading))
    story.append(Spacer(1, 8))

    skills_col1 = [Paragraph("• HTML", body_style), Paragraph("• Python", body_style)]
    skills_col2 = [Paragraph("• C++", body_style), Paragraph("• CSS", body_style)]
    skills_col3 = [Paragraph("• C", body_style), Paragraph("• Mongodb", body_style)]

    skills_table = Table([[skills_col1, skills_col2, skills_col3]], colWidths=[180, 180, 180])
    skills_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(skills_table)
    story.append(Spacer(1, 12))

    # --- LANGUAGES ---
    story.append(create_section_header("Languages", section_heading))
    story.append(Spacer(1, 8))

    lang_col1 = [Paragraph("• English", body_style), Paragraph("• Marathi", body_style)]
    lang_col2 = [Paragraph("• Hindi", body_style)]
    lang_col3 = [Paragraph("• Kannada", body_style)]

    lang_table = Table([[lang_col1, lang_col2, lang_col3]], colWidths=[180, 180, 180])
    lang_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(lang_table)
    story.append(Spacer(1, 12))

    # --- PROJECTS ---
    story.append(create_section_header("Projects", section_heading))
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Mess Tiffen Management</b>", body_bold))
    story.append(Spacer(1, 2))
    story.append(Paragraph("Developing a Mess and Tiffin Management application with role-based access, meal scheduling, and automated billing features.", body_style))
    story.append(Spacer(1, 12))

    # --- INTERESTS ---
    story.append(create_section_header("Interests", section_heading))
    story.append(Spacer(1, 8))
    interests_text = "Artificial Intelligence  •  Full-stack Development  •  Listening Music  •  Coding and building small projects"
    story.append(Paragraph(interests_text, body_style))

    doc.build(story)
    print("PDF generated successfully at:", pdf_path)

if __name__ == "__main__":
    generate_pdf()

