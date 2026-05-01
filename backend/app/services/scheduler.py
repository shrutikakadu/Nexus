"""
Background Scheduler — Runs the nudge cycle every 24 hours using APScheduler.
Starts automatically when the FastAPI server boots up.
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from services.reminder_service import run_nudge_cycle
import logging

logger = logging.getLogger("nexus.scheduler")

scheduler = BackgroundScheduler()


def start_scheduler():
    """Start the background scheduler for automated nudge emails."""
    if scheduler.running:
        logger.info("Scheduler already running.")
        return

    # Run nudge cycle every 24 hours
    scheduler.add_job(
        run_nudge_cycle,
        trigger=IntervalTrigger(hours=24),
        id="nudge_cycle",
        name="Email Nudge Cycle — every 24h",
        replace_existing=True,
    )

    scheduler.start()
    logger.info("✅ Nudge scheduler started — will check for stale requests every 24 hours.")


def stop_scheduler():
    """Gracefully shut down the scheduler."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped.")
