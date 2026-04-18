from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import payment
from api.routes.Auth_router import router as auth_router
from core.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Nexus Graduation Portal", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(payment.router)
app.include_router(auth_router)

@app.get("/")
def home():
    return {"message": "Nexus Backend Running Successfully"}