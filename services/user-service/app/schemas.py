from datetime import datetime

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
    first_name: str | None = None
    nickname: str | None = None
    age: int | None = None
    gender: str | None = None
    height_cm: int | None = None
    current_weight_kg: float | None = None
    medical_conditions: str | None = None
    fitness_goal: str | None = None
    training_time_minutes: int | None = None
    training_days_per_week: int | None = None
    experience_level: str | None = None
    available_equipment: list[str] | None = None
    preferred_ai_provider: str | None = "google"
    weight_history: list[dict] | None = None

    @field_validator("age")
    @classmethod
    def validate_age(cls, v: int | None) -> int | None:
        if v is not None and (v < 0 or v > 120):
            raise ValueError("Age must be between 0 and 120")
        return v

    @field_validator("height_cm")
    @classmethod
    def validate_height(cls, v: int | None) -> int | None:
        if v is not None and v < 120:
            raise ValueError("Height must be at least 120 cm")
        return v

    @field_validator("current_weight_kg")
    @classmethod
    def validate_weight(cls, v: float | None) -> float | None:
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
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class UserWithProfileOut(UserOut):
    profile: UserProfileOut | None = None

    model_config = {"from_attributes": True}
