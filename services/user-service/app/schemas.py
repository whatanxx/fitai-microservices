from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, field_validator


# ── Auth schemas ─────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: EmailStr
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Profile schemas ───────────────────────────────────────────────────────────

class UserProfileBase(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[int] = None
    current_weight_kg: Optional[float] = None
    medical_conditions: Optional[str] = None
    fitness_goal: Optional[str] = None
    training_time_minutes: Optional[int] = None
    training_days_per_week: Optional[int] = None
    experience_level: Optional[str] = None
    available_equipment: Optional[List[str]] = None


class UserProfileCreate(UserProfileBase):
    pass


class UserProfileUpdate(UserProfileBase):
    pass


class UserProfileOut(UserProfileBase):
    id: int
    user_id: int
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
