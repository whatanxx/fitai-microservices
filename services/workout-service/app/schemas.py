from datetime import datetime

from pydantic import BaseModel, ConfigDict


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
    target_muscle_group: str | None = None
    is_completed: bool = False

class WorkoutDayCreate(WorkoutDayBase):
    exercises: list[ExerciseCreate] = []

class WorkoutDay(WorkoutDayBase):
    id: int
    plan_id: int
    exercises: list[Exercise] = []

    model_config = ConfigDict(from_attributes=True)

class WorkoutPlanBase(BaseModel):
    user_id: int
    title: str
    duration_weeks: int
    is_active: bool = False
    is_published: bool = False

class WorkoutPlanCreate(WorkoutPlanBase):
    days: list[WorkoutDayCreate]

class WorkoutPlan(WorkoutPlanBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class WorkoutPlanFull(WorkoutPlan):
    days: list[WorkoutDay]
