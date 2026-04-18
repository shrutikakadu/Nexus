from fastapi import FastAPI

app = FastAPI(
    title="Nexus Graduation Portal",
    version="1.0.0"
)

@app.get("/")
def home():
    return {"message": "Nexus Backend Running Successfully"}