import { useEffect, useState } from "react";

import {
  getNutritionProfile,
  calculateNutrition,
} from "../services/nutritionApi";

// ==========================================================
// NUTRITION SUMMARY
// ==========================================================

export default function NutritionSummary() {
  const [profile, setProfile] = useState(null);
  const [nutrition, setNutrition] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================================
  // LOAD DATA
  // ========================================================

  useEffect(() => {
    let mounted = true;

    async function loadNutritionData() {
      try {
        setLoading(true);
        setError("");

        const [
          profileData,
          nutritionData,
        ] = await Promise.all([
          getNutritionProfile(),
          calculateNutrition(),
        ]);

        if (!mounted) {
          return;
        }

        setProfile(profileData);
        setNutrition(nutritionData);
      } catch (err) {
        console.error(
          "Failed to load nutrition data:",
          err
        );

        if (!mounted) {
          return;
        }

        if (err.response?.status === 404) {
          setError(
            "Please complete your nutrition profile first."
          );
        } else if (err.response?.status === 401) {
          setError(
            "Your session has expired. Please log in again."
          );
        } else {
          setError(
            "Unable to load your nutrition summary."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadNutritionData();

    return () => {
      mounted = false;
    };
  }, []);

  // ========================================================
  // LOADING STATE
  // ========================================================

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-5">
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-slate-200" />

            <div className="h-7 w-56 rounded bg-slate-200" />

            <div className="h-4 w-80 max-w-full rounded bg-slate-100" />
          </div>

          <div className="h-32 rounded-2xl bg-slate-100" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-28 rounded-2xl bg-slate-100" />
            <div className="h-28 rounded-2xl bg-slate-100" />
            <div className="h-28 rounded-2xl bg-slate-100" />
          </div>

          <div className="h-40 rounded-2xl bg-slate-100" />
        </div>
      </section>
    );
  }

  // ========================================================
  // ERROR STATE
  // ========================================================

  if (error) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg">
            !
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Nutrition Summary
            </h2>

            <p className="mt-1 text-sm leading-6 text-amber-700">
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ========================================================
  // EMPTY STATE
  // ========================================================

  if (!nutrition) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          Nutrition Summary
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Your nutrition information is not available yet.
        </p>
      </section>
    );
  }

  // ========================================================
  // SAFE VALUES
  // ========================================================

  const macros = nutrition.macros || {};

  const bmr = Number(nutrition.bmr) || 0;
  const tdee = Number(nutrition.tdee) || 0;
  const targetCalories =
    Number(nutrition.target_calories) || 0;

  const protein =
    Number(macros.protein_g) || 0;

  const carbohydrates =
    Number(macros.carbohydrates_g) || 0;

  const fat =
    Number(macros.fat_g) || 0;

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <section className="space-y-6">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-600">
          Your nutrition
        </p>

        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
          Daily Nutrition Summary
        </h2>

        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
          Your calculated energy requirements and
          recommended daily nutrition targets.
        </p>
      </div>

      {/* ==================================================
          CALORIE TARGET
      ================================================== */}

      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white shadow-sm">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-emerald-50">
              Recommended daily calories
            </p>

            <div className="mt-2 flex items-end gap-2">
              <span className="text-4xl font-extrabold tracking-tight">
                {Math.round(targetCalories)}
              </span>

              <span className="pb-1 text-sm text-emerald-50">
                kcal / day
              </span>
            </div>

            {profile?.goal && (
              <p className="mt-3 text-sm text-emerald-50">
                Goal:{" "}
                <span className="font-semibold capitalize">
                  {profile.goal}
                </span>
              </p>
            )}
          </div>

          <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs font-medium text-emerald-50">
              Daily target
            </p>

            <p className="mt-1 text-lg font-bold">
              {Math.round(targetCalories)} kcal
            </p>
          </div>
        </div>
      </div>

      {/* ==================================================
          ENERGY CARDS
      ================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NutritionCard
          title="BMR"
          value={bmr}
          unit="kcal"
          description="Calories your body needs at rest."
        />

        <NutritionCard
          title="TDEE"
          value={tdee}
          unit="kcal"
          description="Estimated calories burned each day."
        />

        <NutritionCard
          title="Target"
          value={targetCalories}
          unit="kcal"
          description="Recommended daily calorie intake."
        />
      </div>

      {/* ==================================================
          MACROS
      ================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="text-lg font-bold text-slate-900">
            Daily Macro Targets
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Your recommended protein, carbohydrate, and
            fat intake.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <MacroCard
            title="Protein"
            value={protein}
            unit="g"
          />

          <MacroCard
            title="Carbohydrates"
            value={carbohydrates}
            unit="g"
          />

          <MacroCard
            title="Fat"
            value={fat}
            unit="g"
          />
        </div>
      </div>
    </section>
  );
}

// ==========================================================
// NUTRITION CARD
// ==========================================================

function NutritionCard({
  title,
  value,
  unit,
  description,
}) {
  const numericValue = Number(value) || 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-sm font-semibold text-slate-500">
        {title}
      </p>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-extrabold text-slate-900">
          {Math.round(numericValue)}
        </span>

        <span className="text-sm text-slate-500">
          {unit}
        </span>
      </div>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

// ==========================================================
// MACRO CARD
// ==========================================================

function MacroCard({ title, value, unit }) {
  const numericValue = Number(value) || 0;

  return (
    <div className="rounded-xl bg-slate-50 p-4 transition hover:bg-slate-100">
      <p className="text-sm font-semibold text-slate-600">
        {title}
      </p>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-extrabold text-slate-900">
          {Math.round(numericValue)}
        </span>

        <span className="text-sm text-slate-500">
          {unit}
        </span>
      </div>
    </div>
  );
}