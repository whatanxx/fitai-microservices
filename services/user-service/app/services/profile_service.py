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
        from datetime import datetime
        user = ProfileService.get_user_or_404(user_id, db)
        if user.profile:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Profile for this user already exists. Use PUT to update.",
            )
        data = payload.model_dump(exclude_unset=True)
        if "current_weight_kg" in data:
            data["weight_history"] = [{"weight": data["current_weight_kg"], "date": datetime.now().isoformat()}]
        
        profile = UserProfile(user_id=user.id, **data)
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
        from datetime import datetime
        user = ProfileService.get_user_or_404(user_id, db)
        data = payload.model_dump(exclude_unset=True)
        
        if not user.profile:
            # Auto-create profile on first PUT
            if "current_weight_kg" in data:
                data["weight_history"] = [{"weight": data["current_weight_kg"], "date": datetime.now().isoformat()}]
            profile = UserProfile(user_id=user.id, **data)
            db.add(profile)
        else:
            profile = user.profile
            # If weight is changing, add to history
            if "current_weight_kg" in data and data["current_weight_kg"] != profile.current_weight_kg:
                new_history_entry = {"weight": data["current_weight_kg"], "date": datetime.now().isoformat()}
                if profile.weight_history is None:
                    profile.weight_history = [new_history_entry]
                else:
                    # SQLAlchemy doesn't track changes in JSON lists unless we replace the whole list
                    # or use flag_modified
                    temp_history = list(profile.weight_history)
                    temp_history.append(new_history_entry)
                    profile.weight_history = temp_history

            for field, value in data.items():
                setattr(profile, field, value)
        
        db.commit()
        db.refresh(profile)
        return profile
