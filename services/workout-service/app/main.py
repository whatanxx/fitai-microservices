from contextlib import asynccontextmanager
from datetime import UTC, datetime

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

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
    # 0. Deactivate all other plans for this user if this one is intended to be active (or just always for new ones)
    from sqlalchemy import update
    deactivate_query = update(models.WorkoutPlan).where(
        models.WorkoutPlan.user_id == plan.user_id
    ).values(is_active=False)
    await db.execute(deactivate_query)

    # Create the main plan object
    db_plan = models.WorkoutPlan(
        user_id=plan.user_id,
        title=plan.title,
        duration_weeks=plan.duration_weeks,
        is_active=True # Newest plan is active by default
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

@app.get("/api/workouts/plans/user/{user_id}", response_model=list[schemas.WorkoutPlan])
async def get_user_plans(user_id: int, db: AsyncSession = Depends(get_db)):
    query = select(models.WorkoutPlan).where(models.WorkoutPlan.user_id == user_id).order_by(models.WorkoutPlan.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@app.get("/api/workouts/plans/public", response_model=list[schemas.WorkoutPlan])
async def get_public_plans(db: AsyncSession = Depends(get_db)):
    query = select(models.WorkoutPlan).where(models.WorkoutPlan.is_published == True).order_by(models.WorkoutPlan.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@app.patch("/api/workouts/plans/{plan_id}/publish", response_model=schemas.WorkoutPlan)
async def publish_plan(plan_id: int, db: AsyncSession = Depends(get_db)):
    query = select(models.WorkoutPlan).where(models.WorkoutPlan.id == plan_id)
    result = await db.execute(query)
    db_plan = result.scalar_one_or_none()

    if db_plan is None:
        raise HTTPException(status_code=404, detail="Workout plan not found")

    db_plan.is_published = True  # type: ignore
    await db.commit()
    await db.refresh(db_plan)
    return db_plan

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

    # TYGODNIOWY RESET LOGIC
    now = datetime.now(UTC)
    # Check if the plan was updated in a different ISO week than today
    if db_plan.updated_at.isocalendar()[1] != now.isocalendar()[1]:
        # Reset all days and exercises for this plan
        for day in db_plan.days:
            day.is_completed = False  # type: ignore
            for exercise in day.exercises:
                exercise.completed_sets = 0  # type: ignore

        # Explicitly update the timestamp to now so we don't reset again this week
        db_plan.updated_at = now  # type: ignore
        await db.commit()
        await db.refresh(db_plan)

    # Sort results manually to ensure stability if the query loader doesn't
    db_plan.days.sort(key=lambda x: x.day_number)
    for day in db_plan.days:
        day.exercises.sort(key=lambda x: x.id)

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

    db_day.is_completed = True  # type: ignore
    await db.commit()
    await db.refresh(db_day)
    return db_day

@app.patch("/api/workouts/exercises/{exercise_id}/complete-set", response_model=schemas.Exercise)
async def complete_set(exercise_id: int, db: AsyncSession = Depends(get_db)):
    query = select(models.Exercise).where(models.Exercise.id == exercise_id)
    result = await db.execute(query)
    db_exercise = result.scalar_one_or_none()

    if db_exercise is None:
        raise HTTPException(status_code=404, detail="Exercise not found")

    if db_exercise.completed_sets < db_exercise.sets:
        db_exercise.completed_sets += 1  # type: ignore
        await db.commit()
        await db.refresh(db_exercise)

    return db_exercise

@app.delete("/api/workouts/plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plan(plan_id: int, db: AsyncSession = Depends(get_db)):
    query = select(models.WorkoutPlan).where(models.WorkoutPlan.id == plan_id)
    result = await db.execute(query)
    db_plan = result.scalar_one_or_none()

    if db_plan is None:
        raise HTTPException(status_code=404, detail="Workout plan not found")

    await db.delete(db_plan)
    await db.commit()
    return None

@app.patch("/api/workouts/plans/{plan_id}", response_model=schemas.WorkoutPlan)
async def update_plan_title(plan_id: int, title: str, db: AsyncSession = Depends(get_db)):
    query = select(models.WorkoutPlan).where(models.WorkoutPlan.id == plan_id)
    result = await db.execute(query)
    db_plan = result.scalar_one_or_none()

    if db_plan is None:
        raise HTTPException(status_code=404, detail="Workout plan not found")

    db_plan.title = title  # type: ignore
    await db.commit()
    await db.refresh(db_plan)
    return db_plan

@app.patch("/api/workouts/plans/{plan_id}/activate", response_model=schemas.WorkoutPlan)
async def activate_plan(plan_id: int, db: AsyncSession = Depends(get_db)):
    # 1. Get the plan to activate
    query = select(models.WorkoutPlan).where(models.WorkoutPlan.id == plan_id)
    result = await db.execute(query)
    db_plan = result.scalar_one_or_none()

    if db_plan is None:
        raise HTTPException(status_code=404, detail="Workout plan not found")

    # 2. Deactivate all other plans for this user
    from sqlalchemy import update
    deactivate_query = update(models.WorkoutPlan).where(
        models.WorkoutPlan.user_id == db_plan.user_id,
        models.WorkoutPlan.id != plan_id
    ).values(is_active=False)
    await db.execute(deactivate_query)

    # 3. Activate this plan
    db_plan.is_active = True  # type: ignore
    await db.commit()
    await db.refresh(db_plan)
    return db_plan

@app.post("/api/workouts/plans/{plan_id}/clone/{target_user_id}", response_model=schemas.WorkoutPlanFull)
async def clone_plan(plan_id: int, target_user_id: int, db: AsyncSession = Depends(get_db)):
    # 0. Limit check
    user_plans_query = select(models.WorkoutPlan).where(models.WorkoutPlan.user_id == target_user_id)
    user_plans_result = await db.execute(user_plans_query)
    if len(user_plans_result.scalars().all()) >= 5:
        raise HTTPException(status_code=403, detail="Osiągnięto limit 5 planów. Usuń stary plan, aby sklonować nowy.")

    # 1. Fetch source plan with all relations
    query = select(models.WorkoutPlan).where(models.WorkoutPlan.id == plan_id).options(
        selectinload(models.WorkoutPlan.days).selectinload(models.WorkoutDay.exercises)
    )
    result = await db.execute(query)
    source_plan = result.scalar_one_or_none()

    if source_plan is None:
        raise HTTPException(status_code=404, detail="Plan to clone not found")

    # 2. Deactivate other plans for target user
    from sqlalchemy import update
    await db.execute(update(models.WorkoutPlan).where(models.WorkoutPlan.user_id == target_user_id).values(is_active=False))

    # 3. Create cloned plan
    new_plan = models.WorkoutPlan(
        user_id=target_user_id,
        title=f"Kopia: {source_plan.title}",
        duration_weeks=source_plan.duration_weeks,
        is_active=True,
        is_published=False
    )
    db.add(new_plan)
    await db.flush()

    for day in source_plan.days:
        new_day = models.WorkoutDay(
            plan_id=new_plan.id,
            week_number=day.week_number,
            day_number=day.day_number,
            is_rest_day=day.is_rest_day,
            target_muscle_group=day.target_muscle_group
        )
        db.add(new_day)
        await db.flush()

        for ex in day.exercises:
            new_ex = models.Exercise(
                day_id=new_day.id,
                name=ex.name,
                sets=ex.sets,
                reps=ex.reps,
                rest_time_seconds=ex.rest_time_seconds
            )
            db.add(new_ex)

    await db.commit()

    # Re-fetch fully loaded for response to avoid 500 error during serialization
    query_reload = select(models.WorkoutPlan).where(models.WorkoutPlan.id == new_plan.id).options(
        selectinload(models.WorkoutPlan.days).selectinload(models.WorkoutDay.exercises)
    )
    result_reload = await db.execute(query_reload)
    return result_reload.scalar_one()

@app.put("/api/workouts/plans/{plan_id}", response_model=schemas.WorkoutPlanFull)
async def update_full_plan(plan_id: int, plan_update: schemas.WorkoutPlanCreate, db: AsyncSession = Depends(get_db)):
    # 1. Get the existing plan
    query = select(models.WorkoutPlan).where(models.WorkoutPlan.id == plan_id).options(
        selectinload(models.WorkoutPlan.days).selectinload(models.WorkoutDay.exercises)
    )
    result = await db.execute(query)
    db_plan = result.scalar_one_or_none()

    if db_plan is None:
        raise HTTPException(status_code=404, detail="Workout plan not found")

    # OWNER CHECK
    if db_plan.user_id != plan_update.user_id:
        raise HTTPException(status_code=403, detail="Nie masz uprawnień do edycji tego planu.")

    # 2. Update basic fields
    db_plan.title = plan_update.title  # type: ignore
    db_plan.duration_weeks = plan_update.duration_weeks  # type: ignore

    # 3. Clear existing days and exercises
    for day in db_plan.days:
        await db.delete(day)

    await db.flush()

    # 4. Add new days and exercises
    for day_data in plan_update.days:
        db_day = models.WorkoutDay(
            plan_id=db_plan.id,
            week_number=day_data.week_number,
            day_number=day_data.day_number,
            is_rest_day=day_data.is_rest_day,
            target_muscle_group=day_data.target_muscle_group,
            is_completed=day_data.is_completed
        )
        db.add(db_day)
        await db.flush()

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
    # Eagerly load for response
    query_reload = select(models.WorkoutPlan).where(models.WorkoutPlan.id == plan_id).options(
        selectinload(models.WorkoutPlan.days).selectinload(models.WorkoutDay.exercises)
    )
    result_reload = await db.execute(query_reload)
    return result_reload.scalar_one()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
