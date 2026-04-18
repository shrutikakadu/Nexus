from fastapi import FastAPI, UploadFile, Form, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.services.fraud_detector import analyze_document

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

@app.get("/")
def home():
    return {"message": "Nexus Graduation Portal Backend Running Successfully"}

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
