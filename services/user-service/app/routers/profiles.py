from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import UserProfileCreate, UserProfileOut, UserProfileUpdate
from app.services.profile_service import ProfileService

router = APIRouter(tags=["profiles"])

@router.post("/api/users/{user_id}/profile", response_model=UserProfileOut, status_code=status.HTTP_201_CREATED)
def create_profile(user_id: int, payload: UserProfileCreate, db: Session = Depends(get_db)):
    return ProfileService.create_profile(user_id, payload, db)

@router.get("/api/users/{user_id}/profile", response_model=UserProfileOut)
def get_profile(user_id: int, db: Session = Depends(get_db)):
    return ProfileService.get_profile(user_id, db)

@router.put("/api/users/{user_id}/profile", response_model=UserProfileOut)
def update_profile(user_id: int, payload: UserProfileUpdate, db: Session = Depends(get_db)):
    return ProfileService.update_profile(user_id, payload, db)

# Internal endpoint for service-to-service communication
@router.get("/profiles/{user_id}", response_model=UserProfileOut)
def get_profile_internal(user_id: int, db: Session = Depends(get_db)):
    return ProfileService.get_profile(user_id, db)
