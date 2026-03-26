from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class WorkoutPlan(Base):
    __tablename__ = "workout_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    title = Column(String(100), nullable=False)
    duration_weeks = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    days = relationship("WorkoutDay", back_populates="plan", cascade="all, delete-orphan")

class WorkoutDay(Base):
    __tablename__ = "workout_days"
    
    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("workout_plans.id"))
    week_number = Column(Integer, nullable=False)
    day_number = Column(Integer, nullable=False)
    is_rest_day = Column(Boolean, default=False)
    target_muscle_group = Column(String(100), nullable=True)
    is_completed = Column(Boolean, default=False)
    
    plan = relationship("WorkoutPlan", back_populates="days")
    exercises = relationship("Exercise", back_populates="day", cascade="all, delete-orphan")

class Exercise(Base):
    __tablename__ = "exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    day_id = Column(Integer, ForeignKey("workout_days.id"))
    name = Column(String(200), nullable=False)
    sets = Column(Integer, nullable=False)
    reps = Column(String(100), nullable=False) # Zwiększono z 10 na 100
    rest_time_seconds = Column(Integer, nullable=False)
    
    day = relationship("WorkoutDay", back_populates="exercises")
