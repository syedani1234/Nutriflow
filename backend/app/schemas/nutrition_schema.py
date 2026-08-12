from typing import Optional

from pydantic import BaseModel, Field


class NutritionProfileCreate(BaseModel):

    age: int = Field(
        ...,
        ge=13,
        le=100
    )

    gender: str

    height_cm: float = Field(
        ...,
        gt=50,
        le=250
    )

    weight_kg: float = Field(
        ...,
        gt=20,
        le=300
    )

    activity_level: str

    goal: str

    dietary_preference: Optional[str] = None

    allergies: Optional[str] = None


class NutritionProfileResponse(BaseModel):

    id: int
    user_id: int

    age: int
    gender: str

    height_cm: float
    weight_kg: float

    activity_level: str
    goal: str

    dietary_preference: Optional[str]
    allergies: Optional[str]

    class Config:
        from_attributes = True