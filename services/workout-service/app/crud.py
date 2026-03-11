from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app import models, schemas

async def get_plans_by_user(db: AsyncSession, user_id: int):
    result = await db.execute(select(models.WorkoutPlan).where(models.WorkoutPlan.user_id == user_id))
    return result.scalars().all()

async def create_workout_plan(db: AsyncSession, plan_data: schemas.WorkoutPlanCreate):
    db_plan = models.WorkoutPlan(
        user_id=plan_data.user_id,
        plan_name=plan_data.plan_name,
        coach_advice=plan_data.coach_advice
    )
    db.add(db_plan)
    await db.flush() # To get the plan ID
    
    for exercise_data in plan_data.exercises:
        db_exercise = models.Exercise(
            plan_id=db_plan.id,
            **exercise_data.model_dump()
        )
        db.add(db_exercise)
        
    await db.commit()
    await db.refresh(db_plan)
    return db_plan

async def get_plan_by_id(db: AsyncSession, plan_id: int):
    result = await db.execute(select(models.WorkoutPlan).where(models.WorkoutPlan.id == plan_id))
    return result.scalar_one_or_none()
