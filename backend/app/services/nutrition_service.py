from sqlalchemy.orm import Session

from app.models.nutrition_profile import NutritionProfile
from app.schemas.nutrition_schema import NutritionProfileCreate


def get_nutrition_profile(
    db: Session,
    user_id: int
):
    return (
        db.query(NutritionProfile)
        .filter(
            NutritionProfile.user_id == user_id
        )
        .first()
    )


def create_nutrition_profile(
    db: Session,
    user_id: int,
    data: NutritionProfileCreate
):
    existing_profile = get_nutrition_profile(
        db=db,
        user_id=user_id
    )

    if existing_profile:
        return None

    profile = NutritionProfile(
        user_id=user_id,
        age=data.age,
        gender=data.gender,
        height_cm=data.height_cm,
        weight_kg=data.weight_kg,
        activity_level=data.activity_level,
        goal=data.goal,
        dietary_preference=data.dietary_preference,
        allergies=data.allergies
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


def update_nutrition_profile(
    db: Session,
    profile: NutritionProfile,
    data: NutritionProfileCreate
):
    profile.age = data.age
    profile.gender = data.gender
    profile.height_cm = data.height_cm
    profile.weight_kg = data.weight_kg
    profile.activity_level = data.activity_level
    profile.goal = data.goal
    profile.dietary_preference = data.dietary_preference
    profile.allergies = data.allergies

    db.commit()
    db.refresh(profile)

    return profile