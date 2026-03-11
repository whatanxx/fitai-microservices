from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True) # ID from user-service
    plan_name = Column(String(255), nullable=False)
    coach_advice = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    exercises = relationship("Exercise", back_populates="plan", cascade="all, delete-orphan")

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("workout_plans.id"))
    name = Column(String(255), nullable=False)
    sets = Column(Integer, nullable=False)
    reps = Column(String(50), nullable=True)
    rest_time = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)

    plan = relationship("WorkoutPlan", back_populates="exercises")
