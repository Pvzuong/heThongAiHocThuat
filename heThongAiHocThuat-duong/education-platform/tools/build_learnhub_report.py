# -*- coding: utf-8 -*-
from pathlib import Path
import math
import textwrap

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "report_artifacts"
OUT_DIR.mkdir(exist_ok=True)
OUTPUT_DOCX = ROOT / "BaoCao_DoAn_LearnHub_v3_HoanChinh.docx"


BLUE = "000000"
DARK_BLUE = "000000"
LIGHT_BLUE = "E8EEF5"
LIGHT_GRAY = "F2F4F7"
MID_GRAY = "D9E2F3"
TEXT = "1F2937"
BORDER = "A6A6A6"
GREEN = "2E7D32"
AMBER = "B7791F"
RED = "B91C1C"


def font(size=28, bold=False):
    candidates = [
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\calibrib.ttf" if bold else r"C:\Windows\Fonts\calibri.ttf",
    ]
    for p in candidates:
        if Path(p).exists():
            return ImageFont.truetype(p, size=size)
    return ImageFont.load_default()


F_REG = font(26)
F_SM = font(22)
F_XS = font(18)
F_BOLD = font(26, True)
F_TITLE = font(34, True)


def wrap_lines(text, width):
    return textwrap.wrap(text, width=width, break_long_words=False, replace_whitespace=False)


def text_center(draw, box, text, fill=(31, 41, 55), fnt=F_REG, max_chars=24, line_gap=6):
    x1, y1, x2, y2 = box
    lines = []
    for part in text.split("\n"):
        lines.extend(wrap_lines(part, max_chars) or [""])
    heights = [draw.textbbox((0, 0), line, font=fnt)[3] for line in lines]
    total_h = sum(heights) + max(0, len(lines) - 1) * line_gap
    y = y1 + (y2 - y1 - total_h) / 2
    for line, h in zip(lines, heights):
        bbox = draw.textbbox((0, 0), line, font=fnt)
        w = bbox[2] - bbox[0]
        draw.text((x1 + (x2 - x1 - w) / 2, y), line, fill=fill, font=fnt)
        y += h + line_gap


def rounded(draw, box, fill, outline=(46, 116, 181), radius=24, width=3):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def arrow(draw, start, end, fill=(46, 116, 181), width=4):
    draw.line([start, end], fill=fill, width=width)
    x1, y1 = start
    x2, y2 = end
    ang = math.atan2(y2 - y1, x2 - x1)
    size = 14
    pts = [
        (x2, y2),
        (x2 - size * math.cos(ang - math.pi / 6), y2 - size * math.sin(ang - math.pi / 6)),
        (x2 - size * math.cos(ang + math.pi / 6), y2 - size * math.sin(ang + math.pi / 6)),
    ]
    draw.polygon(pts, fill=fill)


def draw_actor(draw, x, y, label):
    draw.ellipse((x - 18, y, x + 18, y + 36), outline=(31, 77, 120), width=4)
    draw.line((x, y + 36, x, y + 105), fill=(31, 77, 120), width=4)
    draw.line((x - 45, y + 60, x + 45, y + 60), fill=(31, 77, 120), width=4)
    draw.line((x, y + 105, x - 38, y + 160), fill=(31, 77, 120), width=4)
    draw.line((x, y + 105, x + 38, y + 160), fill=(31, 77, 120), width=4)
    text_center(draw, (x - 110, y + 170, x + 110, y + 230), label, fnt=F_BOLD, max_chars=18)


def save_diagram(name, title, draw_fn, size=(1500, 1000)):
    img = Image.new("RGB", size, "white")
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, size[0] - 1, size[1] - 1), outline=(218, 225, 232), width=2)
    d.text((50, 36), title, fill=(31, 77, 120), font=F_TITLE)
    d.line((50, 88, size[0] - 50, 88), fill=(46, 116, 181), width=3)
    draw_fn(d)
    path = OUT_DIR / f"{name}.png"
    img.save(path, quality=95)
    return path


def diagram_architecture():
    def fn(d):
        boxes = [
            ((140, 170, 1360, 320), "Presentation Layer\nReact SPA, React Router, Axios, Context API"),
            ((140, 410, 1360, 560), "Business Logic Layer\nExpress Routes, Controllers, Auth/Role Middleware, Gemini Service"),
            ((140, 650, 1360, 800), "Data Layer\nPostgreSQL, migrations, seed data, JSONB, indexes"),
        ]
        for box, label in boxes:
            rounded(d, box, fill=(232, 238, 245), outline=(46, 116, 181), radius=22)
            text_center(d, box, label, fnt=F_BOLD, max_chars=70)
        arrow(d, (750, 320), (750, 410))
        arrow(d, (750, 560), (750, 650))
        rounded(d, (1000, 830, 1360, 930), "white", outline=(46, 116, 181), radius=18)
        text_center(d, (1000, 830, 1360, 930), "External Services\nGemini AI, Gmail SMTP", fnt=F_REG, max_chars=30)
        arrow(d, (1180, 560), (1180, 830))
    return save_diagram("01_architecture", "Hình 3.1. Kiến trúc tổng thể hệ thống", fn)


def diagram_use_case():
    def fn(d):
        d.rounded_rectangle((300, 130, 1205, 910), radius=30, outline=(46, 116, 181), width=4)
        d.text((630, 150), "LearnHub", fill=(31, 77, 120), font=F_TITLE)
        draw_actor(d, 130, 250, "Student")
        draw_actor(d, 130, 635, "Guest")
        draw_actor(d, 1370, 260, "Admin")
        draw_actor(d, 1370, 650, "Gemini AI")
        cases = [
            (395, 235, 680, 305, "Đăng ký, đăng nhập", "guest"),
            (395, 345, 680, 415, "Học phổ thông", "student"),
            (395, 455, 680, 525, "Làm placement test", "student"),
            (395, 565, 680, 635, "Học theo lộ trình", "student"),
            (395, 675, 680, 745, "Xem dashboard", "student"),
            (790, 345, 1085, 415, "Tạo câu hỏi AI", "ai"),
            (790, 455, 1085, 525, "Luyện tập AI", "ai"),
            (790, 665, 1085, 735, "Quản lý nội dung", "admin"),
            (790, 775, 1085, 845, "Cấu hình Gemini", "admin"),
        ]
        centers = {}
        for x1, y1, x2, y2, label, role in cases:
            d.ellipse((x1, y1, x2, y2), fill=(242, 246, 250), outline=(31, 77, 120), width=3)
            text_center(d, (x1, y1, x2, y2), label, fnt=F_SM, max_chars=22)
            centers[label] = ((x1 + x2) // 2, (y1 + y2) // 2, role)
        # Student associations: keep them on the left side to avoid crossings.
        for label in ["Học phổ thông", "Làm placement test", "Học theo lộ trình", "Xem dashboard"]:
            x, y, _ = centers[label]
            d.line((225, 375, 395, y), fill=(110, 128, 150), width=3)
        # Guest only uses auth.
        x, y, _ = centers["Đăng ký, đăng nhập"]
        d.line((225, 760, 395, y), fill=(110, 128, 150), width=3)
        # Admin associations.
        for label in ["Quản lý nội dung", "Cấu hình Gemini"]:
            x, y, _ = centers[label]
            d.line((1278, 385, 1085, y), fill=(110, 128, 150), width=3)
        # Gemini AI supports AI generation and AI practice.
        for label in ["Tạo câu hỏi AI", "Luyện tập AI", "Cấu hình Gemini"]:
            x, y, _ = centers[label]
            d.line((1278, 775, 1085, y), fill=(110, 128, 150), width=3)
    return save_diagram("02_use_case", "Hình 3.2. Use Case Diagram tổng quát", fn)


def draw_flow(d, steps, start_x=170, start_y=150, box_w=480, box_h=80, gap=45):
    y = start_y
    for i, step in enumerate(steps):
        box = (start_x, y, start_x + box_w, y + box_h)
        fill = (232, 238, 245) if i == 0 or i == len(steps) - 1 else (248, 250, 252)
        rounded(d, box, fill=fill, outline=(46, 116, 181), radius=18, width=3)
        text_center(d, box, step, fnt=F_SM, max_chars=34)
        if i < len(steps) - 1:
            arrow(d, (start_x + box_w / 2, y + box_h), (start_x + box_w / 2, y + box_h + gap - 5))
        y += box_h + gap


def diagram_activity_placement():
    def fn(d):
        steps = [
            "Bắt đầu: Student chọn lộ trình hoặc môn học",
            "Hệ thống tải bài đánh giá đầu vào",
            "Student trả lời toàn bộ câu hỏi",
            "Nộp bài và gửi đáp án lên API",
            "API chấm điểm có trọng số theo độ khó",
            "Tính điểm từng module/chapter",
            "Chọn điểm bắt đầu đầu tiên dưới ngưỡng 80%",
            "Lưu kết quả và roadmap cá nhân hóa",
            "Kết thúc: hiển thị lộ trình đề xuất",
        ]
        draw_flow(d, steps, 110, 140, 560, 72, 28)
        d.polygon([(880, 370), (1040, 450), (880, 530), (720, 450)], fill=(255, 248, 225), outline=(183, 121, 31))
        text_center(d, (735, 400, 1025, 500), "Đủ dữ liệu\nchấm điểm?", fnt=F_SM, max_chars=16)
        arrow(d, (670, 450), (720, 450))
        arrow(d, (1040, 450), (1180, 450))
        rounded(d, (1180, 405, 1420, 495), fill=(235, 248, 238), outline=(46, 125, 50))
        text_center(d, (1180, 405, 1420, 495), "Có: sinh roadmap", fnt=F_SM)
        arrow(d, (880, 530), (880, 680), fill=(183, 121, 31))
        rounded(d, (720, 680, 1040, 770), fill=(255, 245, 245), outline=(185, 28, 28))
        text_center(d, (720, 680, 1040, 770), "Không: yêu cầu làm đủ câu\nhoặc báo lỗi dữ liệu", fnt=F_SM, max_chars=28)
    return save_diagram("03_activity_placement", "Hình 3.3. Activity Diagram - Đánh giá đầu vào", fn, size=(1500, 1180))


def diagram_sequence_placement():
    def fn(d):
        actors = ["Student", "Placement UI", "Placement API", "Scoring Service", "Database"]
        xs = [150, 440, 730, 1020, 1310]
        for x, name in zip(xs, actors):
            rounded(d, (x - 95, 130, x + 95, 190), fill=(232, 238, 245), outline=(46, 116, 181), radius=14)
            text_center(d, (x - 95, 130, x + 95, 190), name, fnt=F_SM, max_chars=16)
            d.line((x, 190, x, 880), fill=(150, 160, 170), width=2)
        messages = [
            (0, 1, 250, "Chọn làm bài đánh giá"),
            (1, 2, 320, "GET placement test"),
            (2, 4, 390, "SELECT test + questions"),
            (4, 2, 460, "Trả về dữ liệu câu hỏi"),
            (2, 1, 530, "Danh sách câu hỏi"),
            (0, 1, 600, "Nộp đáp án"),
            (1, 2, 670, "POST answers"),
            (2, 3, 740, "Chấm điểm + tìm start point"),
            (3, 4, 810, "INSERT placement_result"),
            (2, 1, 870, "Roadmap cá nhân hóa"),
        ]
        for a, b, y, msg in messages:
            arrow(d, (xs[a], y), (xs[b], y), width=3)
            d.text((min(xs[a], xs[b]) + 18, y - 28), msg, fill=(31, 41, 55), font=F_XS)
    return save_diagram("04_sequence_placement", "Hình 3.4. Sequence Diagram - Placement Test", fn)


def diagram_activity_ai():
    def fn(d):
        steps = [
            "Student mở AI Question Generator",
            "Nhập lớp/môn/chủ đề/độ khó/số câu",
            "Client gửi yêu cầu sinh câu hỏi",
            "API kiểm tra đăng nhập và rate limit",
            "Gemini Service xây dựng prompt",
            "Gọi Google Gemini API",
            "Parse JSON, validate và làm sạch câu hỏi",
            "Lưu collection và generated_questions",
            "Student làm bài trong AI Practice Arena",
            "Nộp bài, lưu attempts và session result",
        ]
        draw_flow(d, steps, 120, 135, 580, 68, 20)
        d.polygon([(930, 340), (1090, 420), (930, 500), (770, 420)], fill=(255, 248, 225), outline=(183, 121, 31))
        text_center(d, (790, 370, 1070, 470), "Gemini trả JSON\nhợp lệ?", fnt=F_SM, max_chars=18)
        arrow(d, (700, 420), (770, 420))
        rounded(d, (1160, 375, 1420, 465), fill=(235, 248, 238), outline=(46, 125, 50))
        text_center(d, (1160, 375, 1420, 465), "Có: lưu vào DB", fnt=F_SM)
        arrow(d, (1090, 420), (1160, 420))
        rounded(d, (760, 630, 1100, 720), fill=(255, 245, 245), outline=(185, 28, 28))
        text_center(d, (760, 630, 1100, 720), "Không: retry tối đa 2 lần\nhoặc trả lỗi", fnt=F_SM, max_chars=26)
        arrow(d, (930, 500), (930, 630), fill=(183, 121, 31))
    return save_diagram("05_activity_ai", "Hình 3.5. Activity Diagram - Tạo và luyện câu hỏi AI", fn, size=(1500, 1160))


def diagram_sequence_ai():
    def fn(d):
        actors = ["Student", "AI Generator UI", "Gemini API Route", "Gemini Service", "Google Gemini", "PostgreSQL"]
        xs = [100, 350, 610, 870, 1120, 1370]
        for x, name in zip(xs, actors):
            rounded(d, (x - 90, 125, x + 90, 190), fill=(232, 238, 245), outline=(46, 116, 181), radius=14)
            text_center(d, (x - 90, 125, x + 90, 190), name, fnt=F_XS, max_chars=15)
            d.line((x, 190, x, 900), fill=(150, 160, 170), width=2)
        messages = [
            (0, 1, 245, "Cấu hình bộ câu hỏi"),
            (1, 2, 315, "POST /generate-questions"),
            (2, 5, 385, "COUNT collections trong 1 giờ"),
            (2, 3, 455, "generateQuestions(config)"),
            (3, 4, 525, "generateContent(prompt)"),
            (4, 3, 595, "JSON text"),
            (3, 2, 665, "questions đã validate"),
            (2, 5, 735, "INSERT collection + questions"),
            (2, 1, 805, "collectionId + questions"),
            (0, 1, 875, "Làm bài ngay"),
        ]
        for a, b, y, msg in messages:
            arrow(d, (xs[a], y), (xs[b], y), width=3)
            d.text((min(xs[a], xs[b]) + 12, y - 27), msg, fill=(31, 41, 55), font=F_XS)
    return save_diagram("06_sequence_ai", "Hình 3.6. Sequence Diagram - Sinh câu hỏi AI", fn)


def diagram_erd():
    def entity(d, x, y, w, h, title, fields):
        rounded(d, (x, y, x + w, y + h), fill=(248, 250, 252), outline=(31, 77, 120), radius=10, width=3)
        d.rectangle((x, y, x + w, y + 44), fill=(232, 238, 245), outline=(31, 77, 120), width=2)
        text_center(d, (x, y + 4, x + w, y + 42), title, fnt=F_XS, max_chars=24)
        yy = y + 56
        for f in fields:
            d.text((x + 16, yy), f, fill=(31, 41, 55), font=F_XS)
            yy += 26
    def rel(d, p1, p2, label):
        arrow(d, p1, p2, fill=(100, 116, 139), width=3)
        mx, my = (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2
        d.rectangle((mx - 38, my - 16, mx + 38, my + 16), fill="white")
        text_center(d, (mx - 38, my - 16, mx + 38, my + 16), label, fnt=F_XS, max_chars=8)
    def fn(d):
        entity(d, 60, 130, 250, 180, "users", ["PK id", "email", "role", "is_verified"])
        entity(d, 430, 130, 260, 200, "skill_paths", ["PK id", "title", "slug", "difficulty"])
        entity(d, 800, 130, 270, 200, "skill_modules", ["PK id", "FK path_id", "title", "sort_order"])
        entity(d, 1160, 130, 270, 200, "skill_lessons", ["PK id", "FK module_id", "content_html"])
        entity(d, 430, 420, 260, 210, "placement_tests", ["PK id", "FK path_id", "title", "time_limit"])
        entity(d, 800, 420, 270, 230, "placement_questions", ["PK id", "FK test_id", "FK module_id", "correct_answer", "difficulty_level"])
        entity(d, 1160, 440, 270, 210, "placement_results", ["PK id", "FK user_id", "FK test_id", "score JSONB", "recommended_module"])
        entity(d, 60, 420, 250, 210, "lesson_progress", ["PK id", "FK user_id", "FK lesson_id", "is_completed"])
        entity(d, 60, 710, 250, 210, "question_collections", ["PK id", "FK user_id", "subject", "difficulty"])
        entity(d, 430, 710, 260, 210, "generated_questions", ["PK id", "FK collection_id", "question_type", "correct_answer"])
        entity(d, 800, 730, 270, 190, "generated_results", ["PK id", "FK user_id", "FK collection_id", "score_percent"])
        rel(d, (690, 230), (800, 230), "1-n")
        rel(d, (1070, 230), (1160, 230), "1-n")
        rel(d, (560, 330), (560, 420), "1-n")
        rel(d, (690, 525), (800, 525), "1-n")
        rel(d, (1070, 540), (1160, 540), "1-n")
        rel(d, (310, 220), (430, 520), "1-n")
        rel(d, (310, 800), (430, 800), "1-n")
        rel(d, (690, 815), (800, 815), "1-n")
        rel(d, (310, 505), (60, 505), "1-n")
    return save_diagram("07_erd", "Hình 3.7. ERD rút gọn của hệ thống", fn, size=(1500, 1050))


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_border(cell, color="D0D7DE", size="6"):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcBorders = tcPr.first_child_found_in("w:tcBorders")
    if tcBorders is None:
        tcBorders = OxmlElement("w:tcBorders")
        tcPr.append(tcBorders)
    for edge in ("top", "left", "bottom", "right"):
        tag = "w:{}".format(edge)
        element = tcBorders.find(qn(tag))
        if element is None:
            element = OxmlElement(tag)
            tcBorders.append(element)
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), size)
        element.set(qn("w:space"), "0")
        element.set(qn("w:color"), color)


def set_table_width(table, widths):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for row in table.rows:
        for idx, width in enumerate(widths):
            if idx < len(row.cells):
                row.cells[idx].width = Inches(width)
                row.cells[idx].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
                set_cell_border(row.cells[idx])


def set_font(run, name="Times New Roman", size=13, color=None, bold=None, italic=None):
    run.font.name = name
    run._element.rPr.rFonts.set(qn("w:ascii"), name)
    run._element.rPr.rFonts.set(qn("w:hAnsi"), name)
    run._element.rPr.rFonts.set(qn("w:eastAsia"), name)
    run.font.size = Pt(size)
    if color:
        run.font.color.rgb = RGBColor.from_string(color)
    if bold is not None:
        run.bold = bold
    if italic is not None:
        run.italic = italic


def style_doc(doc):
    section = doc.sections[0]
    section.page_width = Inches(8.27)
    section.page_height = Inches(11.69)
    for sec in doc.sections:
        sec.top_margin = Inches(0.787)
        sec.bottom_margin = Inches(0.984)
        sec.left_margin = Inches(1.181)
        sec.right_margin = Inches(0.787)
        sec.header_distance = Inches(0.35)
        sec.footer_distance = Inches(0.35)
        sec.different_first_page_header_footer = True

    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Times New Roman"
    normal._element.rPr.rFonts.set(qn("w:ascii"), "Times New Roman")
    normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Times New Roman")
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    normal.font.size = Pt(13)
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.5

    for name, size, color, before, after in [
        ("Title", 18, "000000", 0, 10),
        ("Heading 1", 16, BLUE, 14, 8),
        ("Heading 2", 14, BLUE, 10, 6),
        ("Heading 3", 14, DARK_BLUE, 8, 4),
    ]:
        st = styles[name]
        st.font.name = "Times New Roman"
        st._element.rPr.rFonts.set(qn("w:ascii"), "Times New Roman")
        st._element.rPr.rFonts.set(qn("w:hAnsi"), "Times New Roman")
        st._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
        st.font.size = Pt(size)
        st.font.bold = True
        st.font.color.rgb = RGBColor.from_string(color)
        st.paragraph_format.space_before = Pt(before)
        st.paragraph_format.space_after = Pt(after)
        st.paragraph_format.keep_with_next = True
    styles["Heading 3"].font.italic = True


def add_footer(doc):
    for section in doc.sections:
        footer = section.footer
        p = footer.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run()
        fld_begin = OxmlElement("w:fldChar")
        fld_begin.set(qn("w:fldCharType"), "begin")
        instr = OxmlElement("w:instrText")
        instr.set(qn("xml:space"), "preserve")
        instr.text = "PAGE"
        fld_sep = OxmlElement("w:fldChar")
        fld_sep.set(qn("w:fldCharType"), "separate")
        fld_text = OxmlElement("w:t")
        fld_text.text = "1"
        fld_end = OxmlElement("w:fldChar")
        fld_end.set(qn("w:fldCharType"), "end")
        run._r.append(fld_begin)
        run._r.append(instr)
        run._r.append(fld_sep)
        run._r.append(fld_text)
        run._r.append(fld_end)
        set_font(run, size=13)


def add_p(doc, text="", style=None, align=None, bold_prefix=None):
    p = doc.add_paragraph(style=style)
    if align:
        p.alignment = align
    if bold_prefix and text.startswith(bold_prefix):
        r = p.add_run(bold_prefix)
        set_font(r, bold=True)
        r2 = p.add_run(text[len(bold_prefix):])
        set_font(r2)
    else:
        r = p.add_run(text)
        set_font(r)
    return p


def add_bullets(doc, items):
    for item in items:
        p = doc.add_paragraph(style="List Bullet")
        p.paragraph_format.space_after = Pt(3)
        r = p.add_run(item)
        set_font(r)


def add_numbered(doc, items):
    for item in items:
        p = doc.add_paragraph(style="List Number")
        p.paragraph_format.space_after = Pt(3)
        r = p.add_run(item)
        set_font(r)


def add_table(doc, headers, rows, widths=None):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    hdr = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr[i].text = h
        set_cell_shading(hdr[i], LIGHT_BLUE)
        set_cell_border(hdr[i], "A8B9CC")
        for p in hdr[i].paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in p.runs:
                set_font(run, size=11, bold=True, color="000000")
    for row in rows:
        cells = table.add_row().cells
        for i, val in enumerate(row):
            cells[i].text = str(val)
            set_cell_border(cells[i])
            for p in cells[i].paragraphs:
                for run in p.runs:
                    set_font(run, size=11)
    if widths:
        set_table_width(table, widths)
    doc.add_paragraph()
    return table


def add_caption(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(text)
    set_font(r, size=12, italic=True, color="000000")


def add_figure(doc, path, caption, width=6.1):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run().add_picture(str(path), width=Inches(width))
    add_caption(doc, caption)


def add_callout(doc, title, body, fill=LIGHT_GRAY):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    set_cell_shading(cell, fill)
    set_cell_border(cell, "D0D7DE")
    p = cell.paragraphs[0]
    r = p.add_run(title + ": ")
    set_font(r, size=10, bold=True, color=DARK_BLUE)
    r2 = p.add_run(body)
    set_font(r2, size=10)
    doc.add_paragraph()


def cover(doc):
    for text in [
        "BỘ GIÁO DỤC VÀ ĐÀO TẠO",
        "TRƯỜNG ĐẠI HỌC CÔNG NGHỆ TP. HCM",
    ]:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(text)
        set_font(r, size=13, bold=True)
    for _ in range(5):
        doc.add_paragraph()
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("ĐỒ ÁN MÔN HỌC CÔNG NGHỆ PHẦN MỀM")
    set_font(r, size=18, bold=True)
    for _ in range(4):
        doc.add_paragraph()
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("HỆ THỐNG HỌC TẬP CÁ NHÂN HÓA\nTÍCH HỢP AI")
    set_font(r, size=18, bold=True)
    for _ in range(3):
        doc.add_paragraph()
    cover_lines = [
        ("Ngành:", "CÔNG NGHỆ THÔNG TIN"),
        ("Giảng viên hướng dẫn:", "ThS. Võ Tấn Dũng"),
        ("Sinh viên thực hiện:", "Nguyễn Tiến Thịnh - MSSV: 2380602244"),
        ("Sinh viên thực hiện:", "Phạm Văn Dương - MSSV: 2380600399"),
        ("Lớp:", "23DTHA2"),
    ]
    for label, value in cover_lines:
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Inches(1.05)
        r = p.add_run(label + " ")
        set_font(r, size=13, bold=True)
        r2 = p.add_run(value)
        set_font(r2, size=13)
    for _ in range(4):
        doc.add_paragraph()
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("TP. Hồ Chí Minh, 2026")
    set_font(r, size=13, bold=True)
    doc.add_page_break()


def declaration_and_toc(doc):
    doc.add_heading("LỜI CAM ĐOAN", 1)
    add_p(doc, "Nhóm sinh viên cam đoan báo cáo đồ án này là kết quả nghiên cứu, phân tích và xây dựng hệ thống của nhóm. Các nội dung mô tả chức năng, kiến trúc, cơ sở dữ liệu và thiết kế sơ đồ được tổng hợp từ source code của dự án LearnHub và định hướng hoàn thiện sản phẩm.")
    add_p(doc, "Những tài liệu tham khảo, công nghệ và thư viện được sử dụng trong quá trình thực hiện đều được nêu rõ ở phần tài liệu tham khảo. Nhóm chịu trách nhiệm về tính trung thực của nội dung báo cáo.")
    doc.add_paragraph()
    add_p(doc, "TP. Hồ Chí Minh, năm 2026", align=WD_ALIGN_PARAGRAPH.RIGHT)
    add_p(doc, "Sinh viên thực hiện", align=WD_ALIGN_PARAGRAPH.RIGHT)
    doc.add_page_break()

    doc.add_heading("MỤC LỤC", 1)
    toc = [
        "CHƯƠNG 1. TỔNG QUAN",
        "1.1. Giới thiệu đề tài",
        "1.2. Mục tiêu, phạm vi và đối tượng sử dụng",
        "1.3. Mô tả tổng thể hệ thống",
        "CHƯƠNG 2. CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ",
        "2.1. React.js và kiến trúc SPA",
        "2.2. Node.js, Express.js và REST API",
        "2.3. PostgreSQL và thiết kế dữ liệu",
        "2.4. Google Gemini AI",
        "2.5. JWT, OTP và bảo mật hệ thống",
        "CHƯƠNG 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG",
        "3.1. Kiến trúc tổng thể",
        "3.2. Actor và danh sách chức năng",
        "3.3. Use Case Diagram và đặc tả use case",
        "3.4. Activity Diagram",
        "3.5. Sequence Diagram",
        "3.6. Thiết kế cơ sở dữ liệu và ERD",
        "3.7. Thiết kế API và giao diện",
        "CHƯƠNG 4. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN",
        "TÀI LIỆU THAM KHẢO",
    ]
    for item in toc:
        p = doc.add_paragraph()
        r = p.add_run(item)
        set_font(r, size=10.5, bold=item.startswith("CHƯƠNG") or item == "TÀI LIỆU THAM KHẢO")
    doc.add_page_break()

    doc.add_heading("DANH MỤC CÁC CHỮ VIẾT TẮT", 1)
    add_table(doc, ["Chữ viết tắt", "Diễn giải"], [
        ("AI", "Artificial Intelligence - Trí tuệ nhân tạo"),
        ("API", "Application Programming Interface"),
        ("CRUD", "Create, Read, Update, Delete"),
        ("DB", "Database - Cơ sở dữ liệu"),
        ("ERD", "Entity Relationship Diagram"),
        ("JWT", "JSON Web Token"),
        ("LLM", "Large Language Model"),
        ("OTP", "One-Time Password"),
        ("REST", "Representational State Transfer"),
        ("SPA", "Single Page Application"),
        ("UI", "User Interface"),
        ("UML", "Unified Modeling Language"),
    ], [1.5, 4.8])
    doc.add_page_break()

    doc.add_heading("DANH MỤC CÁC BẢNG", 1)
    for item in [
        "Bảng 1.1. Actor và vai trò trong hệ thống",
        "Bảng 2.1. Các tầng xử lý trong backend",
        "Bảng 3.1. Actor hệ thống và chức năng chính",
        "Bảng 3.2. Nhóm chức năng hệ thống",
        "Bảng 3.3. Đặc tả Use Case - Đánh giá đầu vào",
        "Bảng 3.4. Đặc tả Use Case - Tạo và luyện tập bộ câu hỏi AI",
        "Bảng 3.5. Nhóm entity người dùng và xác thực",
        "Bảng 3.6. Nhóm entity nội dung học phổ thông",
        "Bảng 3.7. Nhóm entity lộ trình kỹ năng và placement",
        "Bảng 3.8. Nhóm entity câu hỏi AI và kết quả luyện tập",
        "Bảng 3.9. API chính của hệ thống",
        "Bảng 3.10. Thiết kế giao diện chính",
    ]:
        add_p(doc, item)
    doc.add_page_break()

    doc.add_heading("DANH MỤC CÁC HÌNH VẼ", 1)
    for item in [
        "Hình 3.1. Kiến trúc tổng thể hệ thống LearnHub",
        "Hình 3.2. Use Case Diagram tổng quát",
        "Hình 3.3. Activity Diagram - Đánh giá đầu vào và roadmap cá nhân",
        "Hình 3.4. Sequence Diagram - Placement Test",
        "Hình 3.5. Activity Diagram - Sinh câu hỏi AI và luyện tập",
        "Hình 3.6. Sequence Diagram - Sinh câu hỏi AI",
        "Hình 3.7. ERD rút gọn của hệ thống LearnHub",
    ]:
        add_p(doc, item)
    doc.add_page_break()


def chapter_1(doc):
    doc.add_heading("CHƯƠNG 1. TỔNG QUAN", 1)
    doc.add_heading("1.1. Giới thiệu đề tài", 2)
    add_p(doc, "Trong bối cảnh chuyển đổi số trong giáo dục đang diễn ra mạnh mẽ, các nền tảng học tập trực tuyến không chỉ cần cung cấp nội dung bài học mà còn cần cá nhân hóa quá trình học cho từng người dùng. Mỗi học viên có nền tảng kiến thức, tốc độ tiếp thu và mục tiêu khác nhau. Nếu tất cả người học cùng đi theo một lộ trình cố định, hệ thống dễ gây nhàm chán với người đã biết kiến thức cơ bản và gây quá tải với người bị hổng nền tảng.")
    add_p(doc, "Đề tài LearnHub được xây dựng với định hướng là một hệ thống học tập cá nhân hóa tích hợp AI. Hệ thống hỗ trợ người học lựa chọn lộ trình, làm bài đánh giá đầu vào, nhận gợi ý điểm bắt đầu phù hợp, học theo module, luyện tập bằng câu hỏi trong cơ sở dữ liệu và tạo bộ câu hỏi luyện tập bằng Google Gemini AI.")
    add_p(doc, "Khác với các hệ thống học trực tuyến chỉ tập trung hiển thị nội dung tĩnh, LearnHub kết hợp ba nhóm năng lực: quản lý nội dung học tập, theo dõi tiến độ cá nhân và sinh câu hỏi tự động bằng AI. Nhờ đó, người học có thể bắt đầu từ năng lực hiện tại, luyện tập theo nhu cầu cụ thể và theo dõi sự tiến bộ theo thời gian.")

    doc.add_heading("1.2. Mục tiêu đề tài", 2)
    add_bullets(doc, [
        "Xây dựng ứng dụng web học tập cá nhân hóa với giao diện thân thiện, responsive và dễ mở rộng.",
        "Thiết kế module học phổ thông theo cấu trúc lớp, môn học, chương, bài học và bài tập.",
        "Thiết kế module lộ trình kỹ năng gồm Skill Path, Module, Lesson và bài đánh giá đầu vào.",
        "Tích hợp Google Gemini AI để sinh bộ câu hỏi luyện tập và đề kiểm tra theo tham số người dùng.",
        "Xây dựng dashboard theo dõi tiến độ, lịch sử luyện tập, kết quả làm bài và hoạt động học tập.",
        "Xây dựng hệ thống quản trị cho Admin để quản lý người dùng, nội dung học và cấu hình Gemini.",
    ])

    doc.add_heading("1.3. Phạm vi và đối tượng sử dụng", 2)
    add_p(doc, "Phạm vi của đồ án tập trung vào nền tảng web học tập cá nhân sử dụng kiến trúc Client - Server. Phía client được xây dựng bằng React, phía server dùng Express.js và dữ liệu lưu trữ trên PostgreSQL. Hệ thống hướng đến hai nhóm actor chính trong phạm vi triển khai: Student và Admin. Ngoài ra, Gemini AI và Email Service được xem là actor phụ bên ngoài hệ thống.")
    add_table(doc, ["Actor", "Vai trò trong hệ thống"], [
        ("Guest", "Truy cập trang chủ, xem thông tin tổng quan, đăng ký hoặc đăng nhập."),
        ("Student", "Học bài, làm bài tập, làm bài đánh giá đầu vào, luyện tập AI, xem dashboard và lịch sử học tập."),
        ("Admin", "Quản lý người dùng, nội dung học phổ thông, lộ trình kỹ năng, bài học và cấu hình Gemini AI."),
        ("Gemini AI", "Dịch vụ bên ngoài sinh câu hỏi, đề luyện tập và hỗ trợ cá nhân hóa nội dung."),
        ("Email Service", "Gửi mã OTP để xác minh tài khoản khi đăng ký."),
    ], [1.3, 5.0])

    doc.add_heading("1.4. Mô tả tổng thể hệ thống", 2)
    add_p(doc, "LearnHub bao gồm các module chính: xác thực người dùng, học phổ thông, lộ trình kỹ năng, đánh giá đầu vào, luyện tập nhanh, luyện tập bằng AI, dashboard cá nhân và quản trị hệ thống. Mỗi module được thiết kế tách biệt theo route, controller và bảng dữ liệu tương ứng, giúp hệ thống dễ bảo trì và mở rộng.")
    add_p(doc, "Luồng tổng quát của người học bắt đầu từ việc đăng ký tài khoản, xác minh OTP, đăng nhập, chọn nội dung học hoặc lộ trình kỹ năng, thực hiện bài đánh giá đầu vào, nhận roadmap cá nhân hóa, học bài và luyện tập. Kết quả học tập được lưu lại để dashboard tổng hợp thành các chỉ số như số bài đã hoàn thành, số bài tập đã làm, tỉ lệ đúng, lịch sử phiên luyện tập và heatmap hoạt động.")
    add_callout(doc, "Định hướng sản phẩm", "LearnHub không chỉ là website chứa bài học mà là một nền tảng học tập có khả năng đánh giá, gợi ý lộ trình và sinh nội dung luyện tập bằng AI. Đây là điểm khác biệt chính của đồ án.")
    doc.add_page_break()


def chapter_2(doc):
    doc.add_heading("CHƯƠNG 2. CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ", 1)
    doc.add_heading("2.1. React.js và kiến trúc SPA", 2)
    add_p(doc, "React.js là thư viện JavaScript dùng để xây dựng giao diện người dùng theo mô hình component-based. Trong LearnHub, React được dùng để tổ chức các page như HomePage, DashboardPage, LessonDetail, PlacementTest, AIQuestionGenerator và AdminLayout. Ứng dụng hoạt động theo mô hình Single Page Application, điều hướng bằng React Router và giao tiếp server thông qua Axios.")
    add_p(doc, "Phía client được chia thành các nhóm thư mục rõ ràng: api chứa các hàm gọi REST API, pages chứa màn hình nghiệp vụ, components chứa thành phần dùng lại, contexts quản lý trạng thái toàn cục và styles chứa hệ thống giao diện. Cách tổ chức này giúp tách biệt giao diện, trạng thái và tầng giao tiếp dữ liệu.")
    doc.add_heading("2.2. Node.js, Express.js và REST API", 2)
    add_p(doc, "Node.js là môi trường chạy JavaScript phía server. Express.js được dùng để xây dựng REST API cho hệ thống. Source backend được tổ chức theo mô hình Route - Middleware - Controller - Service - Database. Route định nghĩa endpoint, middleware xử lý xác thực và phân quyền, controller chứa logic nghiệp vụ, service xử lý nghiệp vụ phụ trợ như Gemini hoặc email, còn PostgreSQL được truy cập thông qua pg Pool.")
    add_table(doc, ["Tầng", "Thành phần trong dự án", "Nhiệm vụ"], [
        ("Route", "authRoutes, pathRoutes, geminiRoutes, adminRoutes", "Định nghĩa endpoint và HTTP method."),
        ("Middleware", "auth.js, role.js, errorHandler.js", "Kiểm tra JWT, role và xử lý lỗi tập trung."),
        ("Controller", "pathController, geminiController, progressController", "Xử lý nghiệp vụ chính của từng module."),
        ("Service", "geminiService, emailService, otpService", "Tách logic gọi AI, gửi email và sinh OTP."),
        ("Database", "PostgreSQL, migrations, seeds", "Lưu người dùng, nội dung học, tiến độ và kết quả."),
    ], [1.0, 2.7, 2.6])

    doc.add_heading("2.3. PostgreSQL và thiết kế dữ liệu", 2)
    add_p(doc, "PostgreSQL được lựa chọn vì hỗ trợ dữ liệu quan hệ ổn định, transaction, index, kiểu UUID, ENUM và JSONB. Trong LearnHub, dữ liệu học tập có nhiều dạng linh hoạt như options của câu hỏi, đáp án đúng, metadata đề thi và điểm số theo từng module. JSONB giúp lưu các cấu trúc này mà vẫn giữ được khả năng truy vấn khi cần.")
    add_p(doc, "Các bảng chính của hệ thống được định nghĩa bằng SQL migrations thay vì ORM. Việc dùng migration giúp kiểm soát lịch sử thay đổi schema rõ ràng. Các quan hệ chính được xây dựng bằng khóa ngoại và cơ chế ON DELETE CASCADE tại những bảng phụ thuộc như lessons, exercises, placement_questions và generated_questions.")
    doc.add_heading("2.4. Google Gemini AI", 2)
    add_p(doc, "Gemini AI được dùng trong module sinh câu hỏi luyện tập và đề kiểm tra. Người dùng cấu hình lớp, môn học, chủ đề, độ khó, số lượng câu hỏi và dạng câu hỏi. Server xây dựng prompt, gọi Gemini API, nhận phản hồi dạng JSON, parse, validate và chuẩn hóa dữ liệu trước khi lưu vào cơ sở dữ liệu.")
    add_p(doc, "Để giảm lỗi từ AI, hệ thống áp dụng cơ chế retry, yêu cầu Gemini chỉ trả về JSON thuần, kiểm tra cấu trúc câu hỏi, kiểm tra options, correct_answer, question_type và tự điều chỉnh một số dữ liệu chưa đúng định dạng. Đây là lớp bảo vệ quan trọng trước khi đưa dữ liệu AI vào hệ thống.")
    doc.add_heading("2.5. JWT, OTP và bảo mật", 2)
    add_p(doc, "Hệ thống xác thực bằng JWT gồm Access Token và Refresh Token. Access Token có thời hạn ngắn và được lưu trong memory phía client. Refresh Token có thời hạn dài hơn và được lưu trong httpOnly cookie để giảm rủi ro bị đọc bởi JavaScript độc hại. Khi Access Token hết hạn, Axios interceptor tự động gọi endpoint refresh để lấy token mới.")
    add_p(doc, "Khi đăng ký, người dùng phải xác minh mã OTP được gửi qua email. OTP có thời hạn ngắn, được lưu trong bảng otp_codes và có bảng otp_rate_limits để hạn chế việc gửi mã liên tục. Mật khẩu được hash bằng bcryptjs trước khi lưu vào bảng users.")
    doc.add_page_break()


def chapter_3_intro(doc, diagrams):
    doc.add_heading("CHƯƠNG 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG", 1)
    doc.add_heading("3.1. Kiến trúc tổng thể hệ thống", 2)
    add_p(doc, "LearnHub được thiết kế theo kiến trúc 3 tầng. Tầng trình bày là React SPA, tầng nghiệp vụ là Express API và tầng dữ liệu là PostgreSQL. Các dịch vụ bên ngoài như Gemini AI và Email Service được tích hợp thông qua service layer để tránh phụ thuộc trực tiếp trong UI hoặc route.")
    add_figure(doc, diagrams["architecture"], "Hình 3.1. Kiến trúc tổng thể hệ thống LearnHub")
    add_p(doc, "Kiến trúc này giúp hệ thống có tính mở rộng cao. Khi cần thêm chức năng mới như đánh giá đầu vào cho phổ thông hoặc AI coach, nhóm có thể thêm route, controller và bảng dữ liệu mới mà không phá vỡ các module sẵn có.")

    doc.add_heading("3.2. Actor hệ thống và danh sách chức năng", 2)
    add_table(doc, ["Actor", "Chức năng chính"], [
        ("Guest", "Xem trang chủ, tìm hiểu hệ thống, đăng ký, đăng nhập."),
        ("Student", "Học bài phổ thông, học skill path, làm placement test, luyện tập nhanh, tạo/làm bộ câu hỏi AI, xem dashboard."),
        ("Admin", "Quản lý user, chương, bài học, bài tập, module kỹ năng, cấu hình Gemini và dữ liệu hệ thống."),
        ("Gemini AI", "Sinh câu hỏi, đề luyện tập, nội dung gợi ý theo prompt do hệ thống xây dựng."),
        ("Email Service", "Gửi OTP xác minh tài khoản."),
    ], [1.2, 5.1])
    add_table(doc, ["Nhóm chức năng", "Mô tả"], [
        ("Xác thực", "Đăng ký, xác minh OTP, đăng nhập, refresh token, đăng xuất."),
        ("Học phổ thông", "Duyệt lớp, môn, chương, bài học, làm bài tập và cập nhật tiến độ."),
        ("Lộ trình cá nhân", "Làm bài đánh giá đầu vào, chấm điểm theo module/chapter, gợi ý roadmap."),
        ("Luyện tập AI", "Sinh bộ câu hỏi hoặc đề kiểm tra bằng Gemini, làm bài và lưu kết quả."),
        ("Dashboard", "Tổng hợp tiến độ học, độ chính xác, lịch sử phiên luyện tập và heatmap."),
        ("Quản trị", "Quản lý nội dung, người dùng, môn học, bài học, cấu hình AI."),
    ], [1.8, 4.5])
    doc.add_page_break()


def use_cases(doc, diagrams):
    doc.add_heading("3.3. Use Case Diagram và đặc tả use case", 2)
    add_p(doc, "Use Case Diagram tổng quát thể hiện ranh giới hệ thống LearnHub và các chức năng chính mà từng actor tương tác. Student là actor trung tâm của hệ thống; Admin quản trị dữ liệu và cấu hình; Gemini AI và Email Service là actor phụ bên ngoài.")
    add_figure(doc, diagrams["use_case"], "Hình 3.2. Use Case Diagram tổng quát")

    doc.add_heading("3.3.1. Use Case 1 - Đánh giá đầu vào và đề xuất lộ trình học", 3)
    add_table(doc, ["Thành phần", "Nội dung"], [
        ("Tên use case", "Đánh giá đầu vào và đề xuất lộ trình học cá nhân hóa."),
        ("Actor chính", "Student."),
        ("Actor phụ", "Database."),
        ("Mục tiêu", "Xác định năng lực hiện tại của người học và đề xuất module hoặc chương nên bắt đầu."),
        ("Tiền điều kiện", "Student đã đăng nhập. Hệ thống có bài placement test và danh sách câu hỏi liên kết với module/chapter."),
        ("Hậu điều kiện", "Kết quả được lưu, roadmap cá nhân hóa được hiển thị và người học có thể bắt đầu từ điểm được đề xuất."),
    ], [1.7, 4.6])
    add_p(doc, "Luồng chính của use case:")
    add_numbered(doc, [
        "Student mở trang lộ trình học hoặc trang môn học và chọn chức năng kiểm tra trình độ.",
        "UI gọi API lấy bài đánh giá gồm thông tin test, danh sách câu hỏi, options và độ khó.",
        "Student trả lời các câu hỏi; hệ thống cập nhật tiến độ làm bài trên giao diện.",
        "Student nộp bài; UI gửi danh sách đáp án lên API.",
        "API kiểm tra dữ liệu đầu vào, lấy đáp án đúng từ database và chấm điểm theo trọng số độ khó.",
        "Scoring Service tính điểm theo từng module/chapter và xác định điểm bắt đầu đầu tiên có điểm dưới ngưỡng 80%.",
        "API lưu kết quả vào placement_results hoặc subject_placement_results.",
        "UI hiển thị roadmap cá nhân hóa, trạng thái từng module/chapter và nút bắt đầu học.",
    ])
    add_p(doc, "Luồng thay thế và ngoại lệ:")
    add_bullets(doc, [
        "Nếu Student chưa đăng nhập, hệ thống chuyển đến trang đăng nhập trước khi cho nộp bài.",
        "Nếu chưa trả lời đủ câu hỏi, nút nộp bài bị vô hiệu hóa hoặc hệ thống yêu cầu hoàn thành đủ.",
        "Nếu bài test không tồn tại, API trả lỗi 404 và UI hiển thị thông báo phù hợp.",
        "Nếu kết quả chấm điểm không đủ dữ liệu module/chapter, hệ thống yêu cầu làm lại hoặc báo lỗi dữ liệu.",
    ])

    doc.add_heading("3.3.2. Use Case 2 - Tạo và luyện tập bộ câu hỏi bằng AI", 3)
    add_table(doc, ["Thành phần", "Nội dung"], [
        ("Tên use case", "Tạo và luyện tập bộ câu hỏi bằng AI."),
        ("Actor chính", "Student."),
        ("Actor phụ", "Gemini AI, Database."),
        ("Mục tiêu", "Tạo bộ câu hỏi theo lớp, chủ đề, độ khó và cho phép người học luyện tập ngay."),
        ("Tiền điều kiện", "Student đã đăng nhập. Gemini API đã được cấu hình. Người dùng chưa vượt quá giới hạn tạo trong 1 giờ."),
        ("Hậu điều kiện", "Bộ câu hỏi được lưu trong question_collections, câu hỏi lưu trong generated_questions và kết quả làm bài được lưu sau khi nộp."),
    ], [1.7, 4.6])
    add_p(doc, "Luồng chính của use case:")
    add_numbered(doc, [
        "Student mở trang AI Question Generator.",
        "Student chọn chương trình, lớp hoặc kỹ năng, chủ đề, độ khó, số câu và dạng câu hỏi.",
        "UI gửi yêu cầu POST /api/gemini/generate-questions.",
        "API kiểm tra JWT, kiểm tra rate limit và xây dựng cấu hình sinh câu hỏi.",
        "Gemini Service tạo prompt và gọi Google Gemini API.",
        "Hệ thống parse JSON, validate cấu trúc, làm sạch câu hỏi và loại bỏ dữ liệu không hợp lệ.",
        "API tạo question_collection và batch insert generated_questions.",
        "UI hiển thị preview câu hỏi và cho phép Student làm bài ngay trong AIPracticeArena.",
        "Student nộp bài; hệ thống chấm điểm, lưu generated_question_attempts và generated_session_results.",
    ])
    add_p(doc, "Luồng thay thế và ngoại lệ:")
    add_bullets(doc, [
        "Nếu thiếu Gemini API key, API trả lỗi dịch vụ AI chưa sẵn sàng.",
        "Nếu người dùng vượt quá 20 lần tạo trong 1 giờ, API trả lỗi 429.",
        "Nếu Gemini trả JSON không hợp lệ, service retry; sau số lần retry tối đa, hệ thống trả lỗi.",
        "Nếu collection không thuộc người dùng hiện tại, API trả lỗi không có quyền truy cập.",
    ])
    doc.add_page_break()


def activity_and_sequence(doc, diagrams):
    doc.add_heading("3.4. Activity Diagram", 2)
    add_p(doc, "Activity Diagram mô tả luồng xử lý nghiệp vụ theo thứ tự hoạt động, bao gồm điểm rẽ nhánh và điều kiện kết thúc. Trong báo cáo này, hai luồng chính được chọn là đánh giá đầu vào và tạo/luyện câu hỏi AI vì đây là hai chức năng thể hiện rõ tính cá nhân hóa và tích hợp AI của hệ thống.")
    doc.add_heading("3.4.1. Activity Diagram - Đánh giá đầu vào", 3)
    add_figure(doc, diagrams["activity_placement"], "Hình 3.3. Activity Diagram - Đánh giá đầu vào và roadmap cá nhân")
    add_p(doc, "Các điểm rẽ nhánh quan trọng của sơ đồ gồm: kiểm tra người dùng đã đăng nhập, kiểm tra đủ câu trả lời, kiểm tra dữ liệu câu hỏi có liên kết với module/chapter và xác định module/chapter đầu tiên dưới ngưỡng thành thạo. Điểm kết thúc là khi hệ thống lưu kết quả và hiển thị roadmap cá nhân hóa.")

    doc.add_heading("3.4.2. Activity Diagram - Tạo và luyện câu hỏi AI", 3)
    add_figure(doc, diagrams["activity_ai"], "Hình 3.5. Activity Diagram - Sinh câu hỏi AI và luyện tập")
    add_p(doc, "Điểm rẽ nhánh chính của luồng AI gồm kiểm tra rate limit, kiểm tra Gemini API key, kiểm tra JSON trả về hợp lệ và quyết định retry nếu kết quả không đạt yêu cầu. Luồng kết thúc khi bộ câu hỏi được lưu, người học hoàn thành bài luyện tập và kết quả được lưu vào database.")
    doc.add_page_break()

    doc.add_heading("3.5. Sequence Diagram", 2)
    add_p(doc, "Sequence Diagram thể hiện thứ tự thông điệp giữa người dùng, giao diện, API, service và database. Đây là cơ sở để nhóm triển khai API và kiểm thử tích hợp giữa frontend và backend.")
    doc.add_heading("3.5.1. Sequence Diagram - Placement Test", 3)
    add_figure(doc, diagrams["sequence_placement"], "Hình 3.4. Sequence Diagram - Placement Test")
    add_p(doc, "Trong luồng placement, UI không tự chấm điểm mà chỉ thu thập đáp án. API lấy đáp án đúng từ database và thực hiện chấm điểm phía server để đảm bảo tính toàn vẹn. Kết quả trả về gồm score theo từng module/chapter, recommended_start và study_plan.")
    doc.add_heading("3.5.2. Sequence Diagram - Sinh câu hỏi AI", 3)
    add_figure(doc, diagrams["sequence_ai"], "Hình 3.6. Sequence Diagram - Sinh câu hỏi AI")
    add_p(doc, "Trong luồng sinh câu hỏi AI, Gemini Service đóng vai trò tách biệt giữa controller và dịch vụ Gemini bên ngoài. Thiết kế này giúp controller chỉ tập trung vào xác thực, rate limit và lưu dữ liệu; còn service xử lý prompt, retry, parse và validate.")
    doc.add_page_break()


def database_design(doc, diagrams):
    doc.add_heading("3.6. Thiết kế cơ sở dữ liệu và ERD", 2)
    add_p(doc, "Cơ sở dữ liệu của LearnHub được chia thành các nhóm: người dùng và xác thực, nội dung học phổ thông, lộ trình kỹ năng, tiến độ học tập, luyện tập nhanh, câu hỏi AI và cấu hình hệ thống. Thiết kế ưu tiên chuẩn hóa quan hệ chính, dùng JSONB cho các trường linh hoạt như options, correct_answer, metadata và score.")
    add_figure(doc, diagrams["erd"], "Hình 3.7. ERD rút gọn của hệ thống LearnHub")
    doc.add_heading("3.6.1. Nhóm người dùng và xác thực", 3)
    add_table(doc, ["Entity", "Khóa chính", "Thuộc tính chính", "Quan hệ"], [
        ("users", "id UUID", "email, password_hash, display_name, role, is_active, is_verified", "1-n với refresh_tokens, otp_codes, progress, attempts."),
        ("otp_codes", "id SERIAL", "user_id, email, otp_code, expires_at, is_used", "n-1 với users."),
        ("refresh_tokens", "id SERIAL", "user_id, token, expires_at", "n-1 với users."),
        ("otp_rate_limits", "id SERIAL", "email, request_count, window_start", "Theo dõi tần suất gửi OTP theo email."),
    ], [1.2, 1.0, 2.9, 1.2])
    doc.add_heading("3.6.2. Nhóm nội dung học phổ thông", 3)
    add_table(doc, ["Entity", "Khóa chính", "Thuộc tính chính", "Quan hệ"], [
        ("education_levels", "id", "name, slug, description, sort_order", "1-n với grades."),
        ("grades", "id", "education_level_id, grade_number, name, slug", "n-1 education_levels, 1-n grade_subjects."),
        ("subjects", "id", "name, slug, icon_url, description, is_active", "n-n với grades qua grade_subjects."),
        ("grade_subjects", "id", "grade_id, subject_id, is_active", "Bảng liên kết giữa grades và subjects."),
        ("chapters", "id", "grade_subject_id, title, slug, sort_order", "n-1 grade_subjects, 1-n lessons."),
        ("lessons", "id", "chapter_id, title, content_type, content_html", "n-1 chapters, 1-n exercises."),
        ("exercises", "id", "lesson_id, exercise_type, question_text, options, correct_answer", "n-1 lessons, 1-n exercise_attempts."),
    ], [1.35, 0.9, 2.9, 1.15])
    doc.add_heading("3.6.3. Nhóm lộ trình kỹ năng và placement", 3)
    add_table(doc, ["Entity", "Khóa chính", "Thuộc tính chính", "Quan hệ"], [
        ("skill_paths", "id", "title, slug, description, estimated_hours, difficulty", "1-n skill_modules, 1-n placement_tests."),
        ("skill_modules", "id", "path_id, title, slug, sort_order, estimated_hours", "n-1 skill_paths, 1-n skill_lessons."),
        ("skill_lessons", "id", "module_id, title, slug, content_html", "n-1 skill_modules."),
        ("placement_tests", "id", "path_id, title, time_limit_minutes, is_active", "n-1 skill_paths, 1-n placement_questions."),
        ("placement_questions", "id", "test_id, module_id, question_text, options, correct_answer, difficulty_level", "n-1 placement_tests, n-1 skill_modules."),
        ("placement_results", "id", "user_id, test_id, score JSONB, recommended_start_module_id", "n-1 users, n-1 placement_tests."),
    ], [1.35, 0.9, 3.1, 1.0])
    doc.add_heading("3.6.4. Nhóm câu hỏi AI và kết quả luyện tập", 3)
    add_table(doc, ["Entity", "Khóa chính", "Thuộc tính chính", "Quan hệ"], [
        ("question_collections", "id UUID", "user_id, collection_name, grade_number, subject, topic, difficulty, is_test", "n-1 users, 1-n generated_questions."),
        ("generated_questions", "id UUID", "collection_id, question_text, question_type, options, correct_answer, explanation", "n-1 question_collections."),
        ("generated_question_attempts", "id", "user_id, collection_id, question_id, user_answer, is_correct", "n-1 users, n-1 generated_questions."),
        ("generated_session_results", "id UUID", "user_id, collection_id, total_questions, correct_count, score_percent", "n-1 users, n-1 question_collections."),
        ("practice_sessions", "id", "user_id, grade_slug, subject_slug, difficulty, score, max_streak", "n-1 users, phục vụ leaderboard."),
    ], [1.45, 0.95, 3.0, 0.9])
    add_callout(doc, "Chuẩn hóa đề xuất", "Với placement phổ thông, nên bổ sung subject_placement_tests, subject_placement_questions và subject_placement_results để chấm điểm theo chapter. Với practice_sessions, có thể bổ sung grade_id và subject_id làm khóa ngoại để tăng tính toàn vẹn dữ liệu.", "FFF8E1")
    doc.add_page_break()


def api_ui_design(doc):
    doc.add_heading("3.7. Thiết kế API và giao diện", 2)
    doc.add_heading("3.7.1. API chính của hệ thống", 3)
    add_table(doc, ["Nhóm", "Endpoint", "Mục đích"], [
        ("Auth", "POST /api/auth/register", "Đăng ký tài khoản và gửi OTP."),
        ("Auth", "POST /api/auth/verify-email", "Xác minh OTP và kích hoạt tài khoản."),
        ("Auth", "POST /api/auth/login", "Đăng nhập, sinh Access Token và Refresh Token."),
        ("Learning", "GET /api/grades", "Lấy danh sách cấp học và lớp."),
        ("Learning", "GET /api/subjects/:gradeSlug/:subjectSlug/chapters", "Lấy chương theo lớp và môn."),
        ("Learning", "GET /api/lessons/:lessonId", "Lấy chi tiết bài học."),
        ("Progress", "POST /api/progress/lesson/:lessonId/complete", "Đánh dấu hoàn thành bài học."),
        ("Path", "GET /api/paths", "Lấy danh sách lộ trình kỹ năng."),
        ("Path", "POST /api/paths/placement-test/:testId/submit", "Nộp placement test skill path."),
        ("Gemini", "POST /api/gemini/generate-questions", "Sinh bộ câu hỏi AI."),
        ("Gemini", "POST /api/gemini/collections/:id/submit", "Nộp bài luyện tập AI."),
        ("Admin", "GET /api/admin/users", "Quản lý người dùng."),
        ("Admin", "PUT /api/admin/gemini/settings", "Cập nhật cấu hình Gemini."),
    ], [1.1, 2.3, 2.9])
    doc.add_heading("3.7.2. Thiết kế giao diện chính", 3)
    add_p(doc, "Giao diện LearnHub được chia theo vai trò và workflow. Student sử dụng MainLayout với sidebar điều hướng đến Dashboard, Learning Path, Học bài, Luyện tập, AI Coach, Ranking và Profile. Admin sử dụng AdminLayout với các tab quản lý Users, Nội dung bài học và Cài đặt Gemini.")
    add_table(doc, ["Màn hình", "Chức năng", "API liên quan"], [
        ("DashboardPage", "Hiển thị thống kê học tập, heatmap, khóa học đang học.", "/api/progress/overview, /api/progress/heatmap, /api/progress/courses"),
        ("PathList/PathDetail", "Hiển thị lộ trình, module và bài học kỹ năng.", "/api/paths, /api/paths/:pathSlug"),
        ("PlacementTest", "Làm bài đánh giá đầu vào, nộp kết quả và xem roadmap.", "/api/paths/:pathSlug/placement-test, /api/paths/placement-test/:testId/submit"),
        ("AIQuestionGenerator", "Cấu hình và tạo bộ câu hỏi AI.", "/api/gemini/generate-questions, /api/gemini/generate-test"),
        ("AIPracticeArena", "Làm bài trên bộ câu hỏi AI đã tạo.", "/api/gemini/collections/:id, /api/gemini/collections/:id/submit"),
        ("ManageLessons", "Admin quản lý chương, bài học, module, skill lesson.", "/api/admin/chapters, /api/admin/lessons, /api/admin/skill-modules"),
    ], [1.6, 2.3, 2.4])
    doc.add_heading("3.7.3. Hai chức năng trọng tâm đưa vào báo cáo", 3)
    add_p(doc, "Hai chức năng nên được chọn để trình bày sâu trong báo cáo là Đánh giá đầu vào và đề xuất lộ trình học cá nhân hóa, cùng Tạo và luyện tập bộ câu hỏi bằng AI. Lý do lựa chọn:")
    add_bullets(doc, [
        "Hai chức năng thể hiện rõ đặc trưng của đề tài: cá nhân hóa học tập và tích hợp AI.",
        "Cả hai đều có đủ thành phần để vẽ Use Case, Activity Diagram, Sequence Diagram và ERD.",
        "Hai chức năng có luồng xử lý thực tế từ UI đến API, service và database.",
        "Hai chức năng có giá trị học thuật cao vì liên quan đến đánh giá năng lực, thuật toán gợi ý, sinh nội dung và lưu kết quả học tập.",
    ])
    doc.add_page_break()


def chapter_4(doc):
    doc.add_heading("CHƯƠNG 4. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN", 1)
    doc.add_heading("4.1. Kết quả đạt được", 2)
    add_p(doc, "Đồ án LearnHub đã xây dựng được một nền tảng học tập cá nhân hóa sử dụng kiến trúc web hiện đại. Hệ thống có frontend React, backend Express, cơ sở dữ liệu PostgreSQL và tích hợp Google Gemini AI. Các module chính gồm xác thực, học phổ thông, lộ trình kỹ năng, placement test, luyện tập AI, dashboard và quản trị.")
    add_bullets(doc, [
        "Hoàn thiện mô hình dữ liệu cho người dùng, nội dung học, bài tập, tiến độ, lộ trình kỹ năng và câu hỏi AI.",
        "Xây dựng flow xác thực bảo mật với JWT, Refresh Token, OTP email và bcrypt password hashing.",
        "Thiết kế module đánh giá đầu vào để xác định năng lực và đề xuất lộ trình học cá nhân.",
        "Tích hợp Gemini AI để sinh câu hỏi và đề kiểm tra, có validate dữ liệu trước khi lưu.",
        "Cung cấp giao diện quản trị cho Admin quản lý users, nội dung học và cấu hình Gemini.",
        "Bổ sung hệ thống sơ đồ phân tích gồm Use Case, Activity, Sequence và ERD phục vụ báo cáo đồ án.",
    ])
    doc.add_heading("4.2. Hạn chế", 2)
    add_p(doc, "Do phạm vi đồ án có nhiều module, một số điểm vẫn cần tiếp tục mở rộng trong các giai đoạn sau. Nội dung học cần được bổ sung thêm cho nhiều môn học và nhiều cấp học hơn. Hệ thống AI phụ thuộc vào quota và chất lượng phản hồi của Gemini API nên cần cơ chế fallback hoặc kiểm duyệt nội dung tốt hơn trong môi trường thực tế.")
    add_p(doc, "Ngoài ra, chức năng cá nhân hóa có thể tiếp tục nâng cấp bằng thuật toán phân tích lịch sử học tập dài hạn, phát hiện điểm yếu tự động và gợi ý bài luyện tập theo năng lực thực tế của từng người dùng.")
    doc.add_heading("4.3. Hướng phát triển", 2)
    add_bullets(doc, [
        "Mở rộng subject placement cho từng môn/lớp, chấm điểm theo chapter và đề xuất chương nên học.",
        "Bổ sung nội dung bài học kỹ năng đầy đủ cho Frontend, Backend và các lộ trình mới như Data Science, DevOps, Mobile.",
        "Thêm AI Coach kết nối dữ liệu học tập thực tế để giải thích bài sai và lập kế hoạch học hằng ngày.",
        "Xây dựng hệ thống lớp học, giao bài và theo dõi tiến độ nếu mở rộng cho giáo viên.",
        "Bổ sung test tự động cho auth flow, Gemini flow, placement scoring và admin APIs.",
        "Phát triển ứng dụng mobile hoặc PWA để hỗ trợ học tập trên thiết bị di động tốt hơn.",
    ])
    doc.add_heading("TÀI LIỆU THAM KHẢO", 1)
    refs = [
        "Google LLC. Gemini API Documentation. https://ai.google.dev/docs",
        "Google LLC. @google/generative-ai SDK. https://www.npmjs.com/package/@google/generative-ai",
        "Meta Platforms. React Documentation. https://react.dev",
        "OpenJS Foundation. Node.js Documentation. https://nodejs.org/docs",
        "Express.js. Express API Reference. https://expressjs.com",
        "PostgreSQL Global Development Group. PostgreSQL Documentation. https://www.postgresql.org/docs",
        "Auth0. JSON Web Tokens Introduction. https://jwt.io/introduction",
        "Vite. Vite Documentation. https://vite.dev",
        "React Router. React Router Documentation. https://reactrouter.com",
        "Bộ Giáo dục và Đào tạo. Chương trình Giáo dục Phổ thông 2018.",
    ]
    for i, ref in enumerate(refs, 1):
        add_p(doc, f"[{i}] {ref}")


def build():
    diagrams = {
        "architecture": diagram_architecture(),
        "use_case": diagram_use_case(),
        "activity_placement": diagram_activity_placement(),
        "sequence_placement": diagram_sequence_placement(),
        "activity_ai": diagram_activity_ai(),
        "sequence_ai": diagram_sequence_ai(),
        "erd": diagram_erd(),
    }

    doc = Document()
    style_doc(doc)
    cover(doc)
    declaration_and_toc(doc)
    chapter_1(doc)
    chapter_2(doc)
    chapter_3_intro(doc, diagrams)
    use_cases(doc, diagrams)
    activity_and_sequence(doc, diagrams)
    database_design(doc, diagrams)
    api_ui_design(doc)
    chapter_4(doc)
    add_footer(doc)

    # Normalize table paragraph spacing.
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    p.paragraph_format.space_after = Pt(2)
                    p.paragraph_format.line_spacing = 1.05
                    for run in p.runs:
                        if run.font.size is None:
                            set_font(run, size=9)
    doc.save(OUTPUT_DOCX)
    print(OUTPUT_DOCX)


if __name__ == "__main__":
    build()
