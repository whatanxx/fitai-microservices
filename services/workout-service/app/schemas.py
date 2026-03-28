from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ExerciseBase(BaseModel):
    name: str
    sets: int
    completed_sets: int = 0
    reps: str
    rest_time_seconds: int

class ExerciseCreate(ExerciseBase):
    pass

class Exercise(ExerciseBase):
    id: int
    day_id: int
    
    model_config = ConfigDict(from_attributes=True)

class WorkoutDayBase(BaseModel):
    week_number: int
    day_number: int
    is_rest_day: bool
    target_muscle_group: Optional[str] = None
    is_completed: bool = False

class WorkoutDayCreate(WorkoutDayBase):
    exercises: List[ExerciseCreate] = []

class WorkoutDay(WorkoutDayBase):
    id: int
    plan_id: int
    exercises: List[Exercise] = []
    
    model_config = ConfigDict(from_attributes=True)

class WorkoutPlanBase(BaseModel):
    user_id: int
    title: str
    duration_weeks: int
    is_active: bool = False

class WorkoutPlanCreate(WorkoutPlanBase):
    days: List[WorkoutDayCreate]

class WorkoutPlan(WorkoutPlanBase):
    id: int
    created_at: datetime
    is_active: bool
    
    model_config = ConfigDict(from_attributes=True)

class WorkoutPlanFull(WorkoutPlan):
    days: List[WorkoutDay]
