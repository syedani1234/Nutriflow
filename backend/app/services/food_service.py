from sqlalchemy.orm import Session

from app.models.food import Food
from app.schemas.food_schema import FoodCreate, FoodUpdate


# ==========================================================
# CREATE FOOD
# ==========================================================

def create_food(
    db: Session,
    food_data: FoodCreate,
):
    food = Food(
        name=food_data.name,
        category=food_data.category,
        description=food_data.description,
        serving_size=food_data.serving_size,
        serving_unit=food_data.serving_unit,
        calories=food_data.calories,
        protein=food_data.protein,
        carbohydrates=food_data.carbohydrates,
        fat=food_data.fat,
        fiber=food_data.fiber,
    )

    db.add(food)
    db.commit()
    db.refresh(food)

    return food


# ==========================================================
# GET FOOD BY ID
# ==========================================================

def get_food_by_id(
    db: Session,
    food_id: int,
):
    return (
        db.query(Food)
        .filter(
            Food.id == food_id,
            Food.is_active == True,
        )
        .first()
    )


# ==========================================================
# GET FOODS
# ==========================================================

def get_foods(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    category: str | None = None,
):
    query = (
        db.query(Food)
        .filter(Food.is_active == True)
    )

    if category:
        query = query.filter(
            Food.category == category
        )

    return (
        query
        .order_by(Food.name.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# ==========================================================
# SEARCH FOODS
# ==========================================================

def search_foods(
    db: Session,
    search: str,
    skip: int = 0,
    limit: int = 20,
):
    search_term = f"%{search}%"

    return (
        db.query(Food)
        .filter(
            Food.is_active == True,
            Food.name.ilike(search_term),
        )
        .order_by(Food.name.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# ==========================================================
# UPDATE FOOD
# ==========================================================

def update_food(
    db: Session,
    food: Food,
    food_data: FoodUpdate,
):
    update_data = food_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(food, field, value)

    db.commit()
    db.refresh(food)

    return food


# ==========================================================
# DELETE FOOD
# ==========================================================

def delete_food(
    db: Session,
    food: Food,
):
    # Soft delete
    food.is_active = False

    db.commit()
    db.refresh(food)

    return food