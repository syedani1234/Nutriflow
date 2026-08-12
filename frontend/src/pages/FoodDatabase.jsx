import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  listFoods,
  searchFoods,
  addFood,
  updateFood,
  deleteFood,
} from "../services/foodApi";

const EMPTY_FORM = {
  name: "",
  category: "",
  description: "",
  serving_size: 100,
  serving_unit: "g",
  calories: 0,
  protein: 0,
  carbohydrates: 0,
  fat: 0,
  fiber: 0,
};

const CATEGORIES = [
  "Fruits",
  "Vegetables",
  "Protein",
  "Grains",
  "Dairy",
  "Snacks",
  "Beverages",
];

export default function FoodDatabase() {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  // ==========================================================
  // LOAD FOODS
  // ==========================================================

  async function loadFoods() {
    try {
      setLoading(true);

      const data = await listFoods({
        skip: 0,
        limit: 100,
        category: category || undefined,
      });

      setFoods(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load foods:", error);

      toast.error(
        error?.response?.data?.detail ||
          "Unable to load the food database."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFoods();
  }, [category]);

  // ==========================================================
  // SEARCH
  // ==========================================================

  async function handleSearch(event) {
    event.preventDefault();

    const query = search.trim();

    if (!query) {
      await loadFoods();
      return;
    }

    try {
      setSearching(true);

      const data = await searchFoods({
        q: query,
        skip: 0,
        limit: 100,
      });

      setFoods(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Food search failed:", error);

      toast.error(
        error?.response?.data?.detail ||
          "Unable to search foods."
      );
    } finally {
      setSearching(false);
    }
  }

  // ==========================================================
  // OPEN ADD MODAL
  // ==========================================================

  function openAddModal() {
    setEditingFood(null);
    setFormData({ ...EMPTY_FORM });
    setShowModal(true);
  }

  // ==========================================================
  // OPEN EDIT MODAL
  // ==========================================================

  function openEditModal(food) {
    setEditingFood(food);

    setFormData({
      name: food.name || "",
      category: food.category || "",
      description: food.description || "",
      serving_size: food.serving_size ?? 100,
      serving_unit: food.serving_unit || "g",
      calories: food.calories ?? 0,
      protein: food.protein ?? 0,
      carbohydrates: food.carbohydrates ?? 0,
      fat: food.fat ?? 0,
      fiber: food.fiber ?? 0,
    });

    setShowModal(true);
  }

  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // ==========================================================
  // SAVE FOOD
  // ==========================================================

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Food name is required.");
      return;
    }

    if (Number(formData.serving_size) <= 0) {
      toast.error("Serving size must be greater than zero.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: formData.name.trim(),
        category: formData.category || null,
        description: formData.description.trim() || null,
        serving_size: Number(formData.serving_size),
        serving_unit: formData.serving_unit.trim(),
        calories: Number(formData.calories),
        protein: Number(formData.protein),
        carbohydrates: Number(formData.carbohydrates),
        fat: Number(formData.fat),
        fiber: Number(formData.fiber),
      };

      if (editingFood) {
        await updateFood(editingFood.id, payload);

        toast.success("Food updated successfully.");
      } else {
        await addFood(payload);

        toast.success("Food added successfully.");
      }

      setShowModal(false);
      setEditingFood(null);
      setFormData({ ...EMPTY_FORM });

      await loadFoods();
    } catch (error) {
      console.error("Failed to save food:", error);

      toast.error(
        error?.response?.data?.detail ||
          "Unable to save food."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================================
  // DELETE FOOD
  // ==========================================================

  async function handleDelete(food) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${food.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(food.id);

      await deleteFood(food.id);

      toast.success("Food deleted successfully.");

      setFoods((previous) =>
        previous.filter((item) => item.id !== food.id)
      );
    } catch (error) {
      console.error("Failed to delete food:", error);

      toast.error(
        error?.response?.data?.detail ||
          "Unable to delete food."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  function closeModal() {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingFood(null);
    setFormData({ ...EMPTY_FORM });
  }

  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  async function clearFilters() {
    setSearch("");
    setCategory("");

    try {
      setLoading(true);

      const data = await listFoods({
        skip: 0,
        limit: 100,
      });

      setFoods(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to clear filters:", error);

      toast.error(
        error?.response?.data?.detail ||
          "Unable to load foods."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-600">
                NutriFlow
              </p>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Food Database
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Explore nutritional information and manage
                foods available to your meal planner.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">

              <Link
                to="/meal-planner"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-600"
              >
                Create Meal Plan
              </Link>

              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600"
              >
                + Add Food
              </button>

            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ====================================================
            SEARCH / FILTER
        ==================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4 lg:flex-row">

            <form
              onSubmit={handleSearch}
              className="flex flex-1 gap-3"
            >

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search foods..."
                className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />

              <button
                type="submit"
                disabled={searching}
                className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {searching ? "Searching..." : "Search"}
              </button>

            </form>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 lg:w-56"
            >
              <option value="">All categories</option>

              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

          </div>
        </section>

        {/* ====================================================
            RESULTS HEADER
        ==================================================== */}

        <div className="mt-8 flex items-center justify-between">

          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Available Foods
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {foods.length} food
              {foods.length !== 1 ? "s" : ""} found
            </p>
          </div>

        </div>

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading && (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
              >

                <div className="h-5 w-32 rounded bg-slate-200" />

                <div className="mt-3 h-4 w-20 rounded bg-slate-100" />

                <div className="mt-6 h-20 rounded-xl bg-slate-100" />

                <div className="mt-4 h-24 rounded-xl bg-slate-100" />

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="h-16 rounded-xl bg-slate-100" />
                  <div className="h-16 rounded-xl bg-slate-100" />
                  <div className="h-16 rounded-xl bg-slate-100" />
                  <div className="h-16 rounded-xl bg-slate-100" />
                </div>

                <div className="mt-5 h-10 rounded-xl bg-slate-100" />
              </div>
            ))}

          </div>
        )}

        {/* ====================================================
            EMPTY STATE
        ==================================================== */}

        {!loading && foods.length === 0 && (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
              🥗
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              No foods found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Try another search term or select a different
              category.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Clear filters
            </button>

          </div>
        )}

        {/* ====================================================
            FOOD CARDS
        ==================================================== */}

        {!loading && foods.length > 0 && (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {foods.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                onEdit={openEditModal}
                onDelete={handleDelete}
                deleting={deletingId === food.id}
              />
            ))}

          </div>
        )}

      </main>

      {/* ======================================================
          ADD / EDIT MODAL
      ====================================================== */}

      {showModal && (
        <FoodModal
          editingFood={editingFood}
          formData={formData}
          saving={saving}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}

    </div>
  );
}

// ==========================================================
// FOOD CARD
// ==========================================================

function FoodCard({
  food,
  onEdit,
  onDelete,
  deleting,
}) {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">

      {/* ====================================================
          CARD HEADER
      ==================================================== */}

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">

          <h3 className="truncate text-lg font-extrabold text-slate-900">
            {food.name}
          </h3>

          {food.category && (
            <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {food.category}
            </span>
          )}

        </div>

        <span className="shrink-0 text-2xl">
          🥗
        </span>

      </div>

      {/* ====================================================
          SERVING
      ==================================================== */}

      <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3">

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Serving
        </p>

        <p className="mt-1 text-sm font-bold text-slate-700">
          {food.serving_size} {food.serving_unit}
        </p>

      </div>

      {/* ====================================================
          CALORIES
      ==================================================== */}

      <div className="mt-4 rounded-xl bg-emerald-50 p-4">

        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
          Calories
        </p>

        <div className="mt-1 flex items-end gap-1">

          <span className="text-3xl font-extrabold text-slate-900">
            {Math.round(food.calories || 0)}
          </span>

          <span className="pb-1 text-sm font-medium text-slate-500">
            kcal
          </span>

        </div>

      </div>

      {/* ====================================================
          MACROS
      ==================================================== */}

      <div className="mt-4 grid grid-cols-2 gap-3">

        <Macro
          label="Protein"
          value={food.protein}
        />

        <Macro
          label="Carbs"
          value={food.carbohydrates}
        />

        <Macro
          label="Fat"
          value={food.fat}
        />

        <Macro
          label="Fiber"
          value={food.fiber}
        />

      </div>

      {/* ====================================================
          DESCRIPTION
      ==================================================== */}

      {food.description && (
        <p className="mt-4 line-clamp-2 text-sm leading-5 text-slate-500">
          {food.description}
        </p>
      )}

      {/* ====================================================
          VIEW DETAILS
      ==================================================== */}

      <Link
        to={`/foods/${food.id}`}
        className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
      >
        View Details →
      </Link>

      {/* ====================================================
          ACTIONS
      ==================================================== */}

      <div className="mt-3 flex gap-2 border-t border-slate-100 pt-4">

        <button
          type="button"
          onClick={() => onEdit(food)}
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-600"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete(food)}
          disabled={deleting}
          className="flex-1 rounded-xl border border-red-100 px-3 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>

      </div>

    </article>
  );
}

// ==========================================================
// MACRO
// ==========================================================

function Macro({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3">

      <p className="text-xs font-semibold text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-base font-extrabold text-slate-800">
        {Math.round(value || 0)}g
      </p>

    </div>
  );
}

// ==========================================================
// ADD / EDIT FOOD MODAL
// ==========================================================

function FoodModal({
  editingFood,
  formData,
  saving,
  onChange,
  onSubmit,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">

      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

        {/* ==================================================
            MODAL HEADER
        ================================================== */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

          <div>

            <h2 className="text-xl font-extrabold text-slate-900">
              {editingFood
                ? "Edit Food"
                : "Add New Food"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {editingFood
                ? "Update the nutritional information."
                : "Add a food to the NutriFlow database."}
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-500 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>

        </div>

        {/* ==================================================
            FORM
        ================================================== */}

        <form
          onSubmit={onSubmit}
          className="space-y-6 p-6"
        >

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <div>

            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
              Basic Information
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">

              <Field
                label="Food Name"
                name="name"
                value={formData.name}
                onChange={onChange}
                placeholder="e.g. Chicken Breast"
                required
              />

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={onChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="">
                    Select category
                  </option>

                  {CATEGORIES.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>

              </div>

            </div>

            <div className="mt-4">

              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={onChange}
                rows={3}
                placeholder="Short description of this food..."
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />

            </div>

          </div>

          {/* =================================================
              SERVING INFORMATION
          ================================================= */}

          <div>

            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
              Serving Information
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">

              <Field
                label="Serving Size"
                name="serving_size"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.serving_size}
                onChange={onChange}
                required
              />

              <Field
                label="Serving Unit"
                name="serving_unit"
                value={formData.serving_unit}
                onChange={onChange}
                placeholder="g, ml, piece..."
                required
              />

            </div>

          </div>

          {/* =================================================
              NUTRITION
          ================================================= */}

          <div>

            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
              Nutrition per Serving
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">

              <Field
                label="Calories (kcal)"
                name="calories"
                type="number"
                min="0"
                step="0.01"
                value={formData.calories}
                onChange={onChange}
              />

              <Field
                label="Protein (g)"
                name="protein"
                type="number"
                min="0"
                step="0.01"
                value={formData.protein}
                onChange={onChange}
              />

              <Field
                label="Carbohydrates (g)"
                name="carbohydrates"
                type="number"
                min="0"
                step="0.01"
                value={formData.carbohydrates}
                onChange={onChange}
              />

              <Field
                label="Fat (g)"
                name="fat"
                type="number"
                min="0"
                step="0.01"
                value={formData.fat}
                onChange={onChange}
              />

              <Field
                label="Fiber (g)"
                name="fiber"
                type="number"
                min="0"
                step="0.01"
                value={formData.fiber}
                onChange={onChange}
              />

            </div>

          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingFood
                ? "Update Food"
                : "Add Food"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

// ==========================================================
// FIELD
// ==========================================================

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  min,
  step,
}) {
  return (
    <div>

      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      />

    </div>
  );
}