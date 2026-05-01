"""
Reminder Service — Scans the database for stale clearance requests
and triggers nudge emails to the responsible department authorities.

A request is "stale" if:
  - status == 'pending'
  - last_action_at is older than 2 days

Runs every 24 hours via APScheduler when the server starts.
Can also be triggered manually via API endpoint.
"""

import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from core.database import SessionLocal
from models.clearance_request import ClearanceRequest, DepartmentAuthority
from services.email_service import send_nudge_email

logger = logging.getLogger("nexus.reminder")
logger.setLevel(logging.INFO)

# Add a console handler if none exists
if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setFormatter(logging.Formatter("%(asctime)s [%(name)s] %(levelname)s: %(message)s"))
    logger.addHandler(ch)

STALE_THRESHOLD_DAYS = 2


def find_stale_requests(db: Session):
    """
    Find all clearance requests that are still 'pending'
    and have not been acted upon for more than STALE_THRESHOLD_DAYS.
    Returns a dict: { department: [list of stale ClearanceRequest objects] }
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=STALE_THRESHOLD_DAYS)

    stale = (
        db.query(ClearanceRequest)
        .filter(
            ClearanceRequest.status == "pending",
            ClearanceRequest.last_action_at <= cutoff,
        )
        .all()
    )

    # Group by department
    grouped = {}
    for req in stale:
        grouped.setdefault(req.department, []).append(req)

    return grouped


def run_nudge_cycle():
    """
    Main nudge cycle — called by the scheduler every 24 hours.
    1. Finds all stale requests grouped by department
    2. Looks up the authority email for each department
    3. Sends a single consolidated nudge email per department
    4. Updates nudge_count and last_nudge_at
    """
    db = SessionLocal()
    results = {"emails_sent": 0, "departments_nudged": [], "errors": []}

    try:
        logger.info("🔔 Starting email nudge cycle...")
        stale_by_dept = find_stale_requests(db)

        if not stale_by_dept:
            logger.info("✅ No stale requests found. All departments are up to date!")
            results["message"] = "No stale requests found."
            return results

        for department, requests in stale_by_dept.items():
            # Look up the authority for this department
            authority = (
                db.query(DepartmentAuthority)
                .filter(DepartmentAuthority.department == department)
                .first()
            )

            if not authority:
                msg = f"⚠️ No authority email configured for '{department}' — skipping."
                logger.warning(msg)
                results["errors"].append(msg)
                continue

            # Build the stale request data for the email
            stale_data = []
            for req in requests:
                days_stale = (datetime.now(timezone.utc) - req.last_action_at.replace(tzinfo=timezone.utc)).days
                stale_data.append({
                    "student_name": req.student_name,
                    "student_id": req.student_id,
                    "student_email": req.student_email,
                    "days_stale": days_stale,
                })

            # Send the consolidated nudge email
            success, message = send_nudge_email(
                to_email=authority.email,
                authority_name=authority.name,
                department=department,
                stale_requests=stale_data,
            )

            if success:
                logger.info(f"✉️  Nudge sent to {authority.name} ({authority.email}) for {department} — {len(requests)} pending")
                results["emails_sent"] += 1
                results["departments_nudged"].append(department)

                # Update nudge tracking on each request
                for req in requests:
                    req.nudge_count += 1
                    req.last_nudge_at = datetime.now(timezone.utc)
                db.commit()
            else:
                logger.error(f"❌ Failed to nudge {department}: {message}")
                results["errors"].append(f"{department}: {message}")

        logger.info(f"🔔 Nudge cycle complete — {results['emails_sent']} emails sent.")

    except Exception as e:
        logger.exception(f"❌ Nudge cycle failed: {e}")
        results["errors"].append(str(e))
    finally:
        db.close()

    return results


def get_stale_summary():
    """Get a summary of all stale requests (for the API/dashboard)."""
    db = SessionLocal()
    try:
        stale_by_dept = find_stale_requests(db)
        summary = {}
        for dept, requests in stale_by_dept.items():
            authority = db.query(DepartmentAuthority).filter(
                DepartmentAuthority.department == dept
            ).first()
            summary[dept] = {
                "count": len(requests),
                "authority": authority.name if authority else "Not configured",
                "authority_email": authority.email if authority else None,
                "students": [
                    {
                        "student_id": r.student_id,
                        "student_name": r.student_name,
                        "days_stale": (datetime.now(timezone.utc) - r.last_action_at.replace(tzinfo=timezone.utc)).days,
                        "nudge_count": r.nudge_count,
                    }
                    for r in requests
                ],
            }
        return summary
    finally:
        db.close()
