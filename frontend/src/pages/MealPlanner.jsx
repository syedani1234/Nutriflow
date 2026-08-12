import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  calculateNutrition,
  getNutritionProfile,
} from "../services/nutritionApi";

import { generateMealPlan } from "../services/mealPlannerApi";

export default function MealPlanner() {
  const [nutrition, setNutrition] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loadingNutrition, setLoadingNutrition] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState({
    meals_per_day: 3,
    dietary_preference: "",
    allergies: "",
    excluded_foods: "",
    goal: "",
    notes: "",
  });

  const [mealPlan, setMealPlan] = useState(null);

  // ==========================================================
  // LOAD USER NUTRITION DATA
  // ==========================================================

  useEffect(() => {
    async function loadNutritionData() {
      try {
        setLoadingNutrition(true);

        const [profileData, nutritionData] = await Promise.all([
          getNutritionProfile(),
          calculateNutrition(),
        ]);

        setProfile(profileData);
        setNutrition(nutritionData);

        setFormData((previous) => ({
          ...previous,
          goal: profileData?.goal || "",
          dietary_preference:
            profileData?.dietary_preference || "",
        }));
      } catch (error) {
        console.error(
          "Failed to load nutrition data:",
          error
        );

        if (error.response?.status === 404) {
          toast.error(
            "Please complete your nutrition profile first."
          );
        } else {
          toast.error(
            "Unable to load your nutrition information."
          );
        }
      } finally {
        setLoadingNutrition(false);
      }
    }

    loadNutritionData();
  }, []);

  // ==========================================================
  // HANDLE INPUT
  // ==========================================================

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // ==========================================================
  // GENERATE MEAL PLAN
  // ==========================================================

  async function handleGenerateMealPlan(event) {
    event.preventDefault();

    if (!nutrition) {
      toast.error(
        "Nutrition information is not available yet."
      );
      return;
    }

    try {
      setGenerating(true);
      setMealPlan(null);

      const requestData = {
        calories: Number(nutrition.target_calories || 0),

        protein: Number(
          nutrition.macros?.protein_g || 0
        ),

        carbohydrates: Number(
          nutrition.macros?.carbohydrates_g || 0
        ),

        fat: Number(
          nutrition.macros?.fat_g || 0
        ),

        meals_per_day: Number(
          formData.meals_per_day
        ),

        dietary_preference:
          formData.dietary_preference.trim() || null,

        allergies: formData.allergies
          ? formData.allergies
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],

        excluded_foods: formData.excluded_foods
          ? formData.excluded_foods
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],

        goal: formData.goal.trim() || null,

        notes: formData.notes.trim() || null,
      };

      console.log(
        "Generating meal plan with:",
        requestData
      );

      const result =
        await generateMealPlan(requestData);

      console.log(
        "Meal plan response:",
        result
      );

      setMealPlan(result);

      toast.success(
        "Your personalized meal plan is ready!"
      );
    } catch (error) {
      console.error(
        "Meal plan generation error:",
        error
      );

      const message =
        error.response?.data?.detail ||
        "Unable to generate your meal plan.";

      toast.error(
        typeof message === "string"
          ? message
          : "Unable to generate your meal plan."
      );
    } finally {
      setGenerating(false);
    }
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loadingNutrition) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-72 rounded-lg bg-slate-200" />

            <div className="h-32 rounded-2xl bg-slate-200" />

            <div className="h-96 rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">
            AI Meal Planner
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Build your personalized meal plan
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            NutriFlow uses your nutrition targets, goals,
            dietary preferences, and restrictions to create
            a personalized daily meal plan.
          </p>
        </div>

        {/* ==================================================
            NUTRITION TARGET SUMMARY
        ================================================== */}

        {nutrition && (
          <div className="mb-8 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white shadow-lg">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <p className="text-sm font-medium text-emerald-50">
                  Your daily nutrition target
                </p>

                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold">
                    {Math.round(
                      nutrition.target_calories
                    )}
                  </span>

                  <span className="text-sm text-emerald-50">
                    kcal / day
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <TargetCard
                  label="Protein"
                  value={
                    nutrition.macros?.protein_g
                  }
                  unit="g"
                />

                <TargetCard
                  label="Carbs"
                  value={
                    nutrition.macros
                      ?.carbohydrates_g
                  }
                  unit="g"
                />

                <TargetCard
                  label="Fat"
                  value={
                    nutrition.macros?.fat_g
                  }
                  unit="g"
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">

          {/* ==================================================
              SETTINGS
          ================================================== */}

          <section className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-slate-900">
                Meal preferences
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Customize your meal plan before generating it.
              </p>
            </div>

            <form
              onSubmit={handleGenerateMealPlan}
              className="space-y-5"
            >

              {/* Meals */}
              <div>
                <label
                  htmlFor="meals_per_day"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Meals per day
                </label>

                <select
                  id="meals_per_day"
                  name="meals_per_day"
                  value={formData.meals_per_day}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value={2}>2 meals</option>
                  <option value={3}>3 meals</option>
                  <option value={4}>4 meals</option>
                  <option value={5}>5 meals</option>
                  <option value={6}>6 meals</option>
                  <option value={7}>7 meals</option>
                  <option value={8}>8 meals</option>
                </select>
              </div>

              {/* Dietary Preference */}
              <div>
                <label
                  htmlFor="dietary_preference"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Dietary preference
                </label>

                <input
                  id="dietary_preference"
                  name="dietary_preference"
                  value={
                    formData.dietary_preference
                  }
                  onChange={handleChange}
                  placeholder="e.g. Vegetarian, Halal, High Protein"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Allergies */}
              <div>
                <label
                  htmlFor="allergies"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Allergies
                </label>

                <input
                  id="allergies"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="e.g. peanuts, milk"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Separate multiple items with commas.
                </p>
              </div>

              {/* Excluded foods */}
              <div>
                <label
                  htmlFor="excluded_foods"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Foods to avoid
                </label>

                <input
                  id="excluded_foods"
                  name="excluded_foods"
                  value={formData.excluded_foods}
                  onChange={handleChange}
                  placeholder="e.g. broccoli, tuna"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Separate multiple foods with commas.
                </p>
              </div>

              {/* Goal */}
              <div>
                <label
                  htmlFor="goal"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Goal
                </label>

                <input
                  id="goal"
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  placeholder="e.g. Lose weight"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="notes"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Additional notes
                </label>

                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Tell NutriFlow anything else about your preferences..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Generate */}
              <button
                type="submit"
                disabled={generating || !nutrition}
                className="w-full rounded-xl bg-emerald-500 px-5 py-3.5 font-bold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating
                  ? "Generating your plan..."
                  : "✨ Generate Meal Plan"}
              </button>

            </form>
          </section>

          {/* ==================================================
              RESULTS
          ================================================== */}

          <section>
            {!mealPlan && (
              <EmptyMealPlan />
            )}

            {mealPlan && (
              <MealPlanResults
                mealPlan={mealPlan}
              />
            )}
          </section>

        </div>
      </div>
    </div>
  );
}

// ==========================================================
// TARGET CARD
// ==========================================================

function TargetCard({ label, value, unit }) {
  return (
    <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
      <p className="text-xs font-medium text-emerald-50">
        {label}
      </p>

      <p className="mt-1 text-xl font-extrabold">
        {Math.round(value || 0)}
        <span className="ml-1 text-xs font-medium">
          {unit}
        </span>
      </p>
    </div>
  );
}

// ==========================================================
// EMPTY STATE
// ==========================================================

function EmptyMealPlan() {
  return (
    <div className="flex min-h-[600px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">

      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-4xl">
        🍽️
      </div>

      <h2 className="mt-6 text-2xl font-extrabold text-slate-900">
        Your meal plan will appear here
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        Customize your preferences and click
        <span className="font-semibold text-emerald-600">
          {" "}Generate Meal Plan
        </span>
        {" "}to create your personalized nutrition plan.
      </p>
    </div>
  );
}

// ==========================================================
// MEAL PLAN RESULTS
// ==========================================================

function MealPlanResults({ mealPlan }) {
  const meals = mealPlan.meals || [];

  return (
    <div className="space-y-6">

      {/* Summary */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-emerald-600">
              Your personalized plan
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
              Today's Meal Plan
            </h2>

            {mealPlan.summary && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {mealPlan.summary}
              </p>
            )}
          </div>

          {mealPlan.ai_generated && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              AI Generated
            </span>
          )}
        </div>

        {/* Totals */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <ResultStat
            label="Calories"
            value={mealPlan.total_calories}
            unit="kcal"
          />

          <ResultStat
            label="Protein"
            value={mealPlan.total_protein}
            unit="g"
          />

          <ResultStat
            label="Carbohydrates"
            value={mealPlan.total_carbohydrates}
            unit="g"
          />

          <ResultStat
            label="Fat"
            value={mealPlan.total_fat}
            unit="g"
          />

        </div>
      </div>

      {/* Meals */}
      <div className="space-y-4">
        {meals.map((meal, index) => (
          <MealCard
            key={`${meal.name}-${index}`}
            meal={meal}
            index={index}
          />
        ))}
      </div>

      {/* Recommendations */}
      {mealPlan.recommendations?.length > 0 && (
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">

          <h3 className="text-lg font-extrabold text-slate-900">
            NutriFlow Recommendations
          </h3>

          <ul className="mt-4 space-y-2">
            {mealPlan.recommendations.map(
              (recommendation, index) => (
                <li
                  key={index}
                  className="flex gap-3 text-sm leading-6 text-slate-700"
                >
                  <span className="font-bold text-emerald-600">
                    ✓
                  </span>

                  <span>
                    {recommendation}
                  </span>
                </li>
              )
            )}
          </ul>
        </div>
      )}

    </div>
  );
}

// ==========================================================
// RESULT STAT
// ==========================================================

function ResultStat({ label, value, unit }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-extrabold text-slate-900">
        {Math.round(value || 0)}
        <span className="ml-1 text-sm font-medium text-slate-500">
          {unit}
        </span>
      </p>
    </div>
  );
}

// ==========================================================
// MEAL CARD
// ==========================================================

function MealCard({ meal, index }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 p-5 sm:p-6">

        <div className="flex items-start justify-between gap-4">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
              {getMealEmoji(index)}
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {meal.name}
              </h3>

              {meal.description && (
                <p className="mt-1 text-sm text-slate-500">
                  {meal.description}
                </p>
              )}
            </div>

          </div>

          <div className="text-right">
            <p className="text-lg font-extrabold text-slate-900">
              {Math.round(meal.total_calories || 0)}
            </p>

            <p className="text-xs text-slate-500">
              kcal
            </p>
          </div>

        </div>
      </div>

      <div className="divide-y divide-slate-100">

        {(meal.items || []).map(
          (item, itemIndex) => (
            <div
              key={`${item.food_id}-${itemIndex}`}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div>
                <p className="font-semibold text-slate-800">
                  {item.food_name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {item.servings} ×{" "}
                  {item.serving_size}{" "}
                  {item.serving_unit}
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-slate-900">
                  {Math.round(item.calories || 0)} kcal
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  P {Math.round(item.protein || 0)}g
                  {" · "}
                  C {Math.round(item.carbohydrates || 0)}g
                  {" · "}
                  F {Math.round(item.fat || 0)}g
                </p>
              </div>
            </div>
          )
        )}

      </div>

      <div className="grid grid-cols-4 gap-2 border-t border-slate-100 bg-slate-50 p-4">

        <MiniMacro
          label="Calories"
          value={meal.total_calories}
          unit="kcal"
        />

        <MiniMacro
          label="Protein"
          value={meal.total_protein}
          unit="g"
        />

        <MiniMacro
          label="Carbs"
          value={meal.total_carbohydrates}
          unit="g"
        />

        <MiniMacro
          label="Fat"
          value={meal.total_fat}
          unit="g"
        />

      </div>
    </article>
  );
}

// ==========================================================
// MINI MACRO
// ==========================================================

function MiniMacro({ label, value, unit }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-700">
        {Math.round(value || 0)}
        <span className="ml-1 text-[10px] font-medium text-slate-400">
          {unit}
        </span>
      </p>
    </div>
  );
}

// ==========================================================
// MEAL EMOJI
// ==========================================================

function getMealEmoji(index) {
  const emojis = ["🌅", "🥗", "🍲", "🍎", "🌙", "🥪"];

  return emojis[index % emojis.length];
}