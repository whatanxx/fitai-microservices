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
    first_name: Optional[str] = None
    nickname: Optional[str] = None
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
    preferred_ai_provider: Optional[str] = "google"
    weight_history: Optional[List[dict]] = None

    @field_validator("age")
    @classmethod
    def validate_age(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and (v < 0 or v > 120):
            raise ValueError("Age must be between 0 and 120")
        return v

    @field_validator("height_cm")
    @classmethod
    def validate_height(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 120:
            raise ValueError("Height must be at least 120 cm")
        return v

    @field_validator("current_weight_kg")
    @classmethod
    def validate_weight(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 30:
            raise ValueError("Weight must be greater than 30 kg")
        return v


class UserProfileCreate(UserProfileBase):
    pass


class UserProfileUpdate(UserProfileBase):
    pass


class UserProfileOut(UserProfileBase):
    id: int
    user_id: int
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class UserWithProfileOut(UserOut):
    profile: Optional[UserProfileOut] = None

    model_config = {"from_attributes": True}
