from typing import Optional

from pydantic import BaseModel, Field


# ==========================================================
# MEAL PLAN REQUEST
# ==========================================================

class MealPlanRequest(BaseModel):

    calories: float = Field(
        ...,
        gt=0,
        description="Daily calorie target",
    )

    protein: float = Field(
        default=0,
        ge=0,
        description="Daily protein target in grams",
    )

    carbohydrates: float = Field(
        default=0,
        ge=0,
        description="Daily carbohydrate target in grams",
    )

    fat: float = Field(
        default=0,
        ge=0,
        description="Daily fat target in grams",
    )

    meals_per_day: int = Field(
        default=3,
        ge=1,
        le=8,
        description="Number of meals per day",
    )

    dietary_preference: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    allergies: list[str] = Field(
        default_factory=list,
    )

    excluded_foods: list[str] = Field(
        default_factory=list,
    )

    goal: Optional[str] = Field(
        default=None,
        max_length=200,
    )

    notes: Optional[str] = Field(
        default=None,
        max_length=1000,
    )


# ==========================================================
# MEAL ITEM
# ==========================================================

class MealItem(BaseModel):

    food_id: int

    food_name: str

    serving_size: float

    serving_unit: str

    servings: float = Field(
        gt=0,
    )

    calories: float = Field(
        ge=0,
    )

    protein: float = Field(
        ge=0,
    )

    carbohydrates: float = Field(
        ge=0,
    )

    fat: float = Field(
        ge=0,
    )

    fiber: float = Field(
        ge=0,
    )


# ==========================================================
# PLANNED MEAL
# ==========================================================

class PlannedMeal(BaseModel):

    name: str

    description: Optional[str] = None

    items: list[MealItem] = Field(
        min_length=1,
    )

    total_calories: float = Field(
        ge=0,
    )

    total_protein: float = Field(
        ge=0,
    )

    total_carbohydrates: float = Field(
        ge=0,
    )

    total_fat: float = Field(
        ge=0,
    )

    total_fiber: float = Field(
        ge=0,
    )


# ==========================================================
# MEAL PLAN RESPONSE
# ==========================================================

class MealPlanResponse(BaseModel):

    summary: Optional[str] = None

    daily_calorie_target: float = Field(
        ge=0,
    )

    daily_protein_target: float = Field(
        ge=0,
    )

    daily_carbohydrate_target: float = Field(
        ge=0,
    )

    daily_fat_target: float = Field(
        ge=0,
    )

    meals: list[PlannedMeal] = Field(
        min_length=1,
    )

    total_calories: float = Field(
        ge=0,
    )

    total_protein: float = Field(
        ge=0,
    )

    total_carbohydrates: float = Field(
        ge=0,
    )

    total_fat: float = Field(
        ge=0,
    )

    total_fiber: float = Field(
        ge=0,
    )

    calorie_difference: float

    protein_difference: float

    carbohydrate_difference: float

    fat_difference: float

    recommendations: list[str] = Field(
        default_factory=list,
    )

    ai_generated: bool = False