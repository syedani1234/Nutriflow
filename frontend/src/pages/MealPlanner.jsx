import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  calculateNutrition,
  getNutritionProfile,
} from "../services/nutritionApi";

import { generateMealPlan } from "../services/mealPlannerApi";

// ==========================================================
// CONSTANTS
// ==========================================================

const INITIAL_FORM = {
  meals_per_day: 3,
  dietary_preference: "",
  allergies: "",
  excluded_foods: "",
  goal: "",
  notes: "",
};

const MEAL_OPTIONS = [2, 3, 4, 5, 6];

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

const TEXTAREA_CLASS =
  "w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

// ==========================================================
// PAGE
// ==========================================================

export default function MealPlanner() {
  const [nutrition, setNutrition] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loadingNutrition, setLoadingNutrition] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [mealPlan, setMealPlan] = useState(null);

  // ========================================================
  // LOAD NUTRITION DATA
  // ========================================================

  useEffect(() => {
    let mounted = true;

    async function loadNutritionData() {
      try {
        setLoadingNutrition(true);

        const [profileData, nutritionData] = await Promise.all([
          getNutritionProfile(),
          calculateNutrition(),
        ]);

        if (!mounted) {
          return;
        }

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

        if (!mounted) {
          return;
        }

        if (error.response?.status === 404) {
          toast.error(
            "Please complete your nutrition profile first."
          );
        } else {
          toast.error(
            error.response?.data?.detail ||
              "Unable to load your nutrition information."
          );
        }
      } finally {
        if (mounted) {
          setLoadingNutrition(false);
        }
      }
    }

    loadNutritionData();

    return () => {
      mounted = false;
    };
  }, []);

  // ========================================================
  // HANDLE FORM CHANGE
  // ========================================================

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // ========================================================
  // CONVERT COMMA-SEPARATED TEXT TO ARRAY
  // ========================================================

  function parseList(value) {
    if (!value?.trim()) {
      return [];
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  // ========================================================
  // GENERATE MEAL PLAN
  // ========================================================

  async function handleGenerateMealPlan(event) {
    event.preventDefault();

    if (!nutrition) {
      toast.error(
        "Nutrition information is not available."
      );
      return;
    }

    const calories = Number(
      nutrition.target_calories || 0
    );

    const protein = Number(
      nutrition.macros?.protein_g || 0
    );

    const carbohydrates = Number(
      nutrition.macros?.carbohydrates_g || 0
    );

    const fat = Number(
      nutrition.macros?.fat_g || 0
    );

    if (calories <= 0) {
      toast.error(
        "Your calorie target is not available. Please update your nutrition profile."
      );
      return;
    }

    try {
      setGenerating(true);

      const requestData = {
        calories,
        protein,
        carbohydrates,
        fat,

        meals_per_day: Number(
          formData.meals_per_day
        ),

        dietary_preference:
          formData.dietary_preference.trim() || null,

        allergies: parseList(formData.allergies),

        excluded_foods: parseList(
          formData.excluded_foods
        ),

        goal: formData.goal.trim() || null,

        notes: formData.notes.trim() || null,
      };

      const result =
        await generateMealPlan(requestData);

      setMealPlan(result);

      toast.success(
        "Your personalized meal plan is ready!"
      );
    } catch (error) {
      console.error(
        "Meal plan generation failed:",
        error
      );

      const detail =
        error.response?.data?.detail;

      toast.error(
        typeof detail === "string"
          ? detail
          : "Unable to generate your meal plan. Please try again."
      );
    } finally {
      setGenerating(false);
    }
  }

  // ========================================================
  // RESET GENERATED PLAN
  // ========================================================

  function handleResetPlan() {
    setMealPlan(null);
  }

  // ========================================================
  // LOADING STATE
  // ========================================================

  if (loadingNutrition) {
    return <MealPlannerSkeleton />;
  }

  // ========================================================
  // PAGE
  // ========================================================

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">
                NutriFlow AI
              </p>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Personalized Meal Planner
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Create a personalized daily meal plan using
                your nutrition targets, goals, preferences,
                allergies, and foods you want to avoid.
              </p>
            </div>

            <Link
              to="/nutrition-profile"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-600"
            >
              Edit Nutrition Profile
            </Link>
          </div>
        </header>

        {/* ==================================================
            TARGET SUMMARY
        ================================================== */}

        {nutrition && (
          <NutritionTargetSummary
            nutrition={nutrition}
            profile={profile}
          />
        )}

        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <div className="mt-8 grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">

          {/* ==================================================
              PREFERENCES
          ================================================== */}

          <section className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Step 1
              </p>

              <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                Meal preferences
              </h2>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                Tell NutriFlow how you want your meals
                generated.
              </p>
            </div>

            <form
              onSubmit={handleGenerateMealPlan}
              className="space-y-5"
            >

              {/* Meals per day */}

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
                  className={INPUT_CLASS}
                >
                  {MEAL_OPTIONS.map((number) => (
                    <option
                      key={number}
                      value={number}
                    >
                      {number}{" "}
                      {number === 1
                        ? "meal"
                        : "meals"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dietary preference */}

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
                  className={INPUT_CLASS}
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
                  className={INPUT_CLASS}
                />

                <p className="mt-1.5 text-xs text-slate-400">
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
                  className={INPUT_CLASS}
                />

                <p className="mt-1.5 text-xs text-slate-400">
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
                  className={INPUT_CLASS}
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
                  className={TEXTAREA_CLASS}
                />
              </div>

              {/* Generate */}

              <button
                type="submit"
                disabled={generating || !nutrition}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Generating...
                  </>
                ) : (
                  <>✨ Generate Meal Plan</>
                )}
              </button>

              {mealPlan && !generating && (
                <button
                  type="button"
                  onClick={handleResetPlan}
                  className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Start Over
                </button>
              )}
            </form>
          </section>

          {/* ==================================================
              RESULTS
          ================================================== */}

          <section>
            {!mealPlan ? (
              <EmptyMealPlan />
            ) : (
              <MealPlanResults
                mealPlan={mealPlan}
                onRegenerate={handleGenerateMealPlan}
                generating={generating}
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

// ==========================================================
// NUTRITION TARGET SUMMARY
// ==========================================================

function NutritionTargetSummary({
  nutrition,
  profile,
}) {
  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-6 text-white shadow-lg sm:p-7">

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <p className="text-sm font-semibold text-emerald-50">
            Your daily nutrition target
          </p>

          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold">
              {Math.round(
                nutrition.target_calories || 0
              )}
            </span>

            <span className="text-sm text-emerald-50">
              kcal / day
            </span>
          </div>

          {profile?.goal && (
            <p className="mt-2 text-sm text-emerald-50">
              Goal:{" "}
              <span className="font-bold text-white">
                {profile.goal}
              </span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 sm:min-w-[360px]">
          <TargetCard
            label="Protein"
            value={nutrition.macros?.protein_g}
            unit="g"
          />

          <TargetCard
            label="Carbs"
            value={
              nutrition.macros?.carbohydrates_g
            }
            unit="g"
          />

          <TargetCard
            label="Fat"
            value={nutrition.macros?.fat_g}
            unit="g"
          />
        </div>
      </div>
    </section>
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
    <div className="flex min-h-[620px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">

      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-4xl">
        🍽️
      </div>

      <p className="mt-6 text-xs font-bold uppercase tracking-wider text-emerald-600">
        Ready when you are
      </p>

      <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
        Your meal plan will appear here
      </h2>

      <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
        Select your preferences and generate a
        personalized meal plan based on your daily
        nutrition targets.
      </p>

      <div className="mt-6 grid w-full max-w-md gap-3 sm:grid-cols-3">
        <InfoPill icon="🎯" text="Your targets" />
        <InfoPill icon="🥗" text="Food preferences" />
        <InfoPill icon="🤖" text="AI planning" />
      </div>
    </div>
  );
}

// ==========================================================
// INFO PILL
// ==========================================================

function InfoPill({ icon, text }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3 text-center">
      <div className="text-xl">{icon}</div>

      <p className="mt-1 text-xs font-semibold text-slate-600">
        {text}
      </p>
    </div>
  );
}

// ==========================================================
// MEAL PLAN RESULTS
// ==========================================================

function MealPlanResults({
  mealPlan,
  onRegenerate,
  generating,
}) {
  const meals = Array.isArray(mealPlan.meals)
    ? mealPlan.meals
    : [];

  const totalCalories = Number(
    mealPlan.total_calories || 0
  );

  const totalProtein = Number(
    mealPlan.total_protein || 0
  );

  const totalCarbohydrates = Number(
    mealPlan.total_carbohydrates || 0
  );

  const totalFat = Number(
    mealPlan.total_fat || 0
  );

  return (
    <div className="space-y-6">

      {/* ==================================================
          PLAN SUMMARY
      ================================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Personalized plan
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

          <div className="flex items-center gap-2">
            {mealPlan.ai_generated && (
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                ✨ AI Generated
              </span>
            )}
          </div>
        </div>

        {/* Totals */}

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ResultStat
            label="Calories"
            value={totalCalories}
            unit="kcal"
          />

          <ResultStat
            label="Protein"
            value={totalProtein}
            unit="g"
          />

          <ResultStat
            label="Carbohydrates"
            value={totalCarbohydrates}
            unit="g"
          />

          <ResultStat
            label="Fat"
            value={totalFat}
            unit="g"
          />
        </div>

        {/* Regenerate */}

        <button
          type="button"
          onClick={onRegenerate}
          disabled={generating}
          className="mt-5 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {generating
            ? "Generating..."
            : "↻ Generate Another Plan"}
        </button>
      </section>

      {/* ==================================================
          MEALS
      ================================================== */}

      {meals.length > 0 ? (
        <div className="space-y-4">
          {meals.map((meal, index) => (
            <MealCard
              key={`${meal.name || "meal"}-${index}`}
              meal={meal}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-slate-600">
            No individual meals were returned.
          </p>
        </div>
      )}

      {/* ==================================================
          RECOMMENDATIONS
      ================================================== */}

      {Array.isArray(
        mealPlan.recommendations
      ) &&
        mealPlan.recommendations.length > 0 && (
          <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl">
                💡
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  NutriFlow Recommendations
                </h3>

                <p className="text-sm text-slate-500">
                  Helpful suggestions based on your plan.
                </p>
              </div>
            </div>

            <ul className="mt-5 space-y-3">
              {mealPlan.recommendations.map(
                (recommendation, index) => (
                  <li
                    key={index}
                    className="flex gap-3 rounded-xl bg-white/70 p-3 text-sm leading-6 text-slate-700"
                  >
                    <span className="font-bold text-emerald-600">
                      ✓
                    </span>

                    <span>{recommendation}</span>
                  </li>
                )
              )}
            </ul>
          </section>
        )}
    </div>
  );
}

// ==========================================================
// RESULT STAT
// ==========================================================

function ResultStat({
  label,
  value,
  unit,
}) {
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
  const items = Array.isArray(meal.items)
    ? meal.items
    : [];

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}

      <div className="border-b border-slate-100 p-5 sm:p-6">

        <div className="flex items-start justify-between gap-4">

          <div className="flex min-w-0 items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
              {getMealEmoji(index)}
            </div>

            <div className="min-w-0">
              <h3 className="text-lg font-extrabold text-slate-900">
                {meal.name || `Meal ${index + 1}`}
              </h3>

              {meal.description && (
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {meal.description}
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-lg font-extrabold text-slate-900">
              {Math.round(
                meal.total_calories || 0
              )}
            </p>

            <p className="text-xs text-slate-500">
              kcal
            </p>
          </div>
        </div>
      </div>

      {/* Food items */}

      {items.length > 0 && (
        <div className="divide-y divide-slate-100">
          {items.map((item, itemIndex) => (
            <div
              key={`${item.food_id || item.food_name}-${itemIndex}`}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-800">
                  {item.food_name ||
                    "Food item"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {item.servings || 1} ×{" "}
                  {item.serving_size || 0}{" "}
                  {item.serving_unit || "g"}
                </p>
              </div>

              <div className="sm:text-right">
                <p className="font-bold text-slate-900">
                  {Math.round(
                    item.calories || 0
                  )}{" "}
                  kcal
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  P{" "}
                  {Math.round(
                    item.protein || 0
                  )}
                  g
                  {" · "}
                  C{" "}
                  {Math.round(
                    item.carbohydrates || 0
                  )}
                  g
                  {" · "}
                  F{" "}
                  {Math.round(
                    item.fat || 0
                  )}
                  g
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Meal totals */}

      <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50 p-4 sm:grid-cols-4">
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

function MiniMacro({
  label,
  value,
  unit,
}) {
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
  const emojis = [
    "🌅",
    "🥗",
    "🍲",
    "🍎",
    "🌙",
    "🥪",
  ];

  return emojis[index % emojis.length];
}

// ==========================================================
// LOADING SKELETON
// ==========================================================

function MealPlannerSkeleton() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="animate-pulse space-y-8">

          <div>
            <div className="h-4 w-32 rounded bg-slate-200" />

            <div className="mt-3 h-10 w-80 rounded-lg bg-slate-200" />

            <div className="mt-3 h-5 w-full max-w-2xl rounded bg-slate-100" />
          </div>

          <div className="h-36 rounded-3xl bg-slate-200" />

          <div className="grid gap-8 lg:grid-cols-[380px_1fr]">

            <div className="h-[620px] rounded-3xl bg-white" />

            <div className="h-[620px] rounded-3xl bg-white" />

          </div>
        </div>
      </div>
    </main>
  );
}