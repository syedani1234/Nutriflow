import api from "./api";

// ==========================================================
// GENERATE AI MEAL PLAN
// ==========================================================

export async function generateMealPlan(mealPlanData) {
  if (!mealPlanData || typeof mealPlanData !== "object") {
    throw new Error("Meal plan data is required.");
  }

  const response = await api.post(
    "/meal-planner/generate",
    mealPlanData
  );

  return response.data;
}