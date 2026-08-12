from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session

from app.dependencies.auth import (
    get_current_user,
    get_db
)

from app.models.user import User

from app.schemas.nutrition_schema import (
    NutritionProfileCreate,
    NutritionProfileResponse
)

from app.services.nutrition_service import (
    get_nutrition_profile,
    create_nutrition_profile,
    update_nutrition_profile
)


router = APIRouter(
    prefix="/nutrition",
    tags=["Nutrition Profile"]
)

from app.services.nutrition_calculator import calculate_nutrition

from app.schemas.nutrition_calculation_schema import (
    NutritionCalculationResponse
)


# ==========================================================
# CREATE PROFILE
# ==========================================================

@router.post(
    "/profile",
    response_model=NutritionProfileResponse,
    status_code=status.HTTP_201_CREATED
)
def create_profile(
    data: NutritionProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    profile = create_nutrition_profile(
        db=db,
        user_id=current_user.id,
        data=data
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nutrition profile already exists"
        )

    return profile


# ==========================================================
# GET PROFILE
# ==========================================================

@router.get(
    "/profile",
    response_model=NutritionProfileResponse
)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    profile = get_nutrition_profile(
        db=db,
        user_id=current_user.id
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nutrition profile not found"
        )

    return profile


# ==========================================================
# UPDATE PROFILE
# ==========================================================

@router.put(
    "/profile",
    response_model=NutritionProfileResponse
)
def update_profile(
    data: NutritionProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    profile = get_nutrition_profile(
        db=db,
        user_id=current_user.id
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nutrition profile not found"
        )

    profile = update_nutrition_profile(
        db=db,
        profile=profile,
        data=data
    )

    return profile

# ==========================================================
# CALCULATE NUTRITION TARGETS
# ==========================================================

@router.get(
    "/calculate",
    response_model=NutritionCalculationResponse
)
def calculate_user_nutrition(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    profile = get_nutrition_profile(
        db=db,
        user_id=current_user.id
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nutrition profile not found"
        )

    try:
        result = calculate_nutrition(
            weight_kg=profile.weight_kg,
            height_cm=profile.height_cm,
            age=profile.age,
            gender=profile.gender,
            activity_level=profile.activity_level,
            goal=profile.goal
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )

    return result