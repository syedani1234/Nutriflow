import json
import os
import re
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from groq import Groq


# ==========================================================
# ENVIRONMENT
# ==========================================================

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError(
        "GROQ_API_KEY is not configured."
    )

client = Groq(
    api_key=GROQ_API_KEY
)


# ==========================================================
# JSON EXTRACTION
# ==========================================================

def _extract_json(
    text: str,
) -> Dict[str, Any]:
    """
    Extract a JSON object from the Groq response.

    Handles:
        - plain JSON
        - ```json ... ```
        - additional text around JSON
    """

    if not text:
        raise ValueError(
            "Groq returned an empty response."
        )

    text = text.strip()

    # ------------------------------------------------------
    # Remove markdown code fences
    # ------------------------------------------------------

    text = re.sub(
        r"^```json\s*",
        "",
        text,
        flags=re.IGNORECASE,
    )

    text = re.sub(
        r"^```\s*",
        "",
        text,
    )

    text = re.sub(
        r"\s*```$",
        "",
        text,
    )

    text = text.strip()

    # ------------------------------------------------------
    # Direct JSON
    # ------------------------------------------------------

    try:

        result = json.loads(text)

        if not isinstance(result, dict):
            raise ValueError(
                "Groq response must be a JSON object."
            )

        return result

    except json.JSONDecodeError:
        pass

    # ------------------------------------------------------
    # JSON embedded inside text
    # ------------------------------------------------------

    start = text.find("{")
    end = text.rfind("}")

    if start == -1 or end == -1:

        raise ValueError(
            "Groq did not return valid JSON."
        )

    try:

        result = json.loads(
            text[start:end + 1]
        )

    except json.JSONDecodeError as error:

        raise ValueError(
            f"Groq returned invalid JSON: {error}"
        )

    if not isinstance(result, dict):

        raise ValueError(
            "Groq response must be a JSON object."
        )

    return result


# ==========================================================
# NORMALIZE AI RESPONSE
# ==========================================================

def _normalize_selection(
    result: Dict[str, Any],
    meals_per_day: int,
) -> Dict[str, Any]:
    """
    Normalize Groq's response.

    IMPORTANT:

    Groq selects:
        - meal names
        - descriptions
        - food IDs
        - initial servings

    Groq does NOT calculate:
        - calories
        - protein
        - carbohydrates
        - fat
        - fiber

    Python handles all nutrition calculations.
    """

    raw_meals = result.get(
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

    normalized_meals = []

    for index, meal in enumerate(raw_meals):

        if not isinstance(
            meal,
            dict,
        ):
            continue

        name = str(
            meal.get(
                "name",
                f"Meal {index + 1}",
            )
        ).strip()

        if not name:
            name = f"Meal {index + 1}"

        description = str(
            meal.get(
                "description",
                "",
            )
            or ""
        ).strip()

        raw_foods = meal.get(
            "foods",
            [],
        )

        if not isinstance(
            raw_foods,
            list,
        ):

            raw_foods = []

        normalized_foods = []

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

                food_id = int(food_id)

            except (
                TypeError,
                ValueError,
            ):

                continue

            # --------------------------------------------------
            # INITIAL SERVINGS
            # --------------------------------------------------

            servings = selected_food.get(
                "servings",
                1,
            )

            try:

                servings = float(
                    servings
                )

            except (
                TypeError,
                ValueError,
            ):

                servings = 1.0

            # --------------------------------------------------
            # Safety limits
            # --------------------------------------------------

            if servings <= 0:
                servings = 1.0

            # Don't allow ridiculous initial quantities.
            servings = min(
                servings,
                4.0,
            )

            normalized_foods.append(
                {
                    "food_id": food_id,
                    "servings": round(
                        servings,
                        2,
                    ),
                }
            )

        if normalized_foods:

            normalized_meals.append(
                {
                    "name": name,
                    "description": description,
                    "foods": normalized_foods,
                }
            )

    # ------------------------------------------------------
    # Validate meal count
    # ------------------------------------------------------

    if len(normalized_meals) != meals_per_day:

        raise ValueError(
            "AI generated "
            f"{len(normalized_meals)} meals, "
            f"but {meals_per_day} meals were requested."
        )

    return {
        "summary": str(
            result.get(
                "summary",
                "AI-generated personalized meal plan.",
            )
            or ""
        ).strip(),

        "meals": normalized_meals,

        "recommendations": (
            result.get(
                "recommendations",
                [],
            )
            if isinstance(
                result.get(
                    "recommendations",
                    [],
                ),
                list,
            )
            else []
        ),
    }


# ==========================================================
# AI FOOD SELECTION
# ==========================================================

def generate_ai_food_selection(
    food_data: List[Dict[str, Any]],
    calories: float,
    protein: float,
    carbohydrates: float,
    fat: float,
    meals_per_day: int,
    dietary_preference: Optional[str] = "",
    allergies: Optional[List[str]] = None,
    excluded_foods: Optional[List[str]] = None,
    goal: Optional[str] = "",
    notes: Optional[str] = "",
) -> Dict[str, Any]:

    allergies = allergies or []
    excluded_foods = excluded_foods or []

    # ======================================================
    # VALIDATION
    # ======================================================

    if not food_data:

        raise ValueError(
            "No food data was provided to the AI."
        )

    if calories <= 0:

        raise ValueError(
            "Daily calorie target must be greater than zero."
        )

    if meals_per_day < 1:

        raise ValueError(
            "Meals per day must be at least 1."
        )

    # ======================================================
    # COMPACT FOOD DATABASE
    # ======================================================
    #
    # IMPORTANT:
    #
    # We intentionally DO NOT send nutrition values
    # to Groq.
    #
    # This significantly reduces token usage.
    #
    # Python will use MySQL nutrition data later.
    # ======================================================

    food_database = []

    for food in food_data:

        food_id = food.get("id")

        if food_id is None:
            continue

        food_database.append(
            {
                "food_id": int(food_id),

                "name": str(
                    food.get(
                        "name",
                        "",
                    )
                ),

                "category": str(
                    food.get(
                        "category",
                        "",
                    )
                    or ""
                ),

                "serving_size": food.get(
                    "serving_size"
                ),

                "serving_unit": food.get(
                    "serving_unit"
                ),
            }
        )

    if not food_database:

        raise ValueError(
            "No valid foods are available."
        )

    # ======================================================
    # PROMPT
    # ======================================================

    prompt = f"""
You are NutriFlow's AI food selection engine.

Your ONLY job is to select foods from the supplied
database and organize them into meals.

Python will calculate and optimize all nutrition values.

Do NOT calculate nutrition.

==========================================================
USER TARGETS
==========================================================

Daily calories: {calories}
Daily protein: {protein} g
Daily carbohydrates: {carbohydrates} g
Daily fat: {fat} g

Meals per day: {meals_per_day}

Dietary preference:
{dietary_preference or "None"}

Allergies:
{json.dumps(allergies)}

Excluded foods:
{json.dumps(excluded_foods)}

Goal:
{goal or "None"}

Additional notes:
{notes or "None"}

==========================================================
STRICT RULES
==========================================================

1. Use ONLY food IDs from the supplied database.

2. NEVER invent a food.

3. NEVER invent a food ID.

4. Create EXACTLY {meals_per_day} meals.

5. Every meal must contain at least one food.

6. Prefer 2 to 4 foods per meal.

7. Prefer variety between meals.

8. Avoid unnecessarily repeating the same food.

9. Respect allergies.

10. Respect excluded foods.

11. Use realistic serving quantities.

12. Initial servings should normally be between
    0.5 and 2.5.

13. Do NOT return calories.

14. Do NOT return protein.

15. Do NOT return carbohydrates.

16. Do NOT return fat.

17. Do NOT return fiber.

18. Do NOT calculate nutrition.

19. Python will optimize servings after this response.

20. Return ONLY JSON.

==========================================================
OUTPUT FORMAT
==========================================================

{{
  "summary": "Short description",
  "meals": [
    {{
      "name": "Breakfast",
      "description": "Short description",
      "foods": [
        {{
          "food_id": 17,
          "servings": 1
        }},
        {{
          "food_id": 12,
          "servings": 1
        }}
      ]
    }}
  ],
  "recommendations": []
}}

==========================================================
AVAILABLE FOODS
==========================================================

{json.dumps(food_database, separators=(",", ":"))}
"""

    # ======================================================
    # ONE GROQ REQUEST ONLY
    # ======================================================

    try:

        response = client.chat.completions.create(

            model="llama-3.3-70b-versatile",

            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are NutriFlow's food "
                        "selection engine. "
                        "Return valid JSON only. "
                        "Use only supplied food IDs. "
                        "Never calculate nutrition."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],

            temperature=0.1,

            # Much smaller than the previous 4000.
            max_tokens=1800,
        )

    except Exception as error:

        error_text = str(error)

        if (
            "429" in error_text
            or "rate_limit" in error_text.lower()
            or "rate limit" in error_text.lower()
        ):

            raise ValueError(
                "Groq rate limit reached. "
                "The meal planner now uses one AI request "
                "per generation, so please wait for the "
                "Groq limit to reset and try again."
            )

        raise

    # ======================================================
    # RESPONSE
    # ======================================================

    content = (
        response.choices[0]
        .message
        .content
    )

    if not content:

        raise ValueError(
            "Groq returned an empty response."
        )

    print(
        "\n================ GROQ FOOD SELECTION ================\n"
    )

    print(content)

    print(
        "\n=======================================================\n"
    )

    raw_result = _extract_json(
        content
    )

    return _normalize_selection(
        raw_result,
        meals_per_day=meals_per_day,
    )