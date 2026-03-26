import os
import logging
import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import google.generativeai as genai
from vertexai.generative_models import GenerativeModel as VertexGenerativeModel
import vertexai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-coach-service")

app = FastAPI(title="AI Coach Service", version="2.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GCP_PROJECT = os.getenv("GCP_PROJECT")
GCP_LOCATION = os.getenv("GCP_LOCATION", "us-central1")
USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://user-service:8001")
WORKOUT_SERVICE_URL = os.getenv("WORKOUT_SERVICE_URL", "http://workout-service:8002")

# Model initialization logic
model = None
using_vertex = False

if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash')
        logger.info("Initialized Google AI Studio (gemini-2.5-flash)")
    except Exception as e:
        logger.error(f"AI Studio initialization failed: {e}")

if not model and GCP_PROJECT:
    try:
        vertexai.init(project=GCP_PROJECT, location=GCP_LOCATION)
        model = VertexGenerativeModel("gemini-2.5-flash")
        using_vertex = True
        logger.info(f"Initialized Vertex AI (gemini-2.5-flash) on project {GCP_PROJECT}")
    except Exception as e:
        logger.error(f"Vertex AI initialization failed: {e}")

# Pydantic Models

class UserProfile(BaseModel):
    id: int
    age: Optional[int] = 25
    gender: Optional[str] = "not specified"
    height_cm: Optional[int] = 170
    current_weight_kg: Optional[float] = 70.0
    medical_conditions: Optional[str] = "None"
    fitness_goal: Optional[str] = "Fitness"
    training_time_minutes: Optional[int] = 60
    training_days_per_week: Optional[int] = 3
    experience_level: Optional[str] = "Beginner"
    available_equipment: Optional[List[str]] = []

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

class GenerateRequest(BaseModel):
    goal: str
    days_per_week: int

# Endpoints

@app.get("/health")
async def health_check():
    return {"status": "works", "model": "gemini-2.5-flash"}

@app.post("/api/ai/generate/{user_id}")
async def generate_workout_plan(user_id: int, request: GenerateRequest):
    # 1. Fetch profile from User Service
    async with httpx.AsyncClient() as http_client:
        try:
            profile_resp = await http_client.get(f"{USER_SERVICE_URL}/profiles/{user_id}")
            profile_resp.raise_for_status()
            user_profile = UserProfile(**profile_resp.json())
        except httpx.HTTPError as e:
            logger.error(f"Error fetching profile: {e}")
            raise HTTPException(status_code=502, detail=f"Failed to fetch profile from User Service: {e}")

    fitness_goal = request.goal or user_profile.fitness_goal
    training_days = request.days_per_week or user_profile.training_days_per_week

    # 2. Generate plan
    if not model:
        raise HTTPException(status_code=500, detail="AI Model not configured.")

    try:
        prompt = f"""
        Jesteś trenerem personalnym. Wygeneruj plan treningowy JSON dla:
        Cel: {fitness_goal}, Dni: {training_days}, Waga: {user_profile.current_weight_kg}kg.
        Zwróć TYLKO czysty obiekt JSON, bez znaczników ```json. 
        Struktura:
        {{
          "user_id": {user_id},
          "title": "Twój Plan",
          "duration_weeks": 1,
          "days": [
            {{
              "week_number": 1,
              "day_number": 1,
              "is_rest_day": false,
              "target_muscle_group": "Klatka",
              "exercises": [
                {{
                  "name": "Pompki",
                  "sets": 3,
                  "reps": "12",
                  "rest_time_seconds": 60
                }}
              ]
            }}
          ]
        }}
        Upewnij się, że pole 'reps' to ZAWSZE krótki ciąg znaków (np. "12-15", "Max"), maksymalnie do 20 znaków!
        """
        
        if not using_vertex:
            response = model.generate_content(prompt, generation_config=genai.GenerationConfig(response_mime_type="application/json"))
        else:
            response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
            
        text_content = response.text.strip()
        
        # LOGOWANIE DO PLIKU
        try:
            with open("gemini_log.json", "w", encoding="utf-8") as f:
                f.write(text_content)
            logger.info("Saved Gemini response to gemini_log.json")
        except Exception as log_err:
            logger.error(f"Failed to save log file: {log_err}")

        json_data = json.loads(text_content)
        workout_plan_data = WorkoutPlan.model_validate(json_data)
        
    except Exception as e:
        logger.error(f"Generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")

    # 3. Save in Workout Plan Service
    async with httpx.AsyncClient() as http_client:
        try:
            save_resp = await http_client.post(f"{WORKOUT_SERVICE_URL}/plans", json=workout_plan_data.model_dump())
            save_resp.raise_for_status()
            return save_resp.json()
        except httpx.HTTPError as e:
            logger.error(f"Save failed: {e}")
            raise HTTPException(status_code=500, detail=f"Database save error: {str(e)}")
