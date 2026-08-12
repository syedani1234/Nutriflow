from pydantic import BaseModel


class MacroResponse(BaseModel):
    protein_g: float
    carbohydrates_g: float
    fat_g: float


class NutritionCalculationResponse(BaseModel):
    bmr: float
    tdee: float
    target_calories: float
    macros: MacroResponse