from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.database.database import SessionLocal

from app.schemas.meal_schema import (
    MealPlanRequest,
    MealPlanResponse,
)

from app.services.meal_planner_service import (
    generate_meal_plan,
)


# ==========================================================
# ROUTER
# ==========================================================

router = APIRouter(
    prefix="/meal-planner",
    tags=["AI Meal Planner"],
)


# ==========================================================
# DATABASE DEPENDENCY
# ==========================================================

def get_db():
    """
    Create and close a database session.
    """

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ==========================================================
# GENERATE AI MEAL PLAN
# ==========================================================

@router.post(
    "/generate",
    response_model=MealPlanResponse,
    status_code=200,
)
def generate_meal_plan_endpoint(
    request: MealPlanRequest,
    db: Session = Depends(get_db),
):
    """
    Generate a personalized AI meal plan
    using foods stored in MySQL.
    """

    try:

        meal_plan = generate_meal_plan(
            db=db,
            request=request,
        )

        return meal_plan

    except ValueError as error:

        print(
            "Meal planner validation error:",
            str(error),
        )

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:

        print(
            "Meal planner unexpected error:",
            type(error).__name__,
            str(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to generate meal plan: "
                f"{type(error).__name__}: {error}"
            ),
        )