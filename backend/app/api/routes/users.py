from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from core.database import Base

class User(Base):
    __tablename__ = "users"

    id         = Column(String, primary_key=True)   # roll number as ID
    email      = Column(String, unique=True, index=True, nullable=False)
    password   = Column(String, nullable=False)      # hashed
    role       = Column(String, default="student")   # student / admin
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    roll        = Column(String, primary_key=True)
    name        = Column(String, nullable=False)
    email       = Column(String, nullable=False)
    phone       = Column(String)
    dob         = Column(String)
    gender      = Column(String)
    dept        = Column(String)
    batch       = Column(String)
    semester    = Column(String)
    cgpa        = Column(String)
    hostel      = Column(String)
    advisor     = Column(String)
    college     = Column(String)
    clearance_id = Column(String)
    profile_complete = Column(Boolean, default=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())