from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import payment

app = FastAPI(
    title="Nexus Graduation Portal",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(payment.router)

@app.get("/")
def home():
    return {"message": "Nexus Backend Running Successfully"}