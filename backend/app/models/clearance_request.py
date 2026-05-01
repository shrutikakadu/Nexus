"""
ClearanceRequest model — tracks per-department clearance status for each student.
Each row = one student × one department.
When a student submits their clearance application, 6 rows are created (one per dept).
The 'last_action_at' column is updated whenever an admin takes action.
If a department has not acted within 2 days, the row is considered 'stale'.
"""

from sqlalchemy import Column, String, Integer, DateTime, Text, Boolean
from sqlalchemy.sql import func
from core.database import Base


class ClearanceRequest(Base):
    __tablename__ = "clearance_requests"

    id             = Column(Integer, primary_key=True, autoincrement=True)
    student_id     = Column(String, nullable=False, index=True)        # roll number
    student_name   = Column(String, nullable=False)
    student_email  = Column(String, nullable=False)
    department     = Column(String, nullable=False)                     # Library, Lab, Accounts, Hostel, HOD, Principal
    status         = Column(String, default="pending")                  # pending | approved | rejected
    admin_comment  = Column(Text, default="")
    nudge_count    = Column(Integer, default=0)                         # how many reminders sent
    last_nudge_at  = Column(DateTime(timezone=True), nullable=True)     # last time a nudge was sent
    created_at     = Column(DateTime(timezone=True), server_default=func.now())
    last_action_at = Column(DateTime(timezone=True), server_default=func.now())  # last admin interaction


class DepartmentAuthority(Base):
    """Maps departments to their authority email addresses for nudging."""
    __tablename__ = "department_authorities"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    department = Column(String, unique=True, nullable=False)
    name       = Column(String, nullable=False)
    email      = Column(String, nullable=False)
    role       = Column(String, default="admin")   # admin / hod / principal
