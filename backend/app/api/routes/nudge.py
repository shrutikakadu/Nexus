"""
Nexus Nudge API Routes
──────────────────────
Endpoints for the Automated Email Nudge System.
"""

from fastapi import APIRouter
from services.reminder_service import run_nudge_check, DEMO_APPLICATIONS, find_stale_requests, STALE_THRESHOLD_DAYS
from services.email_service import send_email, build_nudge_email

router = APIRouter(prefix="/api/nudge", tags=["nudge"])


@router.get("/status")
def nudge_status():
    """Check how many stale requests exist right now (without sending emails)."""
    stale = find_stale_requests(DEMO_APPLICATIONS, STALE_THRESHOLD_DAYS)
    return {
        "stale_count": len(stale),
        "threshold_days": STALE_THRESHOLD_DAYS,
        "stale_requests": [
            {
                "clearance_id": s["clearance_id"],
                "student": s["student_name"],
                "waiting_dept": s["stale_dept"],
                "authority": s["authority_name"],
                "days_pending": s["days_pending"],
            }
            for s in stale
        ],
    }


@router.post("/trigger")
def trigger_nudge():
    """
    Manually trigger the nudge check (sends emails NOW).
    Useful for demo purposes and admin dashboards.
    """
    result = run_nudge_check()
    return result


@router.get("/test-email")
def test_email(to: str = ""):
    """
    Send a test nudge email to verify Gmail SMTP is working.
    Usage: POST /api/nudge/test-email?to=your@email.com
    """
    if not to:
        return {"success": False, "message": "Please provide ?to=your@email.com"}

    html = build_nudge_email(
        authority_name="Test Authority",
        authority_dept="Library",
        student_name="Demo Student",
        student_roll="CS2025099",
        days_pending=3,
        clearance_id="NX-TEST-001",
    )
    result = send_email(to, "🧪 Nexus Test Email — Nudge System Working!", html)
    return result
