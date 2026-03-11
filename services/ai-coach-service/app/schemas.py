from pydantic import BaseModel, Field
from typing import List, Optional

class UserStats(BaseModel):
    age: int = Field(..., ge=1, le=120)
    weight: float = Field(..., ge=1, le=500)
    height: float = Field(..., ge=1, le=300)
    fitness_level: str = Field(..., description="e.g., Beginner, Intermediate, Advanced")
    goal: str = Field(..., description="e.g., Lose weight, Build muscle, Endurance")

class WorkoutRequest(BaseModel):
    user_data: UserStats

class Exercise(BaseModel):
    name: str
    sets: int
    reps: Optional[str] = None
    rest_time: Optional[str] = None
    notes: Optional[str] = None

class WorkoutSession(BaseModel):
    day: str
    session_title: str
    exercises: List[Exercise]
    duration_minutes: int

class WorkoutPlanResponse(BaseModel):
    plan_name: str
    sessions: List[WorkoutSession]
    coach_advice: str
