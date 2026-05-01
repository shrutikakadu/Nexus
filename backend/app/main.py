from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import payment
from api.routes.Auth_router import router as auth_router
from api.routes.nudge import router as nudge_router
from core.database import Base, engine
from services.scheduler import start_scheduler, stop_scheduler

# Create all tables (includes new clearance_requests & department_authorities)
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown events."""
    # ── Startup ──
    start_scheduler()
    yield
    # ── Shutdown ──
    stop_scheduler()


app = FastAPI(
    title="Nexus Graduation Portal",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(payment.router)
app.include_router(auth_router)
app.include_router(nudge_router)

@app.get("/")
def home():
    return {"message": "Nexus Backend Running Successfully"}