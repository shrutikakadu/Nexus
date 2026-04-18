from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
import datetime
from app.core.database import Base

class StatusEnum:
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    LOCKED = "locked"

class GraduationApplication(Base):
    __tablename__ = "graduation_applications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    
    status = Column(String, default=StatusEnum.PENDING)
    
    # Project submission details
    project_report_url = Column(String, nullable=True)
    project_ppt_url = Column(String, nullable=True)
    source_code_url = Column(String, nullable=True)
    project_status = Column(String, default=StatusEnum.PENDING)
    project_score = Column(Float, nullable=True)
    
    # Track document fraud score
    fraud_score = Column(Float, default=0.0)
    risk_detected = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    student = relationship("User")
    clearance = relationship("NoDuesClearance", back_populates="application", uselist=False)

class NoDuesClearance(Base):
    __tablename__ = "no_dues_clearance"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("graduation_applications.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    
    library_status = Column(String, default=StatusEnum.PENDING)
    accounts_status = Column(String, default=StatusEnum.PENDING)
    lab_status = Column(String, default=StatusEnum.LOCKED)
    hostel_status = Column(String, default=StatusEnum.LOCKED)
    department_status = Column(String, default=StatusEnum.LOCKED)
    
    # Track clearance status globally
    is_cleared = Column(Boolean, default=False)
    
    application = relationship("GraduationApplication", back_populates="clearance")
    student = relationship("User")
