import os
import logging
import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-coach-service")

app = FastAPI(title="AI Coach Service", version="0.1.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://user-service:8001")
WORKOUT_SERVICE_URL = os.getenv("WORKOUT_SERVICE_URL", "http://workout-service:8002")

# Client initialization
if OPENAI_API_KEY:
    client = OpenAI(api_key=OPENAI_API_KEY)
else:
    client = None
    logger.warning("OPENAI_API_KEY not found in environment variables")

# Pydantic Models (based on ARCHITEKTURA.md)

class UserProfile(BaseModel):
    id: int
    age: int
    gender: str
    height_cm: int
    current_weight_kg: float
    medical_conditions: Optional[str] = None
    fitness_goal: str
    training_time_minutes: int
    training_days_per_week: int
    experience_level: str
    available_equipment: List[str]

class Exercise(BaseModel):
    name: str
    sets: int
    reps: str
    rest_time_seconds: int

class WorkoutDay(BaseModel):
    week_number: int
    day_number: int
    is_rest_day: bool
    target_muscle_group: Optional[str] = None
    exercises: List[Exercise] = []

class WorkoutPlan(BaseModel):
    user_id: int
    title: str
    duration_weeks: int
    days: List[WorkoutDay]

# Endpoints

@app.get("/health")
async def health_check():
    return {"status": "works"}

@app.post("/generate/{user_id}")
async def generate_workout_plan(user_id: int):
    """
    Main trigger process:
    1. Fetch profile from User Service.
    2. Generate plan using LLM (OpenAI).
    3. Normalize to JSON.
    4. Save in Workout Plan Service.
    """
    # Note: Client will be None if no API key is set, but we handle it below

    logger.info(f"Generating plan for user {user_id}")

    # 1. Fetch profile
    async with httpx.AsyncClient() as http_client:
        try:
            profile_resp = await http_client.get(f"{USER_SERVICE_URL}/profiles/{user_id}")
            profile_resp.raise_for_status()
            user_profile = UserProfile(**profile_resp.json())
        except httpx.HTTPError as e:
            logger.error(f"Error fetching profile: {e}")
            raise HTTPException(status_code=502, detail=f"Failed to fetch profile from User Service: {e}")

    # 2. Generate plan with LLM (or use Mock if no API key)
    try:
        if not OPENAI_API_KEY or OPENAI_API_KEY == "your_openai_api_key_here":
            logger.info("Using MOCK plan because OPENAI_API_KEY is missing")
            workout_plan_data = WorkoutPlan(
                user_id=user_id,
                title=f"⚠️ TESTOWY PLAN ({user_profile.fitness_goal}) - BRAK API",
                duration_weeks=1,
                days=[
                    WorkoutDay(
                        week_number=1,
                        day_number=1,
                        is_rest_day=False,
                        target_muscle_group="ROZGRZEWKA I TEST SYSTEMU",
                        exercises=[
                            Exercise(name="Pompki (Tryb Testowy)", sets=3, reps="12", rest_time_seconds=60),
                            Exercise(name="Przysiady (Tryb Testowy)", sets=3, reps="15", rest_time_seconds=60),
                            Exercise(name="Pajacyki (Weryfikacja Integracji)", sets=3, reps="30s", rest_time_seconds=30)
                        ]
                    )
                ]
            )
        else:
            if not client:
                 raise HTTPException(status_code=500, detail="OpenAI API client not configured")
                 
            prompt = f"""
            Generate a detailed {user_profile.fitness_goal} workout plan for a {user_profile.age} year old {user_profile.gender}.
            Experience level: {user_profile.experience_level}.
            Training days per week: {user_profile.training_days_per_week}.
            Available equipment: {', '.join(user_profile.available_equipment)}.
            Medical conditions: {user_profile.medical_conditions or 'None'}.
            
            The plan should be for {user_profile.training_days_per_week} days in a single week.
            Return ONLY a JSON object matching this structure:
            {{
                "user_id": {user_id},
                "title": "Custom {user_profile.fitness_goal} Plan",
                "duration_weeks": 1,
                "days": [
                    {{
                        "week_number": 1,
                        "day_number": 1,
                        "is_rest_day": false,
                        "target_muscle_group": "Chest and Triceps",
                        "exercises": [
                            {{
                                "name": "Pushups",
                                "sets": 3,
                                "reps": "12-15",
                                "rest_time_seconds": 60
                            }}
                        ]
                    }}
                ]
            }}
            """
            
            response = client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are a professional fitness coach assistant. You provide output ONLY as valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={ "type": "json_object" }
            )
            
            json_data = json.loads(response.choices[0].message.content)
            workout_plan_data = WorkoutPlan.model_validate(json_data)
        
    except Exception as e:
        logger.error(f"Error generating plan: {e}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {e}")

    # 4. Save in Workout Plan Service
    async with httpx.AsyncClient() as http_client:
        try:
            save_resp = await http_client.post(
                f"{WORKOUT_SERVICE_URL}/plans",
                json=workout_plan_data.model_dump()
            )
            save_resp.raise_for_status()
            return save_resp.json()
        except httpx.HTTPError as e:
            logger.error(f"Error saving plan: {e}")
            raise HTTPException(status_code=502, detail=f"Failed to save plan in Workout Plan Service: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
