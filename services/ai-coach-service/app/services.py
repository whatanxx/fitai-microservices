import json
from openai import OpenAI
from app.config import config
from app.schemas import UserStats, WorkoutPlanResponse
from app.prompts import SYSTEM_PROMPT, get_user_prompt
from fastapi import HTTPException

class OpenAICoachService:
    def __init__(self):
        if not config.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY not found in environment")
        self.client = OpenAI(api_key=config.OPENAI_API_KEY)

    async def generate_plan(self, user_data: UserStats) -> WorkoutPlanResponse:
        user_prompt = get_user_prompt(user_data)
        
        try:
            response = self.client.chat.completions.create(
                model=config.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"} # Forces JSON output
            )
            
            raw_text = response.choices[0].message.content
            plan_data = json.loads(raw_text)
            
            # Validate with Pydantic
            return WorkoutPlanResponse(**plan_data)
            
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON: {raw_text}")
            raise HTTPException(status_code=500, detail=f"AI returned invalid JSON: {str(e)}")
        except Exception as e:
            print(f"Error calling OpenAI: {str(e)}")
            raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")

coach_service = OpenAICoachService()
