from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, AdminRoleEnum
from app.models.application import NoDuesClearance, StatusEnum
from typing import List

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])

@router.get("/pending-clearances/{admin_type}")
def get_pending_clearances(admin_type: str, db: Session = Depends(get_db)):
    """Returns requests pending for a specific admin dept (e.g. library_admin)"""
    query = db.query(NoDuesClearance)
    
    if admin_type == AdminRoleEnum.LIBRARY.value:
        return query.filter(NoDuesClearance.library_status == StatusEnum.PENDING).all()
    elif admin_type == AdminRoleEnum.ACCOUNTS.value:
        return query.filter(NoDuesClearance.accounts_status == StatusEnum.PENDING).all()
    elif admin_type == AdminRoleEnum.LAB.value:
        return query.filter(NoDuesClearance.lab_status == StatusEnum.PENDING).all()
    elif admin_type == AdminRoleEnum.HOSTEL.value:
        return query.filter(NoDuesClearance.hostel_status == StatusEnum.PENDING).all()
    elif admin_type == AdminRoleEnum.DEPARTMENT.value:
        return query.filter(NoDuesClearance.department_status == StatusEnum.PENDING).all()
    else:
        raise HTTPException(status_code=400, detail="Invalid admin type")

@router.put("/update-clearance/{clearance_id}")
def update_clearance_status(clearance_id: int, admin_type: str, status: str, db: Session = Depends(get_db)):
    clearance = db.query(NoDuesClearance).filter(NoDuesClearance.id == clearance_id).first()
    if not clearance:
        raise HTTPException(status_code=404, detail="Clearance not found")
        
    if admin_type == AdminRoleEnum.LIBRARY.value:
        clearance.library_status = status
    elif admin_type == AdminRoleEnum.ACCOUNTS.value:
        clearance.accounts_status = status
    elif admin_type == AdminRoleEnum.LAB.value:
        clearance.lab_status = status
    elif admin_type == AdminRoleEnum.HOSTEL.value:
        clearance.hostel_status = status
    elif admin_type == AdminRoleEnum.DEPARTMENT.value:
        clearance.department_status = status
    else:
        raise HTTPException(status_code=400, detail="Invalid admin type")
        
    # Hackathon Shortcut: if all are approved, mark is_cleared = True
    # (Leaving logic out for brevity, manual checking)
    db.commit()
    db.refresh(clearance)
    return clearance
