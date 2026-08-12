import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getFood } from "../services/foodApi";

export default function FoodDetails() {
  const { foodId } = useParams();

  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFood() {
      try {
        setLoading(true);

        const data = await getFood(foodId);

        setFood(data);
      } catch (error) {
        console.error("Failed to load food:", error);

        toast.error(
          error?.response?.data?.detail ||
            "Unable to load food details."
        );
      } finally {
        setLoading(false);
      }
    }

    loadFood();
  }, [foodId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-5 w-32 rounded bg-slate-200" />

            <div className="rounded-3xl border border-slate-200 bg-white p-8">
              <div className="h-8 w-64 rounded bg-slate-200" />

              <div className="mt-3 h-5 w-40 rounded bg-slate-100" />

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-28 rounded-2xl bg-slate-100"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!food) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
            ⚠️
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-slate-900">
            Food not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            The food you're looking for could not be found.
          </p>

          <Link
            to="/foods"
            className="mt-6 inline-flex rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-600"
          >
            ← Back to Food Database
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Back */}
        <Link
          to="/foods"
          className="inline-flex items-center text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
        >
          ← Back to Food Database
        </Link>

        {/* Main Card */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          {/* Header */}
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-8 text-white sm:p-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-emerald-100">
                  NutriFlow Food Database
                </p>

                <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {food.name}
                </h1>

                {food.category && (
                  <span className="mt-4 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white">
                    {food.category}
                  </span>
                )}
              </div>

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl">
                🥗
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">

            {/* Serving */}
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Serving Size
              </p>

              <p className="mt-2 text-lg font-extrabold text-slate-900">
                {food.serving_size} {food.serving_unit}
              </p>
            </div>

            {/* Calories */}
            <div className="mt-6 rounded-2xl bg-emerald-50 p-6">
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-600">
                Calories
              </p>

              <div className="mt-2 flex items-end gap-2">
                <span className="text-5xl font-extrabold text-slate-900">
                  {Math.round(food.calories || 0)}
                </span>

                <span className="pb-1 text-sm font-semibold text-slate-500">
                  kcal
                </span>
              </div>
            </div>

            {/* Macronutrients */}
            <div className="mt-8">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Nutritional Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Nutritional values for the selected serving.
                </p>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <NutritionCard
                  label="Protein"
                  value={food.protein}
                  unit="g"
                  icon="🥩"
                />

                <NutritionCard
                  label="Carbohydrates"
                  value={food.carbohydrates}
                  unit="g"
                  icon="🌾"
                />

                <NutritionCard
                  label="Fat"
                  value={food.fat}
                  unit="g"
                  icon="🥑"
                />

                <NutritionCard
                  label="Fiber"
                  value={food.fiber}
                  unit="g"
                  icon="🌱"
                />
              </div>
            </div>

            {/* Description */}
            {food.description && (
              <div className="mt-8 rounded-2xl border border-slate-200 p-6">
                <h2 className="text-lg font-extrabold text-slate-900">
                  About this food
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {food.description}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/meal-planner"
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-600"
              >
                Create Meal Plan →
              </Link>

              <Link
                to="/foods"
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Browse More Foods
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function NutritionCard({
  label,
  value,
  unit,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">
          {label}
        </p>

        <span className="text-xl">
          {icon}
        </span>
      </div>

      <div className="mt-4">
        <span className="text-2xl font-extrabold text-slate-900">
          {Math.round(value || 0)}
        </span>

        <span className="ml-1 text-sm font-medium text-slate-500">
          {unit}
        </span>
      </div>
    </div>
  );
}