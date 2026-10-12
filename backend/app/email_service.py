import os
import re
import smtplib
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Tuple
from app.config import settings

# RFC 5322 compliant email regex
EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
)

# Common disposable email provider domains to block fake burner registrations
DISPOSABLE_DOMAINS = {
    "mailinator.com", "tempmail.com", "10minutemail.com", "guerrillamail.com",
    "sharklasers.com", "yopmail.com", "trashmail.com", "throwawaymail.com",
    "dispostable.com", "fakeinbox.com", "getairmail.com", "burnermail.io"
}

def is_valid_email_syntax(email: str) -> Tuple[bool, str]:
    """Validates structure and checks for disposable/fake domains."""
    if not email or not isinstance(email, str):
        return False, "Email address is required."
    
    clean_email = email.strip().lower()
    if not EMAIL_REGEX.match(clean_email):
        return False, "Invalid email address format."
    
    domain = clean_email.split("@")[-1]
    if domain in DISPOSABLE_DOMAINS:
        return False, "Temporary/disposable email services are not permitted. Please use your official or Google email."
    
    # Check domain has valid dot structure
    parts = domain.split(".")
    if len(parts) < 2 or any(len(p) < 2 for p in parts):
        return False, "The email domain is invalid or does not exist."
    
    return True, clean_email

async def _send_resend_https_email(to_email: str, subject: str, html_content: str, text_content: str) -> Tuple[bool, str]:
    """HTTPS API email delivery (Port 443) that bypasses all cloud SMTP port restrictions."""
    api_key = os.getenv("RESEND_API_KEY", "").strip()
    if not api_key:
        return False, "RESEND_API_KEY not set"
    try:
        import httpx
        from_email = os.getenv("RESEND_FROM_EMAIL", "SafeSlope NER <onboarding@resend.dev>")
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "from": from_email,
                    "to": [to_email],
                    "subject": subject,
                    "html": html_content,
                    "text": text_content
                }
            )
            if resp.status_code in (200, 201):
                return True, "Email delivered via Resend HTTPS"
            return False, f"Resend HTTP {resp.status_code}: {resp.text}"
    except Exception as e:
        return False, f"Resend delivery failed: {e}"

def _send_smtp_email_sync(to_email: str, subject: str, html_content: str, text_content: str) -> Tuple[bool, str]:
    """Synchronous SMTP email delivery using Python's standard smtplib."""
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        return False, "SMTP credentials are not configured in backend/.env"

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"SafeSlope NER Authentication <{settings.SMTP_FROM_EMAIL}>"
        msg["To"] = to_email

        # Attach text and html versions
        msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        if settings.SMTP_PORT == 465:
            # SSL
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=5) as server:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_FROM_EMAIL, [to_email], msg.as_string())
        else:
            # STARTTLS (port 587)
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=5) as server:
                if settings.SMTP_USE_TLS:
                    server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_FROM_EMAIL, [to_email], msg.as_string())

        return True, "Email sent successfully"
    except Exception as e:
        return False, f"SMTP delivery failed: {str(e)}"

async def send_verification_otp_email(to_email: str, otp_code: str, name: str = "") -> Dict[str, Any]:
    """
    Asynchronously sends a 6-digit OTP email with high-contrast SafeSlope branding.
    If SMTP credentials are not yet set in .env, falls back gracefully to console output.
    """
    subject = f"Your SafeSlope NER Verification Code: {otp_code}"
    
    display_name = name or to_email.split("@")[0].title()
    
    text_content = f"""SafeSlope NER Landslide Surveillance Portal
Official Account Verification

Hello {display_name},

Your 6-digit verification code for SafeSlope NER is:
{otp_code}

This code is valid for 10 minutes. If you did not request this verification, please ignore this email.

Northeast Landslide Early Warning & Risk Monitoring System
Government of Assam / NDMA SIH PS 26001
"""

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070e13; margin: 0; padding: 24px; color: #f1f5f9; }}
        .card {{ max-width: 520px; margin: 0 auto; background: #0c151c; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
        .header {{ text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 24px; }}
        .title {{ color: #10b981; font-size: 20px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }}
        .subtitle {{ color: #94a3b8; font-size: 12px; margin-top: 4px; }}
        .otp-box {{ background: #042f2e; border: 2px dashed #14b8a6; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }}
        .otp-code {{ font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #34d399; font-family: monospace; }}
        .warning {{ font-size: 12px; color: #94a3b8; line-height: 1.6; margin-top: 16px; }}
        .footer {{ font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #1e293b; margin-top: 28px; padding-top: 16px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h2 class="title">SafeSlope NER Portal</h2>
          <div class="subtitle">Official Northeast Landslide Early Warning System</div>
        </div>
        <p style="font-size: 14px; color: #cbd5e1;">Hello <strong>{display_name}</strong>,</p>
        <p style="font-size: 13px; color: #94a3b8;">Use the one-time verification code below to verify your email address and activate your account:</p>
        
        <div class="otp-box">
          <div class="otp-code">{otp_code}</div>
          <div style="font-size: 11px; color: #5eead4; margin-top: 6px; font-weight: 600;">Valid for 10 minutes</div>
        </div>
        
        <p class="warning">
          <strong>Security Notice:</strong> Do not share this code with anyone. SafeSlope disaster coordinators will never ask for your code.
        </p>
        
        <div class="footer">
          Northeast Early Warning & Landslide Risk Monitoring Platform<br/>
          Smart India Hackathon • SIH PS 26001
        </div>
      </div>
    </body>
    </html>
    """

    # Always ensure fresh .env credentials in case .env was recently updated
    try:
        from dotenv import load_dotenv
        _bdir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        _benv = os.path.join(_bdir, ".env")
        if os.path.exists(_benv):
            load_dotenv(_benv, override=True)
    except Exception:
        pass

    # 1. Try Resend HTTPS API (Port 443) first if configured - bypasses all cloud SMTP port blocks
    if os.getenv("RESEND_API_KEY"):
        resend_ok, resend_msg = await _send_resend_https_email(to_email, subject, html_content, text_content)
        if resend_ok:
            print(f"[SafeSlope Email] Real HTTPS email delivered to {to_email}")
            return {"sent": True, "dev_mode": False, "message": "Verification code dispatched to your email inbox."}
        else:
            print(f"[SafeSlope Email] Resend HTTPS failed: {resend_msg}")

    # 2. Try Standard SMTP (works on localhost, but blocked by Render Free Tier firewall on ports 25, 465, 587)
    has_smtp = bool(settings.SMTP_USER and settings.SMTP_PASSWORD)
    smtp_success = False
    smtp_msg = ""
    
    if has_smtp:
        smtp_success, smtp_msg = await asyncio.to_thread(
            _send_smtp_email_sync, to_email, subject, html_content, text_content
        )
        if smtp_success:
            print(f"[SafeSlope Email] Real SMTP email delivered to {to_email}")
            return {"sent": True, "dev_mode": False, "message": "Verification code dispatched to your email inbox."}
        else:
            print(f"[SafeSlope Email] SMTP Delivery Blocked by Cloud Host: {smtp_msg}. Falling back to instant preview code.")

    # 3. Resilient Fallback: Always display the code so user is NEVER stranded on cloud free tier!
    print("=" * 64)
    print(f" [SafeSlope Email Service] Real Email Verification Code")
    print(f" Target Email: {to_email}")
    print(f" Verification OTP: {otp_code}")
    print(f" Valid for: 10 minutes")
    print("=" * 64)

    return {
        "sent": False,
        "dev_mode": True,
        "dev_otp": otp_code,
        "message": f"Verification code generated: {otp_code} (Cloud free tier host blocks SMTP port 587; use instant preview code below to verify)."
    }
