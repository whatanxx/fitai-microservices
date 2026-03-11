from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app import crud, schemas, database
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    await database.init_db()
    yield

app = FastAPI(
    title="FitAI Workout Service",
    description="Microservice for CRUD operations on workout plans",
    version="1.0.0",
    lifespan=lifespan
)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "workout-service"}

@app.post("/api/plans", response_model=schemas.WorkoutPlan)
async def create_plan(plan: schemas.WorkoutPlanCreate, db: AsyncSession = Depends(database.get_db)):
    """
    Create a new workout plan with exercises.
    """
    return await crud.create_workout_plan(db, plan)

@app.get("/api/plans/{user_id}", response_model=List[schemas.WorkoutPlan])
async def get_user_plans(user_id: int, db: AsyncSession = Depends(database.get_db)):
    """
    Get all workout plans for a specific user.
    """
    plans = await crud.get_plans_by_user(db, user_id)
    return plans

@app.get("/api/plans/detail/{plan_id}", response_model=schemas.WorkoutPlan)
async def get_plan_detail(plan_id: int, db: AsyncSession = Depends(database.get_db)):
    """
    Get detailed information about a specific workout plan.
    """
    plan = await crud.get_plan_by_id(db, plan_id)
    if plan is None:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan
