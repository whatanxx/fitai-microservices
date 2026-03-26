from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from contextlib import asynccontextmanager

import app.models as models
import app.schemas as schemas
from app.database import get_db, init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    await init_db()
    yield

app = FastAPI(title="Workout Plan Service", version="0.1.0", lifespan=lifespan)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "works"}

@app.post("/api/workouts/plans", response_model=schemas.WorkoutPlan, status_code=status.HTTP_201_CREATED)
async def create_plan(plan: schemas.WorkoutPlanCreate, db: AsyncSession = Depends(get_db)):
    # Create the main plan object
    db_plan = models.WorkoutPlan(
        user_id=plan.user_id,
        title=plan.title,
        duration_weeks=plan.duration_weeks
    )
    db.add(db_plan)
    await db.flush() # To get db_plan.id
    
    # Add days and exercises
    for day_data in plan.days:
        db_day = models.WorkoutDay(
            plan_id=db_plan.id,
            week_number=day_data.week_number,
            day_number=day_data.day_number,
            is_rest_day=day_data.is_rest_day,
            target_muscle_group=day_data.target_muscle_group,
            is_completed=day_data.is_completed
        )
        db.add(db_day)
        await db.flush() # To get db_day.id
        
        for ex_data in day_data.exercises:
            db_exercise = models.Exercise(
                day_id=db_day.id,
                name=ex_data.name,
                sets=ex_data.sets,
                reps=ex_data.reps,
                rest_time_seconds=ex_data.rest_time_seconds
            )
            db.add(db_exercise)
    
    await db.commit()
    await db.refresh(db_plan)
    return db_plan

@app.get("/api/workouts/plans/user/{user_id}", response_model=List[schemas.WorkoutPlan])
async def get_user_plans(user_id: int, db: AsyncSession = Depends(get_db)):
    query = select(models.WorkoutPlan).where(models.WorkoutPlan.user_id == user_id)
    result = await db.execute(query)
    return result.scalars().all()

@app.get("/api/workouts/plans/{plan_id}", response_model=schemas.WorkoutPlanFull)
async def get_plan(plan_id: int, db: AsyncSession = Depends(get_db)):
    # Using selectinload to eagerly load nested relationships
    query = select(models.WorkoutPlan).where(models.WorkoutPlan.id == plan_id).options(
        selectinload(models.WorkoutPlan.days).selectinload(models.WorkoutDay.exercises)
    )
    result = await db.execute(query)
    db_plan = result.scalar_one_or_none()
    
    if db_plan is None:
        raise HTTPException(status_code=404, detail="Workout plan not found")
    
    return db_plan

@app.patch("/api/workouts/days/{day_id}/complete", response_model=schemas.WorkoutDay)
async def complete_day(day_id: int, db: AsyncSession = Depends(get_db)):
    query = select(models.WorkoutDay).where(models.WorkoutDay.id == day_id).options(
        selectinload(models.WorkoutDay.exercises)
    )
    result = await db.execute(query)
    db_day = result.scalar_one_or_none()
    
    if db_day is None:
        raise HTTPException(status_code=404, detail="Workout day not found")
    
    db_day.is_completed = True
    await db.commit()
    await db.refresh(db_day)
    return db_day

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
