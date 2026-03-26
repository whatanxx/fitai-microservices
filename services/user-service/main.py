from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="User Profile Service", version="0.1.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simplified Profile Model (for demo/dev purposes)
class UserProfile(BaseModel):
    id: int
    age: int
    gender: str
    height_cm: int
    current_weight_kg: float
    medical_conditions: Optional[str] = None
    fitness_goal: str
    training_time_minutes: int
    training_days_per_week: int
    experience_level: str
    available_equipment: List[str]

# Dummy database for testing AI Coach flow
DUMMY_PROFILES = {
    1: UserProfile(
        id=1,
        age=25,
        gender="male",
        height_cm=180,
        current_weight_kg=85.0,
        fitness_goal="Muscle Gain",
        training_time_minutes=60,
        training_days_per_week=4,
        experience_level="Intermediate",
        available_equipment=["Dumbbells", "Barbell", "Bench"]
    )
}

@app.get("/health")
async def health_check():
    return {"status": "works"}

@app.get("/profiles/{user_id}", response_model=UserProfile)
async def get_profile(user_id: int):
    if user_id not in DUMMY_PROFILES:
        raise HTTPException(status_code=404, detail="Profile not found")
    return DUMMY_PROFILES[user_id]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
