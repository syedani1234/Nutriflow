import api from "./api";

// ==========================================================
// GET NUTRITION PROFILE
// ==========================================================

export async function getNutritionProfile() {
  const response = await api.get("/nutrition/profile");

  return response.data;
}

// ==========================================================
// CREATE NUTRITION PROFILE
// ==========================================================

export async function createNutritionProfile(profileData) {
  const response = await api.post(
    "/nutrition/profile",
    profileData
  );

  return response.data;
}

// ==========================================================
// UPDATE NUTRITION PROFILE
// ==========================================================

export async function updateNutritionProfile(profileData) {
  const response = await api.put(
    "/nutrition/profile",
    profileData
  );

  return response.data;
}

// ==========================================================
// CALCULATE USER NUTRITION
// ==========================================================

export async function calculateNutrition() {
  const response = await api.get("/nutrition/calculate");

  return response.data;
}