from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, RoleEnum
from app.models.application import GraduationApplication, NoDuesClearance, StatusEnum
from sqlalchemy import text
# Note: For MVP we simulate currently logged-in student using `student_id` in query params

router = APIRouter(prefix="/api/v1/student", tags=["student"])

@router.post("/apply-graduation/{student_id}")
def apply_graduation(student_id: int, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id, User.role == RoleEnum.STUDENT).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    existing_app = db.query(GraduationApplication).filter(GraduationApplication.student_id == student_id).first()
    if existing_app:
        raise HTTPException(status_code=400, detail="Graduation application already exists")
        
    # Create main application
    app = GraduationApplication(student_id=student_id)
    db.add(app)
    db.commit()
    db.refresh(app)
    
    # Create connected No-Dues
    clearance = NoDuesClearance(application_id=app.id, student_id=student_id)
    db.add(clearance)
    db.commit()
    
    return {"message": "Application submitted successfully", "application_id": app.id}

@router.get("/my-clearance/{student_id}")
def get_my_clearance(student_id: int, db: Session = Depends(get_db)):
    clearance = db.query(NoDuesClearance).filter(NoDuesClearance.student_id == student_id).first()
    if not clearance:
        raise HTTPException(status_code=404, detail="No clearance record found")
    return clearance
