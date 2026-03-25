from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserProfile
from app.schemas import UserProfileCreate, UserProfileOut, UserProfileUpdate

router = APIRouter(prefix="/api/users", tags=["profiles"])


def _get_user_or_404(user_id: int, db: Session) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.post("/{user_id}/profile", response_model=UserProfileOut, status_code=status.HTTP_201_CREATED)
def create_profile(user_id: int, payload: UserProfileCreate, db: Session = Depends(get_db)):
    user = _get_user_or_404(user_id, db)
    if user.profile:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Profile for this user already exists. Use PUT to update.",
        )
    profile = UserProfile(user_id=user.id, **payload.model_dump(exclude_unset=True))
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/{user_id}/profile", response_model=UserProfileOut)
def get_profile(user_id: int, db: Session = Depends(get_db)):
    user = _get_user_or_404(user_id, db)
    if not user.profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return user.profile


@router.put("/{user_id}/profile", response_model=UserProfileOut)
def update_profile(user_id: int, payload: UserProfileUpdate, db: Session = Depends(get_db)):
    user = _get_user_or_404(user_id, db)
    if not user.profile:
        # Auto-create profile on first PUT
        profile = UserProfile(user_id=user.id, **payload.model_dump(exclude_unset=True))
        db.add(profile)
    else:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(user.profile, field, value)
        profile = user.profile
    db.commit()
    db.refresh(profile)
    return profile
