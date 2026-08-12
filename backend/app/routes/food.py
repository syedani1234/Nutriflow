from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.food import Food

from app.schemas.food_schema import (
    FoodCreate,
    FoodResponse,
    FoodUpdate,
)

from app.services.food_service import (
    create_food,
    delete_food,
    get_food_by_id,
    get_foods,
    search_foods,
    update_food,
)


router = APIRouter(
    prefix="/foods",
    tags=["Food Database"],
)


# ==========================================================
# DATABASE DEPENDENCY
# ==========================================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ==========================================================
# CREATE FOOD
# ==========================================================

@router.post(
    "",
    response_model=FoodResponse,
    status_code=201,
)
def add_food(
    food_data: FoodCreate,
    db: Session = Depends(get_db),
):
    return create_food(
        db=db,
        food_data=food_data,
    )


# ==========================================================
# GET ALL FOODS
# ==========================================================

@router.get(
    "",
    response_model=list[FoodResponse],
)
def list_foods(
    skip: int = Query(
        default=0,
        ge=0,
    ),
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    category: str | None = None,
    db: Session = Depends(get_db),
):
    return get_foods(
        db=db,
        skip=skip,
        limit=limit,
        category=category,
    )


# ==========================================================
# SEARCH FOODS
# ==========================================================

@router.get(
    "/search",
    response_model=list[FoodResponse],
)
def search_food_database(
    q: str = Query(
        ...,
        min_length=1,
        max_length=100,
    ),
    skip: int = Query(
        default=0,
        ge=0,
    ),
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
):
    return search_foods(
        db=db,
        search=q,
        skip=skip,
        limit=limit,
    )


# ==========================================================
# GET FOOD BY ID
# ==========================================================

@router.get(
    "/{food_id}",
    response_model=FoodResponse,
)
def get_food(
    food_id: int,
    db: Session = Depends(get_db),
):
    food = get_food_by_id(
        db=db,
        food_id=food_id,
    )

    if food is None:
        raise HTTPException(
            status_code=404,
            detail="Food not found",
        )

    return food


# ==========================================================
# UPDATE FOOD
# ==========================================================

@router.put(
    "/{food_id}",
    response_model=FoodResponse,
)
def edit_food(
    food_id: int,
    food_data: FoodUpdate,
    db: Session = Depends(get_db),
):
    food = (
        db.query(Food)
        .filter(
            Food.id == food_id,
            Food.is_active == True,
        )
        .first()
    )

    if food is None:
        raise HTTPException(
            status_code=404,
            detail="Food not found",
        )

    return update_food(
        db=db,
        food=food,
        food_data=food_data,
    )


# ==========================================================
# DELETE FOOD
# ==========================================================

@router.delete(
    "/{food_id}",
)
def remove_food(
    food_id: int,
    db: Session = Depends(get_db),
):
    food = (
        db.query(Food)
        .filter(
            Food.id == food_id,
            Food.is_active == True,
        )
        .first()
    )

    if food is None:
        raise HTTPException(
            status_code=404,
            detail="Food not found",
        )

    delete_food(
        db=db,
        food=food,
    )

    return {
        "message": "Food deleted successfully",
    }