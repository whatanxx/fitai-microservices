from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class ExerciseBase(BaseModel):
    name: str
    sets: int
    reps: Optional[str] = None
    rest_time: Optional[str] = None
    notes: Optional[str] = None

class ExerciseCreate(ExerciseBase):
    pass

class Exercise(ExerciseBase):
    id: int
    plan_id: int
    
    model_config = ConfigDict(from_attributes=True)

class WorkoutPlanBase(BaseModel):
    plan_name: str
    coach_advice: Optional[str] = None
    user_id: int

class WorkoutPlanCreate(WorkoutPlanBase):
    exercises: List[ExerciseCreate]

class WorkoutPlan(WorkoutPlanBase):
    id: int
    created_at: datetime
    exercises: List[Exercise]

    model_config = ConfigDict(from_attributes=True)
