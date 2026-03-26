import httpx
from fastapi import HTTPException, status

USER_SERVICE_URL = "http://user-service:8001"

class ProfileServiceClient:
    @staticmethod
    async def get_user_profile(user_id: int):
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{USER_SERVICE_URL}/api/users/{user_id}/profile")
                if response.status_code == 404:
                    return None
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Error connecting to user-service: {str(e)}"
                )
