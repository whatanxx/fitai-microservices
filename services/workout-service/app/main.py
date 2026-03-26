from fastapi import FastAPI

app = FastAPI(
    title="Workout Service",
    description="Manages workout plans and progress tracking for FitAI.",
    version="1.0.0",
)

@app.get("/health", tags=["health"])
def health_check():
    return {"status": "works"}
