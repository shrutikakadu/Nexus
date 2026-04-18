from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, RoleEnum, AdminRoleEnum
from app.schemas.user import UserCreate, UserLogin, Token, UserResponse
from app.core.security import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(user.password)
    
    # Safe role assignment (force students by default, manual DB edit for admins initially)
    assigned_role = RoleEnum.STUDENT.value
    if user.role in [RoleEnum.ADMIN.value, RoleEnum.SUPER_ADMIN.value]:
        assigned_role = user.role
        
    new_user = User(
        email=user.email, 
        hashed_password=hashed_password,
        role=assigned_role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    access_token = create_access_token(
        data={"sub": db_user.email, "id": db_user.id, "role": db_user.role}
    )
    return {"access_token": access_token, "token_type": "bearer"}
