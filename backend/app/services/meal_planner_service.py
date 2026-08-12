from typing import Any, Dict, List

from sqlalchemy.orm import Session

from app.models.food import Food
from app.schemas.meal_schema import (
    MealPlanRequest,
    MealPlanResponse,
)

from app.services.ai_meal_service import (
    generate_ai_food_selection,
)

from app.services.meal_optimizer import (
    optimize_meal_plan,
)


# ==========================================================
# HELPERS
# ==========================================================

def _to_float(
    value: Any,
    default: float = 0.0,
) -> float:

    try:

        return float(value)

    except (
        TypeError,
        ValueError,
    ):

        return default


def _round(
    value: float,
) -> float:

    return round(
        _to_float(value),
        2,
    )


# ==========================================================
# CALCULATE FOOD ITEM
# ==========================================================

def _calculate_food_item(
    food: Food,
    servings: float,
) -> Dict[str, Any]:

    if servings <= 0:

        raise ValueError(
            "Food servings must be greater than zero."
        )

    return {
        "food_id": food.id,

        "food_name": food.name,

        "serving_size": _round(
            food.serving_size
        ),

        "serving_unit": (
            food.serving_unit or ""
        ),

        "servings": _round(
            servings
        ),

        # --------------------------------------------------
        # Nutrition comes ONLY from MySQL
        # --------------------------------------------------

        "calories": _round(
            _to_float(
                food.calories
            )
            * servings
        ),

        "protein": _round(
            _to_float(
                food.protein
            )
            * servings
        ),

        "carbohydrates": _round(
            _to_float(
                food.carbohydrates
            )
            * servings
        ),

        "fat": _round(
            _to_float(
                food.fat
            )
            * servings
        ),

        "fiber": _round(
            _to_float(
                food.fiber
            )
            * servings
        ),
    }


# ==========================================================
# CALCULATE MEAL
# ==========================================================

def _calculate_meal(
    meal: Dict[str, Any],
    food_lookup: Dict[int, Food],
) -> Dict[str, Any]:

    raw_foods = meal.get(
        "foods",
        [],
    )

    if not isinstance(
        raw_foods,
        list,
    ):

        raw_foods = []

    items = []

    for selected_food in raw_foods:

        if not isinstance(
            selected_food,
            dict,
        ):
            continue

        food_id = selected_food.get(
            "food_id"
        )

        if food_id is None:
            continue

        try:

            food_id = int(
                food_id
            )

        except (
            TypeError,
            ValueError,
        ):

            continue

        # --------------------------------------------------
        # DATABASE VALIDATION
        # --------------------------------------------------

        food = food_lookup.get(
            food_id
        )

        if food is None:

            print(
                "WARNING: optimizer selected "
                f"unknown food_id={food_id}. "
                "Ignoring."
            )

            continue

        # --------------------------------------------------
        # SERVINGS
        # --------------------------------------------------

        servings = _to_float(
            selected_food.get(
                "servings",
                1.0,
            ),
            1.0,
        )

        if servings <= 0:

            servings = 1.0

        # --------------------------------------------------
        # CALCULATE FROM MYSQL
        # --------------------------------------------------

        item = _calculate_food_item(
            food=food,
            servings=servings,
        )

        items.append(
            item
        )

    if not items:

        raise ValueError(
            f"Meal '{meal.get('name', 'Meal')}' "
            "does not contain valid foods."
        )

    # ======================================================
    # TOTALS
    # ======================================================

    total_calories = sum(
        item["calories"]
        for item in items
    )

    total_protein = sum(
        item["protein"]
        for item in items
    )

    total_carbohydrates = sum(
        item["carbohydrates"]
        for item in items
    )

    total_fat = sum(
        item["fat"]
        for item in items
    )

    total_fiber = sum(
        item["fiber"]
        for item in items
    )

    return {
        "name": str(
            meal.get(
                "name",
                "Meal",
            )
        ),

        "description": str(
            meal.get(
                "description",
                "",
            )
            or ""
        ),

        "items": items,

        "total_calories": _round(
            total_calories
        ),

        "total_protein": _round(
            total_protein
        ),

        "total_carbohydrates": _round(
            total_carbohydrates
        ),

        "total_fat": _round(
            total_fat
        ),

        "total_fiber": _round(
            total_fiber
        ),
    }


# ==========================================================
# RECOMMENDATIONS
# ==========================================================

def _generate_recommendations(
    calorie_difference: float,
    protein_difference: float,
    carbohydrate_difference: float,
    fat_difference: float,
) -> List[str]:

    recommendations = []

    # ======================================================
    # CALORIES
    # ======================================================

    if calorie_difference < -100:

        recommendations.append(
            "The plan is below the calorie target. "
            "Consider increasing portions or adding "
            "nutrient-dense foods."
        )

    elif calorie_difference > 100:

        recommendations.append(
            "The plan is above the calorie target. "
            "Consider slightly reducing portion sizes."
        )

    else:

        recommendations.append(
            "Daily calories are reasonably close "
            "to the target."
        )

    # ======================================================
    # PROTEIN
    # ======================================================

    if protein_difference < -10:

        recommendations.append(
            "Protein is below the target. "
            "Consider adding suitable protein-rich foods."
        )

    elif protein_difference > 15:

        recommendations.append(
            "Protein is above the target. "
            "Consider slightly reducing protein portions."
        )

    # ======================================================
    # CARBOHYDRATES
    # ======================================================

    if carbohydrate_difference < -15:

        recommendations.append(
            "Carbohydrates are below the target. "
            "Consider adding suitable whole grains, "
            "fruit, rice, or legumes."
        )

    elif carbohydrate_difference > 20:

        recommendations.append(
            "Carbohydrates are above the target. "
            "Consider slightly reducing carbohydrate portions."
        )

    # ======================================================
    # FAT
    # ======================================================

    if fat_difference < -8:

        recommendations.append(
            "Healthy fats are below the target. "
            "Consider suitable nuts, seeds, avocado, "
            "olive oil, or dairy products."
        )

    elif fat_difference > 12:

        recommendations.append(
            "Fat is above the target. "
            "Consider slightly reducing high-fat foods."
        )

    # ======================================================
    # GENERAL
    # ======================================================

    recommendations.append(
        "Drink enough water throughout the day."
    )

    recommendations.append(
        "Adjust portions according to activity level "
        "and personal nutritional needs."
    )

    return recommendations


# ==========================================================
# MAIN MEAL PLANNER
# ==========================================================

def generate_meal_plan(
    db: Session,
    request: MealPlanRequest,
) -> MealPlanResponse:

    try:

        # ==================================================
        # 1. VALIDATE REQUEST
        # ==================================================

        if request.calories <= 0:

            raise ValueError(
                "Daily calorie target must be greater than zero."
            )

        if request.meals_per_day < 1:

            raise ValueError(
                "Meals per day must be at least 1."
            )

        # ==================================================
        # 2. GET ACTIVE FOODS
        # ==================================================

        foods = (
            db.query(Food)
            .filter(
                Food.is_active.is_(True)
            )
            .order_by(
                Food.name.asc()
            )
            .all()
        )

        if not foods:

            raise ValueError(
                "No active foods are available "
                "in the database."
            )

        # ==================================================
        # 3. LOOKUP
        # ==================================================

        food_lookup: Dict[int, Food] = {
            food.id: food
            for food in foods
        }

        # ==================================================
        # 4. COMPACT AI FOOD DATA
        # ==================================================

        food_data: List[
            Dict[str, Any]
        ] = []

        for food in foods:

            food_data.append(
                {
                    "id": food.id,

                    "name": food.name,

                    "category": (
                        food.category
                        or ""
                    ),

                    "serving_size": (
                        food.serving_size
                    ),

                    "serving_unit": (
                        food.serving_unit
                        or ""
                    ),
                }
            )

        # ==================================================
        # 5. ONE AI CALL
        # ==================================================

        print(
            "\n========== AI FOOD SELECTION ==========\n"
        )

        ai_result = (
            generate_ai_food_selection(
                food_data=food_data,

                calories=request.calories,

                protein=request.protein,

                carbohydrates=(
                    request.carbohydrates
                ),

                fat=request.fat,

                meals_per_day=(
                    request.meals_per_day
                ),

                dietary_preference=(
                    request.dietary_preference
                    or ""
                ),

                allergies=(
                    request.allergies
                    or []
                ),

                excluded_foods=(
                    request.excluded_foods
                    or []
                ),

                goal=(
                    request.goal
                    or ""
                ),

                notes=(
                    request.notes
                    or ""
                ),
            )
        )

        # ==================================================
        # 6. VALIDATE AI MEALS
        # ==================================================

        raw_meals = ai_result.get(
            "meals",
            [],
        )

        if not isinstance(
            raw_meals,
            list,
        ):

            raise ValueError(
                "AI returned an invalid meals structure."
            )

        if len(raw_meals) != (
            request.meals_per_day
        ):

            raise ValueError(
                "AI generated "
                f"{len(raw_meals)} meals, "
                f"but {request.meals_per_day} "
                "meals were requested."
            )

        # ==================================================
        # 7. PYTHON OPTIMIZATION
        # ==================================================

        print(
            "\n========== PYTHON OPTIMIZER ==========\n"
        )

        optimized = optimize_meal_plan(

            ai_meals=raw_meals,

            food_lookup=food_lookup,

            target_calories=(
                request.calories
            ),

            target_protein=(
                request.protein
            ),

            target_carbohydrates=(
                request.carbohydrates
            ),

            target_fat=(
                request.fat
            ),

            allergies=(
                request.allergies
                or []
            ),

            excluded_foods=(
                request.excluded_foods
                or []
            ),
        )

        optimized_meals = optimized[
            "meals"
        ]

        # ==================================================
        # 8. CALCULATE FINAL MEALS
        # ==================================================

        meals = []

        for optimized_meal in (
            optimized_meals
        ):

            meal = _calculate_meal(
                meal=optimized_meal,
                food_lookup=food_lookup,
            )

            meals.append(
                meal
            )

        if not meals:

            raise ValueError(
                "No valid meals could be generated."
            )

        # ==================================================
        # 9. FINAL DAILY TOTALS
        # ==================================================

        daily_calories = sum(
            meal["total_calories"]
            for meal in meals
        )

        daily_protein = sum(
            meal["total_protein"]
            for meal in meals
        )

        daily_carbohydrates = sum(
            meal["total_carbohydrates"]
            for meal in meals
        )

        daily_fat = sum(
            meal["total_fat"]
            for meal in meals
        )

        daily_fiber = sum(
            meal["total_fiber"]
            for meal in meals
        )

        # ==================================================
        # 10. TARGETS
        # ==================================================

        target_calories = _to_float(
            request.calories
        )

        target_protein = _to_float(
            request.protein
        )

        target_carbohydrates = _to_float(
            request.carbohydrates
        )

        target_fat = _to_float(
            request.fat
        )

        # ==================================================
        # 11. DIFFERENCES
        # ==================================================

        calorie_difference = _round(
            daily_calories
            - target_calories
        )

        protein_difference = _round(
            daily_protein
            - target_protein
        )

        carbohydrate_difference = _round(
            daily_carbohydrates
            - target_carbohydrates
        )

        fat_difference = _round(
            daily_fat
            - target_fat
        )

        # ==================================================
        # 12. RECOMMENDATIONS
        # ==================================================

        recommendations = (
            _generate_recommendations(
                calorie_difference=(
                    calorie_difference
                ),

                protein_difference=(
                    protein_difference
                ),

                carbohydrate_difference=(
                    carbohydrate_difference
                ),

                fat_difference=(
                    fat_difference
                ),
            )
        )

        # ==================================================
        # 13. RESPONSE
        # ==================================================

        response_data = {

            "summary": (
                ai_result.get(
                    "summary",
                    "AI-generated personalized meal plan.",
                )
            ),

            "daily_calorie_target": (
                target_calories
            ),

            "daily_protein_target": (
                target_protein
            ),

            "daily_carbohydrate_target": (
                target_carbohydrates
            ),

            "daily_fat_target": (
                target_fat
            ),

            "meals": meals,

            "total_calories": _round(
                daily_calories
            ),

            "total_protein": _round(
                daily_protein
            ),

            "total_carbohydrates": _round(
                daily_carbohydrates
            ),

            "total_fat": _round(
                daily_fat
            ),

            "total_fiber": _round(
                daily_fiber
            ),

            "calorie_difference": (
                calorie_difference
            ),

            "protein_difference": (
                protein_difference
            ),

            "carbohydrate_difference": (
                carbohydrate_difference
            ),

            "fat_difference": (
                fat_difference
            ),

            "recommendations": (
                recommendations
            ),

            "ai_generated": True,
        }

        # ==================================================
        # 14. PYDANTIC VALIDATION
        # ==================================================

        return MealPlanResponse(
            **response_data
        )

    # ======================================================
    # EXPECTED ERRORS
    # ======================================================

    except ValueError:
        raise

    # ======================================================
    # UNEXPECTED ERRORS
    # ======================================================

    except Exception as error:

        print(
            "\nAI meal generation error:",
            type(error).__name__,
            str(error),
        )

        raise ValueError(
            f"Unable to generate AI meal plan: {error}"
        )