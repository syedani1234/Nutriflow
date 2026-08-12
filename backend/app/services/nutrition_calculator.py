from typing import Dict


# ==========================================================
# ACTIVITY MULTIPLIERS
# ==========================================================

ACTIVITY_MULTIPLIERS = {
    "sedentary": 1.20,
    "light": 1.375,
    "moderate": 1.55,
    "active": 1.725,
    "very_active": 1.90,
}


# ==========================================================
# GOAL CALORIE ADJUSTMENTS
# ==========================================================

GOAL_ADJUSTMENTS = {
    "weight_loss": -500,
    "maintenance": 0,
    "weight_gain": 300,
}


# ==========================================================
# CALCULATE BMR
# ==========================================================

def calculate_bmr(
    weight_kg: float,
    height_cm: float,
    age: int,
    gender: str
) -> float:

    gender = gender.lower()

    if gender == "male":
        bmr = (
            10 * weight_kg
            + 6.25 * height_cm
            - 5 * age
            + 5
        )

    elif gender == "female":
        bmr = (
            10 * weight_kg
            + 6.25 * height_cm
            - 5 * age
            - 161
        )

    else:
        raise ValueError(
            "Gender must be either 'male' or 'female'"
        )

    return round(bmr, 2)


# ==========================================================
# CALCULATE TDEE
# ==========================================================

def calculate_tdee(
    bmr: float,
    activity_level: str
) -> float:

    activity_level = activity_level.lower()

    multiplier = ACTIVITY_MULTIPLIERS.get(
        activity_level
    )

    if multiplier is None:
        raise ValueError(
            "Invalid activity level"
        )

    return round(
        bmr * multiplier,
        2
    )


# ==========================================================
# CALCULATE TARGET CALORIES
# ==========================================================

def calculate_target_calories(
    tdee: float,
    goal: str
) -> float:

    goal = goal.lower()

    adjustment = GOAL_ADJUSTMENTS.get(goal)

    if adjustment is None:
        raise ValueError(
            "Invalid goal"
        )

    target_calories = tdee + adjustment

    # Prevent unrealistically low target
    target_calories = max(
        target_calories,
        1200
    )

    return round(
        target_calories,
        2
    )


# ==========================================================
# CALCULATE MACRONUTRIENTS
# ==========================================================

def calculate_macros(
    target_calories: float,
    weight_kg: float,
    goal: str
) -> Dict[str, float]:

    goal = goal.lower()

    # Protein
    if goal == "weight_loss":
        protein_per_kg = 1.8
    elif goal == "weight_gain":
        protein_per_kg = 1.6
    else:
        protein_per_kg = 1.6

    protein_grams = weight_kg * protein_per_kg

    # Fat = approximately 25% of calories
    fat_calories = target_calories * 0.25
    fat_grams = fat_calories / 9

    # Remaining calories go to carbohydrates
    protein_calories = protein_grams * 4

    carb_calories = (
        target_calories
        - protein_calories
        - fat_calories
    )

    carb_grams = carb_calories / 4

    return {
        "protein_g": round(protein_grams, 2),
        "carbohydrates_g": round(carb_grams, 2),
        "fat_g": round(fat_grams, 2)
    }


# ==========================================================
# COMPLETE NUTRITION CALCULATION
# ==========================================================

def calculate_nutrition(
    weight_kg: float,
    height_cm: float,
    age: int,
    gender: str,
    activity_level: str,
    goal: str
) -> Dict:

    bmr = calculate_bmr(
        weight_kg=weight_kg,
        height_cm=height_cm,
        age=age,
        gender=gender
    )

    tdee = calculate_tdee(
        bmr=bmr,
        activity_level=activity_level
    )

    target_calories = calculate_target_calories(
        tdee=tdee,
        goal=goal
    )

    macros = calculate_macros(
        target_calories=target_calories,
        weight_kg=weight_kg,
        goal=goal
    )

    return {
        "bmr": bmr,
        "tdee": tdee,
        "target_calories": target_calories,
        "macros": macros
    }