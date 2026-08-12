import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  getNutritionProfile,
  createNutritionProfile,
  updateNutritionProfile,
  calculateNutrition,
} from "../services/nutritionApi";

import Button from "../components/Button";

export default function NutritionProfile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  const [nutrition, setNutrition] = useState(null);

  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
    activity_level: "",
    goal: "",
    dietary_preference: "",
    allergies: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);

      const data = await getNutritionProfile();

      if (data) {
        setHasProfile(true);

        setFormData({
          age: data.age ?? "",
          gender: data.gender ?? "",
          height_cm: data.height_cm ?? "",
          weight_kg: data.weight_kg ?? "",
          activity_level: data.activity_level ?? "",
          goal: data.goal ?? "",
          dietary_preference: data.dietary_preference ?? "",
          allergies: data.allergies ?? "",
        });
      }
    } catch (error) {
      // A missing profile is expected for a new user.
      if (error.response?.status !== 404) {
        console.error("Profile loading error:", error);
        toast.error("Unable to load your nutrition profile.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      !formData.age ||
      !formData.gender ||
      !formData.height_cm ||
      !formData.weight_kg ||
      !formData.activity_level ||
      !formData.goal
    ) {
      toast.error("Please complete all required fields.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        age: Number(formData.age),
        gender: formData.gender,
        height_cm: Number(formData.height_cm),
        weight_kg: Number(formData.weight_kg),
        activity_level: formData.activity_level,
        goal: formData.goal,
        dietary_preference:
          formData.dietary_preference || null,
        allergies: formData.allergies || null,
      };

      let response;

      if (hasProfile) {
        response = await updateNutritionProfile(payload);
      } else {
        response = await createNutritionProfile(payload);
        setHasProfile(true);
      }

      setFormData({
        age: response.age ?? "",
        gender: response.gender ?? "",
        height_cm: response.height_cm ?? "",
        weight_kg: response.weight_kg ?? "",
        activity_level: response.activity_level ?? "",
        goal: response.goal ?? "",
        dietary_preference:
          response.dietary_preference ?? "",
        allergies: response.allergies ?? "",
      });

      toast.success(
        hasProfile
          ? "Nutrition profile updated!"
          : "Nutrition profile created!"
      );
    } catch (error) {
      console.error("Profile save error:", error);

      const message =
        error.response?.data?.detail ||
        "Unable to save your nutrition profile.";

      toast.error(
        typeof message === "string"
          ? message
          : "Unable to save your nutrition profile."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleCalculate() {
    try {
      setCalculating(true);

      const data = await calculateNutrition();

      setNutrition(data);

      toast.success("Nutrition targets calculated!");
    } catch (error) {
      console.error("Nutrition calculation error:", error);

      const message =
        error.response?.data?.detail ||
        "Please complete your nutrition profile first.";

      toast.error(
        typeof message === "string"
          ? message
          : "Unable to calculate nutrition targets."
      );
    } finally {
      setCalculating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-72 rounded-xl bg-slate-200" />
            <div className="h-6 w-96 rounded-lg bg-slate-200" />
            <div className="h-[500px] rounded-3xl bg-white shadow-sm" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mb-5 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
          >
            ← Back to Dashboard
          </button>

          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">
              Your Nutrition Profile
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Personalize your nutrition
            </h1>

            <p className="mt-2 max-w-2xl text-slate-500">
              Tell NutriFlow about yourself so we can calculate
              personalized nutrition targets and build better meal plans.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

          {/* Profile Form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-7">

              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Basic Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Help us understand your body and current lifestyle.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                {/* Age */}
                <div>
                  <label
                    htmlFor="age"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Age
                  </label>

                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="13"
                    max="100"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="e.g. 22"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label
                    htmlFor="gender"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Gender
                  </label>

                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                {/* Height */}
                <div>
                  <label
                    htmlFor="height_cm"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Height (cm)
                  </label>

                  <input
                    id="height_cm"
                    name="height_cm"
                    type="number"
                    min="50"
                    max="250"
                    step="0.1"
                    value={formData.height_cm}
                    onChange={handleChange}
                    placeholder="e.g. 175"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label
                    htmlFor="weight_kg"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Weight (kg)
                  </label>

                  <input
                    id="weight_kg"
                    name="weight_kg"
                    type="number"
                    min="20"
                    max="300"
                    step="0.1"
                    value={formData.weight_kg}
                    onChange={handleChange}
                    placeholder="e.g. 70"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                  />
                </div>
              </div>

              {/* Lifestyle */}
              <div className="border-t border-slate-100 pt-7">
                <h2 className="text-xl font-bold text-slate-900">
                  Lifestyle & Goals
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  These choices help NutriFlow determine your daily targets.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                {/* Activity */}
                <div>
                  <label
                    htmlFor="activity_level"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Activity Level
                  </label>

                  <select
                    id="activity_level"
                    name="activity_level"
                    value={formData.activity_level}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                  >
                    <option value="">Select activity level</option>
                    <option value="sedentary">
                      Sedentary
                    </option>
                    <option value="light">
                      Lightly Active
                    </option>
                    <option value="moderate">
                      Moderately Active
                    </option>
                    <option value="active">
                      Very Active
                    </option>
                    <option value="very_active">
                      Extremely Active
                    </option>
                  </select>
                </div>

                {/* Goal */}
                <div>
                  <label
                    htmlFor="goal"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Nutrition Goal
                  </label>

                  <select
                    id="goal"
                    name="goal"
                    value={formData.goal}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                  >
                    <option value="">Select your goal</option>
                    <option value="weight_loss">
                      Weight Loss
                    </option>
                    <option value="maintenance">
                      Maintain Weight
                    </option>
                    <option value="weight_gain">
                      Weight Gain
                    </option>
                    <option value="muscle_gain">
                      Muscle Gain
                    </option>
                  </select>
                </div>

                {/* Dietary Preference */}
                <div>
                  <label
                    htmlFor="dietary_preference"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Dietary Preference
                  </label>

                  <select
                    id="dietary_preference"
                    name="dietary_preference"
                    value={formData.dietary_preference}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                  >
                    <option value="">No specific preference</option>
                    <option value="vegetarian">
                      Vegetarian
                    </option>
                    <option value="vegan">
                      Vegan
                    </option>
                    <option value="pescatarian">
                      Pescatarian
                    </option>
                    <option value="halal">
                      Halal
                    </option>
                    <option value="low_carb">
                      Low Carb
                    </option>
                    <option value="high_protein">
                      High Protein
                    </option>
                  </select>
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
                    type="text"
                    value={formData.allergies}
                    onChange={handleChange}
                    placeholder="e.g. peanuts, dairy"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3 border-t border-slate-100 pt-7 sm:flex-row">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={saving}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving
                    ? "Saving..."
                    : hasProfile
                      ? "Update Profile"
                      : "Save Profile"}
                </Button>

                {hasProfile && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    loading={calculating}
                    disabled={calculating}
                    onClick={handleCalculate}
                    className="flex-1"
                  >
                    {calculating
                      ? "Calculating..."
                      : "Calculate My Nutrition"}
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Nutrition Results */}
          <div className="space-y-5">

            <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 p-6 text-white shadow-lg">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl">
                🥗
              </div>

              <h2 className="text-xl font-bold">
                Your Nutrition Targets
              </h2>

              <p className="mt-2 text-sm leading-6 text-emerald-50">
                Save your profile and calculate your personalized
                daily nutrition requirements.
              </p>
            </div>

            {nutrition ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-5 text-lg font-bold text-slate-900">
                  Daily Targets
                </h3>

                <div className="space-y-4">

                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                      Calories
                    </p>

                    <p className="mt-1 text-2xl font-extrabold text-slate-900">
                      {Math.round(nutrition.target_calories)} kcal
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-slate-500">
                        BMR
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {Math.round(nutrition.bmr)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-slate-500">
                        TDEE
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {Math.round(nutrition.tdee)}
                      </p>
                    </div>

                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <p className="mb-3 text-sm font-bold text-slate-900">
                      Macro Targets
                    </p>

                    <div className="space-y-3">

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                          Protein
                        </span>

                        <span className="font-bold text-slate-900">
                          {Math.round(
                            nutrition.macros?.protein_g ?? 0
                          )}g
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                          Carbohydrates
                        </span>

                        <span className="font-bold text-slate-900">
                          {Math.round(
                            nutrition.macros?.carbohydrates_g ?? 0
                          )}g
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                          Fat
                        </span>

                        <span className="font-bold text-slate-900">
                          {Math.round(
                            nutrition.macros?.fat_g ?? 0
                          )}g
                        </span>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                  📊
                </div>

                <h3 className="font-bold text-slate-900">
                  No targets yet
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Complete your profile and calculate your
                  personalized nutrition targets.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}