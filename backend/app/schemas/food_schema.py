from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ==========================================================
# CREATE FOOD
# ==========================================================

class FoodCreate(BaseModel):

    name: str = Field(
        ...,
        min_length=2,
        max_length=150,
    )

    category: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    description: Optional[str] = None

    serving_size: float = Field(
        default=100,
        gt=0,
    )

    serving_unit: str = Field(
        default="g",
        min_length=1,
        max_length=30,
    )

    calories: float = Field(
        default=0,
        ge=0,
    )

    protein: float = Field(
        default=0,
        ge=0,
    )

    carbohydrates: float = Field(
        default=0,
        ge=0,
    )

    fat: float = Field(
        default=0,
        ge=0,
    )

    fiber: float = Field(
        default=0,
        ge=0,
    )


# ==========================================================
# UPDATE FOOD
# ==========================================================

class FoodUpdate(BaseModel):

    name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=150,
    )

    category: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    description: Optional[str] = None

    serving_size: Optional[float] = Field(
        default=None,
        gt=0,
    )

    serving_unit: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=30,
    )

    calories: Optional[float] = Field(
        default=None,
        ge=0,
    )

    protein: Optional[float] = Field(
        default=None,
        ge=0,
    )

    carbohydrates: Optional[float] = Field(
        default=None,
        ge=0,
    )

    fat: Optional[float] = Field(
        default=None,
        ge=0,
    )

    fiber: Optional[float] = Field(
        default=None,
        ge=0,
    )

    is_active: Optional[bool] = None


# ==========================================================
# FOOD RESPONSE
# ==========================================================

class FoodResponse(BaseModel):

    id: int
    name: str
    category: Optional[str]
    description: Optional[str]

    serving_size: float
    serving_unit: str

    calories: float
    protein: float
    carbohydrates: float
    fat: float
    fiber: float

    is_active: bool

    model_config = ConfigDict(
        from_attributes=True
    )