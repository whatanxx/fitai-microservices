from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import User, UserProfile
from app.schemas import UserProfileCreate, UserProfileUpdate

class ProfileService:
    @staticmethod
    def get_user_or_404(user_id: int, db: Session) -> User:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    @staticmethod
    def create_profile(user_id: int, payload: UserProfileCreate, db: Session):
        user = ProfileService.get_user_or_404(user_id, db)
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

    @staticmethod
    def get_profile(user_id: int, db: Session):
        user = ProfileService.get_user_or_404(user_id, db)
        if not user.profile:
            # Auto-create profile if missing
            profile = UserProfile(user_id=user.id)
            db.add(profile)
            db.commit()
            db.refresh(profile)
            return profile
        return user.profile

    @staticmethod
    def update_profile(user_id: int, payload: UserProfileUpdate, db: Session):
        user = ProfileService.get_user_or_404(user_id, db)
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
