from fastapi import FastAPI, Depends, HTTPException
from app.schemas import WorkoutRequest, WorkoutPlanResponse
from app.services import coach_service
from app.config import config
import uvicorn

app = FastAPI(
    title="FitAI Coach Service",
    description="Microservice for generating workout plans with Gemini AI",
    version="1.0.0"
)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ai-coach-service"}

@app.post("/coach/suggest", response_model=WorkoutPlanResponse)
async def suggest_workout_plan(request: WorkoutRequest):
    """
    Generate a training plan based on user statistics.
    """
    try:
        plan = await coach_service.generate_plan(request.user_data)
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=config.PORT, reload=True)
