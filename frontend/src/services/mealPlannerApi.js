import api from "./api";

// ==========================================================
// GENERATE AI MEAL PLAN
// ==========================================================

export async function generateMealPlan(mealPlanData) {
  const response = await api.post(
    "/meal-planner/generate",
    mealPlanData
  );

  return response.data;
}