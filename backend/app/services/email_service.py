"""
SMTP Email Service for Nexus Graduation Portal.
Uses standard smtplib with a Gmail App Password to send
professional reminder emails.

Setup:
  1. Go to your Google Account -> Security -> 2-Step Verification
  2. Create an App Password (16 digits)
  3. Update backend/app/.env with:
     SMTP_EMAIL=your_email@gmail.com
     SMTP_PASSWORD=your_16_digit_app_password
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from dotenv import load_dotenv

load_dotenv(override=True)

def build_nudge_email_html(authority_name, department, stale_requests):
    """
    Build a professional, visually appealing HTML email body for the nudge.
    stale_requests: list of dicts with keys: student_name, student_id, days_stale, student_email
    """
    now = datetime.now()
    date_str = now.strftime("%B %d, %Y")

    rows_html = ""
    for i, req in enumerate(stale_requests):
        bg = "#f7fdf9" if i % 2 == 0 else "#ffffff"
        days = req["days_stale"]
        urgency_color = "#c0392b" if days >= 5 else "#c97a10" if days >= 3 else "#1a7a4a"
        rows_html += f"""
        <tr style="background:{bg};">
            <td style="padding:12px 16px;border-bottom:1px solid #e8f5ee;font-size:14px;color:#0f2718;">
                {req['student_name']}
            </td>
            <td style="padding:12px 16px;border-bottom:1px solid #e8f5ee;font-size:14px;color:#3d6b4f;font-family:monospace;">
                {req['student_id']}
            </td>
            <td style="padding:12px 16px;border-bottom:1px solid #e8f5ee;font-size:14px;color:{urgency_color};font-weight:600;">
                {days} day{'s' if days != 1 else ''}
            </td>
            <td style="padding:12px 16px;border-bottom:1px solid #e8f5ee;">
                <span style="background:{urgency_color}22;color:{urgency_color};padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">
                    {'Urgent' if days >= 5 else 'Overdue' if days >= 3 else 'Pending'}
                </span>
            </td>
        </tr>
        """

    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background:#f0f7f3;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);margin-top:32px;margin-bottom:32px;">
            
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#1a7a4a 0%,#0f4a2a 100%);padding:32px 40px;text-align:center;">
                <div style="font-family:monospace;font-size:12px;letter-spacing:6px;color:rgba(255,255,255,0.5);margin-bottom:12px;">NEXUS</div>
                <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
                    📋 Clearance Review Reminder
                </h1>
                <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">
                    Graduation Portal · {date_str}
                </p>
            </div>

            <!-- Body -->
            <div style="padding:32px 40px;">
                <p style="font-size:15px;color:#0f2718;line-height:1.7;margin:0 0 20px;">
                    Dear <strong>{authority_name}</strong>,
                </p>
                <p style="font-size:15px;color:#3d6b4f;line-height:1.7;margin:0 0 24px;">
                    This is an automated reminder from the <strong>Nexus Graduation Portal</strong>.
                    The following student clearance request(s) in the <strong>{department}</strong> department
                    have been <strong>pending for over 2 days</strong> and require your attention:
                </p>

                <!-- Alert Banner -->
                <div style="background:#fef3e2;border-left:4px solid #c97a10;border-radius:0 8px 8px 0;padding:14px 20px;margin-bottom:24px;">
                    <div style="font-size:14px;color:#8b5e10;font-weight:600;">
                        ⚡ {len(stale_requests)} request{'s' if len(stale_requests) != 1 else ''} awaiting your review
                    </div>
                    <div style="font-size:13px;color:#a07020;margin-top:4px;">
                        Timely processing ensures students graduate on schedule.
                    </div>
                </div>

                <!-- Table -->
                <div style="border:1px solid #d4ead9;border-radius:12px;overflow:hidden;margin-bottom:28px;">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr style="background:#eaf7f0;">
                                <th style="padding:12px 16px;text-align:left;font-size:11px;color:#7aaa8a;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Student</th>
                                <th style="padding:12px 16px;text-align:left;font-size:11px;color:#7aaa8a;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Roll No.</th>
                                <th style="padding:12px 16px;text-align:left;font-size:11px;color:#7aaa8a;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Waiting</th>
                                <th style="padding:12px 16px;text-align:left;font-size:11px;color:#7aaa8a;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Priority</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows_html}
                        </tbody>
                    </table>
                </div>

                <!-- CTA -->
                <div style="text-align:center;margin-bottom:28px;">
                    <a href="http://localhost:5173/admin" 
                       style="display:inline-block;background:linear-gradient(135deg,#1a7a4a,#22a05e);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;box-shadow:0 4px 16px rgba(26,122,74,0.25);">
                        Review Pending Requests →
                    </a>
                </div>

                <p style="font-size:14px;color:#7aaa8a;line-height:1.6;margin:0;text-align:center;">
                    Please log in to the portal and take the necessary action at your earliest convenience.
                </p>
            </div>

            <!-- Footer -->
            <div style="background:#f7fdf9;border-top:1px solid #d4ead9;padding:20px 40px;text-align:center;">
                <p style="margin:0;font-size:12px;color:#7aaa8a;">
                    Nexus Graduation Portal · Automated Email Reminder System
                </p>
                <p style="margin:4px 0 0;font-size:11px;color:#b0d4bc;">
                    This is a system-generated email. Please do not reply to this message.
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    return html


def send_nudge_email(to_email, authority_name, department, stale_requests):
    """
    Send a professional nudge email to a department authority using SMTP.
    Returns (success: bool, message: str)
    """
    try:
        smtp_email = os.getenv("SMTP_EMAIL")
        smtp_password = os.getenv("SMTP_PASSWORD")

        if not smtp_email or not smtp_password or smtp_email == "your_email@gmail.com":
            return False, "SMTP_EMAIL or SMTP_PASSWORD not set properly in .env"

        subject = f"⏰ Nexus Reminder: {len(stale_requests)} Pending Clearance{'s' if len(stale_requests) != 1 else ''} — {department} Department"

        html_body = build_nudge_email_html(authority_name, department, stale_requests)

        message = MIMEMultipart("alternative")
        message["From"] = f"Nexus Portal <{smtp_email}>"
        message["To"] = to_email
        message["Subject"] = subject

        # Plain text fallback
        plain_text = f"""
Dear {authority_name},

This is an automated reminder from the Nexus Graduation Portal.

{len(stale_requests)} student clearance request(s) in the {department} department have been pending for over 2 days.

Students waiting:
"""
        for req in stale_requests:
            plain_text += f"  - {req['student_name']} ({req['student_id']}) — waiting {req['days_stale']} day(s)\n"

        plain_text += f"""
Please log in to the portal and take the necessary action.

Portal: http://localhost:5173/admin

— Nexus Graduation Portal (Automated Reminder)
"""

        message.attach(MIMEText(plain_text, "plain"))
        message.attach(MIMEText(html_body, "html", "utf-8"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(smtp_email, smtp_password)
            server.send_message(message)

        return True, f"Nudge email sent to {to_email}"

    except Exception as e:
        return False, f"Failed to send email: {str(e)}"


def send_test_email(to_email):
    """Send a quick test email to verify SMTP credentials work."""
    test_requests = [
        {"student_name": "Test Student", "student_id": "TEST001", "days_stale": 3, "student_email": "test@example.com"}
    ]
    return send_nudge_email(to_email, "Test Authority", "Test Department", test_requests)
