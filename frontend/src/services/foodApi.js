import api from "./api";

// ==========================================================
// GET ALL FOODS
// ==========================================================

export async function getFoods({
  skip = 0,
  limit = 20,
  category = null,
} = {}) {
  const params = {
    skip,
    limit,
  };

  if (category) {
    params.category = category;
  }

  const response = await api.get("/foods", {
    params,
  });

  return response.data;
}

// ==========================================================
// SEARCH FOODS
// ==========================================================

export async function searchFoods(
  query,
  {
    skip = 0,
    limit = 20,
  } = {}
) {
  const response = await api.get("/foods/search", {
    params: {
      q: query,
      skip,
      limit,
    },
  });

  return response.data;
}

// ==========================================================
// GET SINGLE FOOD
// ==========================================================

export async function getFood(foodId) {
  const response = await api.get(`/foods/${foodId}`);

  return response.data;
}

// ==========================================================
// ADD FOOD
// ==========================================================

export async function addFood(foodData) {
  const response = await api.post("/foods", foodData);

  return response.data;
}

// ==========================================================
// UPDATE FOOD
// ==========================================================

export async function updateFood(foodId, foodData) {
  const response = await api.put(`/foods/${foodId}`, foodData);

  return response.data;
}

// ==========================================================
// DELETE FOOD
// ==========================================================

export async function deleteFood(foodId) {
  const response = await api.delete(`/foods/${foodId}`);

  return response.data;
}