from fastapi import FastAPI, UploadFile, Form, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.services.fraud_detector import analyze_document
from app.core.database import get_db, engine, Base
from app.api import auth_router, student_router, admin_router

# Import all models so Base can see them before create_all
import app.models.user
import app.models.application

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Nexus Graduation Portal",
    version="1.0.0"
)

# Allow all origins for the hackathon
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(student_router.router)
app.include_router(admin_router.router)

@app.get("/")
def home(db: Session = Depends(get_db)):
    # Test DB Connection
    try:
        db.execute(text("SELECT 1"))
        db_status = "Connected to PostGres (Neon)"
    except Exception as e:
        db_status = f"Database Connection Failed: {str(e)}"
        
    return {
        "message": "Nexus Graduation Portal Backend Running Successfully",
        "database_status": db_status
    }

@app.post("/api/v1/fraud-detect")
async def detect_fraud(
    file: UploadFile = File(...),
    student_name: str = Form(...)
):
    """
    Checks uploaded receipt/document for potential fraud.
    Returns a JSON containing the fraud score, risk flag, and reasons.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")
        
    try:
        contents = await file.read()
        result = analyze_document(contents, student_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
