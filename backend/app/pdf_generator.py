import os
import math
from datetime import datetime
from . import models

# ReportLab Imports
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor

# --- Theme Colors ---
COLOR = {
    "header_bg": HexColor("#1A237E"),
    "header_text": HexColor("#FFFFFF"),
    "primary": HexColor("#000000"),
    "secondary": HexColor("#555555"),
    "total": HexColor("#0D47A1"),
    "payment": HexColor("#2E7D32"),
    "light_blue": HexColor("#90CAF9"),
}

# Static directory
STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "static")


# ================================================================
# Utility
# ================================================================
def calc_total_hours(start, end):
    """Round up duration to full hours. Minimum 1 hour."""
    duration = end - start
    hours = math.ceil(duration.total_seconds() / 3600)
    return max(1, hours)


def formatted(dt):
    """Format datetime for display."""
    return dt.strftime('%Y-%m-%d %I:%M %p')


# ================================================================
# Main Receipt Function
# ================================================================
def generate_booking_receipt(booking: models.Booking, file_path: str):
    """Generate a clean professional receipt PDF."""

    user = booking.user
    slot = booking.slot

    # --- Price Calculation ---
    hours = calc_total_hours(booking.start_time, booking.end_time)
    rate = slot.price_per_hour
    total_price = hours * rate

    # --- PDF Setup ---
    c = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4
    margin = 0.75 * inch

    # ============================================================
    # 1. HEADER
    # ============================================================
    header_h = 1.0 * inch
    c.setFillColor(COLOR["header_bg"])
    c.rect(0, height - header_h, width, header_h, fill=1, stroke=0)

    c.setFillColor(COLOR["header_text"])
    c.setFont("Helvetica-Bold", 18)
    c.drawString(margin, height - 0.5 * inch, "Smart Parking System")

    c.setFillColor(COLOR["light_blue"])
    c.setFont("Helvetica-Bold", 14)
    c.drawString(margin, height - 0.75 * inch, "Booking Receipt")

    # Logo box
    logo_size = 0.8 * inch
    logo_x = width - margin - logo_size
    logo_y = height - 0.1 * inch - logo_size

    c.setStrokeColor(COLOR["header_text"])
    c.rect(logo_x, logo_y, logo_size, logo_size)
    c.drawCentredString(logo_x + logo_size/2, logo_y + logo_size/2 - 6, "LOGO")

    # ============================================================
    # 2. BOOKING DETAILS
    # ============================================================
    y = height - header_h - 0.75 * inch
    line_gap = 0.3 * inch

    c.setFillColor(COLOR["primary"])
    c.setFont("Helvetica-Bold", 16)
    c.drawString(margin, y, f"Booking ID: {booking.booking_id_str}")
    y -= line_gap * 1.5

    c.setFillColor(COLOR["secondary"])
    c.setFont("Helvetica", 11)

    details = [
        f"User: {user.email}",
        f"Slot: {slot.slot_number} ({slot.vehicle_type})",
        "",
        f"Start: {formatted(booking.start_time)}",
        f"End:   {formatted(booking.end_time)}",
        "",
        f"Rate: ₹{rate:.2f}/hour",
    ]

    for text in details:
        if text == "":
            y -= line_gap * 1.5
            continue
        c.drawString(margin, y, text)
        y -= line_gap

    # Total price
    c.setFont("Helvetica-Bold", 18)
    c.setFillColor(COLOR["total"])
    c.drawString(margin, y, f"Total: ₹{total_price:.2f}")
    y -= line_gap

    # Payment info
    c.setFillColor(COLOR["payment"])
    c.setFont("Helvetica", 11)
    c.drawString(margin, y, "Payment: Pay at Gate (Cash)")

    # ============================================================
    # 3. QR CODE
    # ============================================================
    qr_size = 2.5 * inch
    qr_x = width - margin - qr_size
    qr_y = height - header_h - 0.75 * inch - 2.7 * inch

    if booking.qr_code_url:
        # Extract actual relative path after `/static/`
        rel_path = booking.qr_code_url.replace("/static/", "")
        qr_path = os.path.join(STATIC_DIR, rel_path)

        if os.path.exists(qr_path):
            c.drawImage(qr_path, qr_x, qr_y, width=qr_size, height=qr_size)

    c.setFont("Helvetica-Oblique", 9)
    c.setFillColor(COLOR["secondary"])
    c.drawCentredString(qr_x + qr_size / 2, qr_y - 0.25 * inch, "* Scan at Gate to Enter/Exit")

    # ============================================================
    # 4. FOOTER
    # ============================================================
    footer_y = 1.0 * inch

    c.setFillColor(COLOR["primary"])
    c.setFont("Helvetica", 10)
    c.drawString(margin, footer_y,
                 "Thank you for using Smart Parking! Present this QR code at the gate to enter/exit.")

    footer_info = (
        "Contact: +91 98765 00000 | support@smartparking.in | "
        "123 Tech Park Road, Nashik, India | www.smartparking.in"
    )

    c.setFont("Helvetica", 9)
    c.setFillColor(COLOR["secondary"])
    c.drawString(margin, footer_y - 0.25 * inch, footer_info)

    # Issued time
    c.drawRightString(
        width - margin,
        footer_y - 0.5 * inch,
        f"Issued: {datetime.now().strftime('%Y-%m-%d %I:%M %p')}",
    )

    # Finish PDF
    c.showPage()
    c.save()
