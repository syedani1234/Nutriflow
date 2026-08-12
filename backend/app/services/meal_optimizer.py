from typing import Any, Dict, List, Tuple

from app.models.food import Food


# ==========================================================
# CONSTANTS
# ==========================================================

MIN_SERVINGS = 0.25
MAX_SERVINGS = 4.0

SERVING_STEP = 0.25

MAX_FOODS_PER_MEAL = 5


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
# NUTRITION CALCULATION
# ==========================================================

def _food_nutrition(
    food: Food,
    servings: float,
) -> Dict[str, float]:

    return {
        "calories": _to_float(
            food.calories
        ) * servings,

        "protein": _to_float(
            food.protein
        ) * servings,

        "carbohydrates": _to_float(
            food.carbohydrates
        ) * servings,

        "fat": _to_float(
            food.fat
        ) * servings,

        "fiber": _to_float(
            food.fiber
        ) * servings,
    }


def _calculate_totals(
    plan: Dict[int, float],
    food_lookup: Dict[int, Food],
) -> Dict[str, float]:

    totals = {
        "calories": 0.0,
        "protein": 0.0,
        "carbohydrates": 0.0,
        "fat": 0.0,
        "fiber": 0.0,
    }

    for food_id, servings in plan.items():

        food = food_lookup.get(
            food_id
        )

        if food is None:
            continue

        nutrition = _food_nutrition(
            food,
            servings,
        )

        for key in totals:

            totals[key] += nutrition[key]

    return totals


# ==========================================================
# BLOCKED FOOD CHECK
# ==========================================================

def _is_blocked(
    food: Food,
    allergies: List[str],
    excluded_foods: List[str],
) -> bool:

    food_name = (
        str(
            getattr(
                food,
                "name",
                "",
            )
        )
        .strip()
        .lower()
    )

    category = (
        str(
            getattr(
                food,
                "category",
                "",
            )
        )
        .strip()
        .lower()
    )

    searchable_text = (
        f"{food_name} {category}"
    )

    blocked_terms = [
        str(value).strip().lower()
        for value in (
            allergies
            + excluded_foods
        )
        if str(value).strip()
    ]

    for term in blocked_terms:

        if term and term in searchable_text:
            return True

    return False


# ==========================================================
# TARGET SCORE
# ==========================================================

def _score(
    totals: Dict[str, float],
    target_calories: float,
    target_protein: float,
    target_carbohydrates: float,
    target_fat: float,
    food_count: int,
) -> float:

    # ------------------------------------------------------
    # Dynamic tolerances
    # ------------------------------------------------------

    calorie_scale = max(
        target_calories * 0.05,
        100.0,
    )

    protein_scale = max(
        target_protein * 0.08,
        8.0,
    )

    carbohydrate_scale = max(
        target_carbohydrates * 0.08,
        12.0,
    )

    fat_scale = max(
        target_fat * 0.08,
        6.0,
    )

    # ------------------------------------------------------
    # Normalized differences
    # ------------------------------------------------------

    calorie_error = (
        totals["calories"]
        - target_calories
    ) / calorie_scale

    protein_error = (
        totals["protein"]
        - target_protein
    ) / protein_scale

    carbohydrate_error = (
        totals["carbohydrates"]
        - target_carbohydrates
    ) / carbohydrate_scale

    fat_error = (
        totals["fat"]
        - target_fat
    ) / fat_scale

    # ------------------------------------------------------
    # Weighted objective
    # ------------------------------------------------------

    score = (

        calorie_error ** 2 * 2.5

        + protein_error ** 2 * 1.5

        + carbohydrate_error ** 2 * 1.2

        + fat_error ** 2 * 1.5
    )

    # ------------------------------------------------------
    # Avoid unnecessarily huge plans
    # ------------------------------------------------------

    if food_count > 12:

        score += (
            food_count - 12
        ) * 0.05

    return score


# ==========================================================
# INITIAL PLAN
# ==========================================================

def _build_initial_plan(
    ai_meals: List[Dict[str, Any]],
    food_lookup: Dict[int, Food],
) -> Tuple[
    Dict[int, float],
    Dict[int, int],
]:

    plan: Dict[int, float] = {}

    meal_assignment: Dict[int, int] = {}

    for meal_index, meal in enumerate(
        ai_meals
    ):

        foods = meal.get(
            "foods",
            [],
        )

        if not isinstance(
            foods,
            list,
        ):
            continue

        for selected in foods:

            if not isinstance(
                selected,
                dict,
            ):
                continue

            food_id = selected.get(
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

            if food_id not in food_lookup:
                continue

            servings = _to_float(
                selected.get(
                    "servings",
                    1.0,
                ),
                1.0,
            )

            servings = max(
                MIN_SERVINGS,
                min(
                    servings,
                    MAX_SERVINGS,
                ),
            )

            servings = round(
                servings / SERVING_STEP
            ) * SERVING_STEP

            servings = max(
                MIN_SERVINGS,
                min(
                    servings,
                    MAX_SERVINGS,
                ),
            )

            # --------------------------------------------------
            # If AI selected the same food in multiple meals,
            # combine it for daily optimization.
            # --------------------------------------------------

            plan[food_id] = (
                plan.get(
                    food_id,
                    0.0,
                )
                + servings
            )

            if food_id not in meal_assignment:

                meal_assignment[
                    food_id
                ] = meal_index

    return (
        plan,
        meal_assignment,
    )


# ==========================================================
# OPTIMIZER
# ==========================================================

def optimize_meal_plan(
    ai_meals: List[Dict[str, Any]],
    food_lookup: Dict[int, Food],
    target_calories: float,
    target_protein: float,
    target_carbohydrates: float,
    target_fat: float,
    allergies: List[str] | None = None,
    excluded_foods: List[str] | None = None,
) -> Dict[str, Any]:

    allergies = allergies or []
    excluded_foods = excluded_foods or []

    # ======================================================
    # 1. BUILD INITIAL PLAN
    # ======================================================

    plan, meal_assignment = (
        _build_initial_plan(
            ai_meals,
            food_lookup,
        )
    )

    if not plan:

        raise ValueError(
            "AI did not select any valid foods."
        )

    # ======================================================
    # 2. AVAILABLE SUPPORT FOODS
    # ======================================================

    available_food_ids = []

    for food_id, food in food_lookup.items():

        if _is_blocked(
            food,
            allergies,
            excluded_foods,
        ):
            continue

        available_food_ids.append(
            food_id
        )

    # ======================================================
    # 3. CURRENT SCORE
    # ======================================================

    totals = _calculate_totals(
        plan,
        food_lookup,
    )

    current_score = _score(
        totals,
        target_calories,
        target_protein,
        target_carbohydrates,
        target_fat,
        len(plan),
    )

    print(
        "\n================ INITIAL PLAN ================\n"
    )

    print(
        "Calories:",
        round(
            totals["calories"],
            2,
        ),
    )

    print(
        "Protein:",
        round(
            totals["protein"],
            2,
        ),
    )

    print(
        "Carbohydrates:",
        round(
            totals["carbohydrates"],
            2,
        ),
    )

    print(
        "Fat:",
        round(
            totals["fat"],
            2,
        ),
    )

    print(
        "Initial score:",
        round(
            current_score,
            4,
        ),
    )

    # ======================================================
    # 4. ITERATIVE NUMERICAL OPTIMIZATION
    # ======================================================
    #
    # IMPORTANT:
    #
    # No AI calls happen here.
    #
    # Python simply tests:
    #
    # servings + 0.25
    # servings - 0.25
    #
    # and keeps changes that improve the score.
    # ======================================================

    max_iterations = 80

    for _ in range(
        max_iterations
    ):

        improved = False

        # --------------------------------------------------
        # First optimize foods already selected by AI
        # --------------------------------------------------

        candidate_ids = list(
            plan.keys()
        )

        # --------------------------------------------------
        # Also consider adding support foods
        # --------------------------------------------------

        for food_id in available_food_ids:

            if food_id not in candidate_ids:

                candidate_ids.append(
                    food_id
                )

        for food_id in candidate_ids:

            current_servings = plan.get(
                food_id,
                0.0,
            )

            # --------------------------------------------------
            # Test decreasing and increasing servings
            # --------------------------------------------------

            for delta in (
                -SERVING_STEP,
                SERVING_STEP,
            ):

                new_servings = (
                    current_servings
                    + delta
                )

                # --------------------------------------------------
                # Remove food
                # --------------------------------------------------

                if new_servings <= 0:

                    if food_id not in plan:
                        continue

                    candidate_plan = (
                        plan.copy()
                    )

                    candidate_plan.pop(
                        food_id,
                        None,
                    )

                else:

                    if (
                        new_servings
                        > MAX_SERVINGS
                    ):
                        continue

                    candidate_plan = (
                        plan.copy()
                    )

                    candidate_plan[
                        food_id
                    ] = round(
                        new_servings,
                        2,
                    )

                # --------------------------------------------------
                # Prevent excessive number of foods
                # --------------------------------------------------

                if (
                    len(candidate_plan)
                    > 14
                ):
                    continue

                candidate_totals = (
                    _calculate_totals(
                        candidate_plan,
                        food_lookup,
                    )
                )

                candidate_score = _score(
                    candidate_totals,
                    target_calories,
                    target_protein,
                    target_carbohydrates,
                    target_fat,
                    len(candidate_plan),
                )

                if (
                    candidate_score
                    < current_score
                    - 0.0001
                ):

                    plan = (
                        candidate_plan
                    )

                    totals = (
                        candidate_totals
                    )

                    current_score = (
                        candidate_score
                    )

                    improved = True

        if not improved:
            break

    # ======================================================
    # 5. FINAL TOTALS
    # ======================================================

    totals = _calculate_totals(
        plan,
        food_lookup,
    )

    # ======================================================
    # 6. ASSIGN NEW FOODS TO MEALS
    # ======================================================

    meal_count = len(
        ai_meals
    )

    if meal_count == 0:

        raise ValueError(
            "No meals are available."
        )

    # Existing assignment remains.
    # New support foods are assigned to the
    # meal currently containing the fewest foods.

    meal_food_counts = [
        0
        for _ in range(
            meal_count
        )
    ]

    for food_id in plan:

        if food_id in meal_assignment:

            meal_index = (
                meal_assignment[
                    food_id
                ]
            )

            if (
                0
                <= meal_index
                < meal_count
            ):

                meal_food_counts[
                    meal_index
                ] += 1

    # ------------------------------------------------------
    # Add new foods
    # ------------------------------------------------------

    for food_id in plan:

        if food_id in meal_assignment:
            continue

        # Choose meal with fewest foods.
        meal_index = min(
            range(meal_count),
            key=lambda index:
                meal_food_counts[index],
        )

        meal_assignment[
            food_id
        ] = meal_index

        meal_food_counts[
            meal_index
        ] += 1

    # ======================================================
    # 7. REBUILD MEALS
    # ======================================================

    optimized_meals = []

    for meal_index, meal in enumerate(
        ai_meals
    ):

        optimized_foods = []

        for food_id, servings in plan.items():

            if meal_assignment.get(
                food_id
            ) != meal_index:

                continue

            food = food_lookup.get(
                food_id
            )

            if food is None:
                continue

            optimized_foods.append(
                {
                    "food_id": food_id,
                    "servings": round(
                        servings,
                        2,
                    ),
                }
            )

        if not optimized_foods:

            # Safety fallback:
            # keep the first original food.
            original_foods = meal.get(
                "foods",
                [],
            )

            if original_foods:

                optimized_foods.append(
                    original_foods[0]
                )

        optimized_meals.append(
            {
                "name": meal.get(
                    "name",
                    f"Meal {meal_index + 1}",
                ),

                "description": meal.get(
                    "description",
                    "",
                ),

                "foods": optimized_foods,
            }
        )

    # ======================================================
    # 8. FINAL RESULT
    # ======================================================

    print(
        "\n================ OPTIMIZED PLAN ================\n"
    )

    print(
        "Calories:",
        round(
            totals["calories"],
            2,
        ),
    )

    print(
        "Protein:",
        round(
            totals["protein"],
            2,
        ),
    )

    print(
        "Carbohydrates:",
        round(
            totals["carbohydrates"],
            2,
        ),
    )

    print(
        "Fat:",
        round(
            totals["fat"],
            2,
        ),
    )

    print(
        "Fiber:",
        round(
            totals["fiber"],
            2,
        ),
    )

    print(
        "Final score:",
        round(
            current_score,
            4,
        ),
    )

    print(
        "\n=================================================\n"
    )

    return {
        "meals": optimized_meals,
        "totals": totals,
        "score": current_score,
    }