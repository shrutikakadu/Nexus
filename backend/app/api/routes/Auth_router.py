from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import uuid, os
from dotenv import load_dotenv

from core.database import get_db
from models.user import User, StudentProfile

load_dotenv()

router = APIRouter(prefix="/api/auth", tags=["auth"])

SECRET_KEY = os.getenv("SECRET_KEY", "nexus_super_secret_key_2025")
ALGORITHM  = "HS256"
TOKEN_EXPIRE_HOURS = 72

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── Schemas ──────────────────────────────────────────────────────────────────

class RegisterIn(BaseModel):
    email:    EmailStr
    password: str
    role:     str = "student"

class LoginIn(BaseModel):
    email:    EmailStr
    password: str

class ProfileIn(BaseModel):
    roll:     str
    name:     str
    email:    str
    phone:    str = ""
    dob:      str = ""
    gender:   str = ""
    dept:     str = ""
    batch:    str = ""
    semester: str = ""
    cgpa:     str = ""
    hostel:   str = ""
    advisor:  str = ""
    college:  str = ""


# ── Helpers ───────────────────────────────────────────────────────────────────

def hash_pw(pw: str) -> str:
    return pwd_ctx.hash(pw)

def verify_pw(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)

def make_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/register")
def register(body: RegisterIn, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered.")
    user = User(
        id=str(uuid.uuid4()),
        email=body.email,
        password=hash_pw(body.password),
        role=body.role,
    )
    db.add(user)
    db.commit()
    return {"message": "Registered successfully."}


@router.post("/login")
def login(body: LoginIn, db: Session = Depends(get_db)):
    # Demo bypass — password "demo123" works for any email
    if body.password == "demo123":
        token = make_token({"sub": body.email, "role": "student"})
        # Check if student profile exists
        profile = db.query(StudentProfile).filter(StudentProfile.email == body.email).first()
        return {
            "access_token": token,
            "role": "student",
            "profile_complete": profile.profile_complete if profile else False,
            "roll": profile.roll if profile else None,
        }

    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_pw(body.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = make_token({"sub": user.email, "role": user.role})
    profile = db.query(StudentProfile).filter(StudentProfile.email == body.email).first()
    return {
        "access_token": token,
        "role": user.role,
        "profile_complete": profile.profile_complete if profile else False,
        "roll": profile.roll if profile else None,
    }


@router.post("/profile")
def save_profile(body: ProfileIn, db: Session = Depends(get_db)):
    existing = db.query(StudentProfile).filter(StudentProfile.roll == body.roll).first()
    clearance_id = f"NX-{body.batch[-4:]}-{body.roll[-3:]}" if body.roll else "NX-0000"

    if existing:
        # Update
        for field, val in body.dict().items():
            setattr(existing, field, val)
        existing.profile_complete = True
        existing.clearance_id = clearance_id
        db.commit()
        db.refresh(existing)
        return {"message": "Profile updated.", "profile": _serialize(existing)}
    else:
        profile = StudentProfile(
            **body.dict(),
            clearance_id=clearance_id,
            profile_complete=True,
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
        return {"message": "Profile saved.", "profile": _serialize(profile)}


@router.get("/profile/{roll}")
def get_profile(roll: str, db: Session = Depends(get_db)):
    profile = db.query(StudentProfile).filter(StudentProfile.roll == roll).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return _serialize(profile)


@router.get("/profile/by-email/{email}")
def get_profile_by_email(email: str, db: Session = Depends(get_db)):
    profile = db.query(StudentProfile).filter(StudentProfile.email == email).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return _serialize(profile)


def _serialize(p: StudentProfile) -> dict:
    return {
        "roll": p.roll, "name": p.name, "email": p.email,
        "phone": p.phone, "dob": p.dob, "gender": p.gender,
        "dept": p.dept, "batch": p.batch, "semester": p.semester,
        "cgpa": p.cgpa, "hostel": p.hostel, "advisor": p.advisor,
        "college": p.college, "clearance_id": p.clearance_id,
        "profile_complete": p.profile_complete,
    }