"""
<<<<<<< HEAD
Nexus Nudge API Routes
──────────────────────
Endpoints for the Automated Email Nudge System.
"""

from fastapi import APIRouter
from services.reminder_service import run_nudge_check, DEMO_APPLICATIONS, find_stale_requests, STALE_THRESHOLD_DAYS
from services.email_service import send_email, build_nudge_email
=======
Nudge API Routes — Manage the email nudge system.

Endpoints:
  POST /api/nudge/sync-clearance      — Sync clearance data from frontend to DB
  GET  /api/nudge/stale                — View all stale (pending > 2 days) requests
  POST /api/nudge/trigger              — Manually trigger a nudge cycle
  GET  /api/nudge/authorities          — List configured department authorities
  POST /api/nudge/authorities          — Add/update a department authority
  POST /api/nudge/test-email           — Send a test email to verify Gmail API
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timezone

from core.database import get_db
from models.clearance_request import ClearanceRequest, DepartmentAuthority
from services.reminder_service import run_nudge_cycle, get_stale_summary
from services.email_service import send_test_email
>>>>>>> 4d86a8e (Restore lost source code and features from detached HEAD)

router = APIRouter(prefix="/api/nudge", tags=["nudge"])


<<<<<<< HEAD
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
=======
# ── Schemas ──────────────────────────────────────────────────────────────────

class SyncClearanceItem(BaseModel):
    student_id: str
    student_name: str
    student_email: str
    department: str
    status: str = "pending"
    admin_comment: str = ""

class SyncClearanceRequest(BaseModel):
    requests: List[SyncClearanceItem]

class AuthorityIn(BaseModel):
    department: str
    name: str
    email: str
    role: str = "admin"

class TestEmailIn(BaseModel):
    email: str


# ── Routes ───────────────────────────────────────────────────────────────────

@router.post("/sync-clearance")
def sync_clearance(body: SyncClearanceRequest, db: Session = Depends(get_db)):
    """
    Sync clearance request data from the frontend store into the database.
    Called whenever the student dashboard submits/updates clearance applications.
    This upserts — if a (student_id, department) pair exists, it updates; otherwise inserts.
    """
    created = 0
    updated = 0

    for item in body.requests:
        existing = (
            db.query(ClearanceRequest)
            .filter(
                ClearanceRequest.student_id == item.student_id,
                ClearanceRequest.department == item.department,
            )
            .first()
        )

        if existing:
            # Only update if status changed
            if existing.status != item.status:
                existing.status = item.status
                existing.admin_comment = item.admin_comment
                existing.last_action_at = datetime.now(timezone.utc)
                updated += 1
            elif item.admin_comment and existing.admin_comment != item.admin_comment:
                existing.admin_comment = item.admin_comment
                updated += 1
        else:
            new_req = ClearanceRequest(
                student_id=item.student_id,
                student_name=item.student_name,
                student_email=item.student_email,
                department=item.department,
                status=item.status,
                admin_comment=item.admin_comment,
            )
            db.add(new_req)
            created += 1

    db.commit()
    return {
        "message": f"Sync complete: {created} created, {updated} updated.",
        "created": created,
        "updated": updated,
    }


@router.get("/stale")
def get_stale_requests():
    """Get a summary of all stale requests grouped by department."""
    summary = get_stale_summary()
    total_stale = sum(dept["count"] for dept in summary.values())
    return {
        "total_stale": total_stale,
        "departments": summary,
>>>>>>> 4d86a8e (Restore lost source code and features from detached HEAD)
    }


@router.post("/trigger")
def trigger_nudge():
<<<<<<< HEAD
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
=======
    """Manually trigger a nudge cycle (sends emails to all departments with stale requests)."""
    results = run_nudge_cycle()
    return {
        "message": "Nudge cycle executed.",
        "results": results,
    }


@router.get("/authorities")
def list_authorities(db: Session = Depends(get_db)):
    """List all configured department authorities."""
    authorities = db.query(DepartmentAuthority).all()
    return [
        {
            "id": a.id,
            "department": a.department,
            "name": a.name,
            "email": a.email,
            "role": a.role,
        }
        for a in authorities
    ]


@router.post("/authorities")
def upsert_authority(body: AuthorityIn, db: Session = Depends(get_db)):
    """Add or update a department authority email."""
    existing = (
        db.query(DepartmentAuthority)
        .filter(DepartmentAuthority.department == body.department)
        .first()
    )

    if existing:
        existing.name = body.name
        existing.email = body.email
        existing.role = body.role
        db.commit()
        return {"message": f"Updated authority for {body.department}.", "action": "updated"}
    else:
        authority = DepartmentAuthority(
            department=body.department,
            name=body.name,
            email=body.email,
            role=body.role,
        )
        db.add(authority)
        db.commit()
        return {"message": f"Added authority for {body.department}.", "action": "created"}


@router.post("/authorities/seed")
def seed_authorities(db: Session = Depends(get_db)):
    """
    Seed default department authorities with placeholder emails.
    You should update these with real emails via POST /api/nudge/authorities.
    """
    defaults = [
        {"department": "Library",   "name": "Dr. Meena Patil",     "email": "library.admin@nexus.edu",    "role": "admin"},
        {"department": "Lab",       "name": "Prof. Rajesh Kumar",  "email": "lab.admin@nexus.edu",        "role": "admin"},
        {"department": "Accounts",  "name": "Mr. Suresh Reddy",    "email": "accounts.admin@nexus.edu",   "role": "admin"},
        {"department": "Hostel",    "name": "Mrs. Kavita Sharma",  "email": "hostel.admin@nexus.edu",     "role": "admin"},
        {"department": "HOD",       "name": "Dr. Anand Joshi",     "email": "hod.cse@nexus.edu",          "role": "hod"},
        {"department": "Principal", "name": "Dr. R. K. Sharma",    "email": "principal@nexus.edu",        "role": "principal"},
    ]

    seeded = 0
    for d in defaults:
        existing = db.query(DepartmentAuthority).filter(
            DepartmentAuthority.department == d["department"]
        ).first()
        if not existing:
            db.add(DepartmentAuthority(**d))
            seeded += 1

    db.commit()
    return {"message": f"Seeded {seeded} department authorities.", "seeded": seeded}


@router.post("/test-email")
def test_email(body: TestEmailIn):
    """Send a test email to verify the Gmail API credentials are working."""
    success, message = send_test_email(body.email)
    if success:
        return {"message": message, "status": "success"}
    else:
        raise HTTPException(status_code=500, detail=message)


@router.get("/status")
def scheduler_status():
    """Check the status of the nudge scheduler."""
    from services.scheduler import scheduler
    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "name": job.name,
            "next_run": str(job.next_run_time) if job.next_run_time else None,
        })
    return {
        "scheduler_running": scheduler.running,
        "jobs": jobs,
    }
>>>>>>> 4d86a8e (Restore lost source code and features from detached HEAD)
