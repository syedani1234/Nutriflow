import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { calculateNutrition, getNutritionProfile } from "../services/nutritionApi";
import NutritionSummary from "../components/NutritionSummary";

function StatCard({
  title,
  value,
  unit,
  description,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">
              {value}
            </span>

            {unit && (
              <span className="text-sm font-medium text-slate-500">
                {unit}
              </span>
            )}
          </div>

          {description && (
            <p className="mt-1 text-xs text-slate-400">
              {description}
            </p>
          )}
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ProgressCard({
  title,
  current,
  target,
  unit,
  icon,
}) {
  const safeTarget = Number(target) || 0;
  const safeCurrent = Number(current) || 0;

  const percentage =
    safeTarget > 0
      ? Math.min((safeCurrent / safeTarget) * 100, 100)
      : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            {icon}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              {title}
            </p>

            <p className="text-xs text-slate-400">
              {safeCurrent.toFixed(1)} / {safeTarget.toFixed(1)} {unit}
            </p>
          </div>
        </div>

        <span className="text-sm font-semibold text-emerald-600">
          {Math.round(percentage)}%
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-700"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [nutrition, setNutrition] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const profileResponse = await getNutritionProfile();

        setProfile(profileResponse);

        const nutritionResponse = await calculateNutrition();

        setNutrition(nutritionResponse);
      } catch (err) {
        /*
         * A missing nutrition profile is not treated as a
         * fatal dashboard error. The dashboard will show
         * the profile setup state instead.
         */
        if (err?.response?.status === 404) {
          setProfile(null);
          setNutrition(null);
        } else {
          console.error("Dashboard loading error:", err);

          setError(
            err?.response?.data?.detail ||
              "Unable to load your nutrition data."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const displayName =
    user?.full_name ||
    user?.name ||
    user?.username ||
    "there";

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-32 rounded-3xl bg-slate-200" />

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-32 rounded-2xl bg-slate-200"
                />
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="h-64 rounded-2xl bg-slate-200" />
              <div className="h-64 rounded-2xl bg-slate-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-emerald-100">
                Your NutriFlow Dashboard
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome, {displayName.split(" ")[0]} 👋
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">
                Stay consistent with your nutrition goals and make
                healthier decisions every day.
              </p>
            </div>

            <Link
              to="/meal-planner"
              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
            >
              Generate Meal Plan
            </Link>
          </div>
        </section>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =====================================================
            PROFILE EMPTY STATE
        ===================================================== */}

        {!profile && (
          <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Complete your nutrition profile
                </p>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-amber-700">
                  Add your age, height, weight, activity level, goal,
                  and dietary preferences so NutriFlow can calculate
                  your personalized nutrition targets.
                </p>
              </div>

              <Link
                to="/nutrition-profile"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
              >
                Create Profile
              </Link>
            </div>
          </section>
        )}

        {/* =====================================================
            NUTRITION SUMMARY
        ===================================================== */}

        {nutrition && (
          <>
            <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Target Calories"
                value={Math.round(nutrition.target_calories)}
                unit="kcal"
                description="Daily target"
                icon="🔥"
              />

              <StatCard
                title="BMR"
                value={Math.round(nutrition.bmr)}
                unit="kcal"
                description="Basal metabolic rate"
                icon="⚡"
              />

              <StatCard
                title="TDEE"
                value={Math.round(nutrition.tdee)}
                unit="kcal"
                description="Estimated daily expenditure"
                icon="🏃"
              />

              <StatCard
                title="Goal"
                value={profile?.goal || "—"}
                description="Current nutrition goal"
                icon="🎯"
              />
            </section>

            {/* =================================================
                MACROS
            ================================================= */}

            <section className="mt-8">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  Daily Nutrition Targets
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your personalized macro targets based on your
                  nutrition profile.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <ProgressCard
                  title="Protein"
                  current={nutrition.macros?.protein_g}
                  target={nutrition.macros?.protein_g}
                  unit="g"
                  icon="🥩"
                />

                <ProgressCard
                  title="Carbohydrates"
                  current={nutrition.macros?.carbohydrates_g}
                  target={nutrition.macros?.carbohydrates_g}
                  unit="g"
                  icon="🌾"
                />

                <ProgressCard
                  title="Healthy Fats"
                  current={nutrition.macros?.fat_g}
                  target={nutrition.macros?.fat_g}
                  unit="g"
                  icon="🥑"
                />
              </div>
            </section>
          </>
        )}

        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage your nutrition journey from one place.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            <Link
              to="/nutrition-profile"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl">
                👤
              </div>

              <h3 className="mt-5 font-semibold text-slate-900">
                Nutrition Profile
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Manage your personal information, goals,
                activity level, and dietary preferences.
              </p>

              <span className="mt-4 inline-block text-sm font-semibold text-emerald-600">
                Manage profile →
              </span>
            </Link>

            <Link
              to="/meal-planner"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                🍽️
              </div>

              <h3 className="mt-5 font-semibold text-slate-900">
                AI Meal Planner
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Generate personalized meal plans using your
                nutrition targets and preferences.
              </p>

              <span className="mt-4 inline-block text-sm font-semibold text-emerald-600">
                Create meal plan →
              </span>
            </Link>

            <Link
              to="/foods"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-2xl">
                🥗
              </div>

              <h3 className="mt-5 font-semibold text-slate-900">
                Food Database
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Explore foods and their calories, protein,
                carbohydrates, fats, and fiber.
              </p>

              <span className="mt-4 inline-block text-sm font-semibold text-emerald-600">
                Explore foods →
              </span>
            </Link>

          </div>
        </section>

        {/* =====================================================
            PROFILE SUMMARY
        ===================================================== */}

        {profile && (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Your Nutrition Profile
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current information used to personalize your
                  nutrition calculations.
                </p>
              </div>

              <Link
                to="/nutrition-profile"
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Edit profile →
              </Link>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-400">
                  Age
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {profile.age} years
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-400">
                  Weight
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {profile.weight_kg} kg
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-400">
                  Height
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {profile.height_cm} cm
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-400">
                  Activity
                </p>
                <p className="mt-1 font-semibold capitalize text-slate-900">
                  {profile.activity_level}
                </p>
              </div>
            </div>
          </section>
        )}

      </div>
    </main>
  );
}

export default Dashboard;