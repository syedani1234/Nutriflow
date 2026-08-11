import api from "./api";

// ==========================================================
// REGISTER
// ==========================================================

export async function registerUser(userData) {
  const response = await api.post("/auth/register", {
    full_name: userData.full_name,
    email: userData.email,
    password: userData.password,
  });

  return response.data;
}

// ==========================================================
// LOGIN
// ==========================================================

export async function loginUser(email, password) {
  const formData = new URLSearchParams();

  formData.append("username", email);
  formData.append("password", password);

  const response = await api.post("/auth/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const data = response.data;

  if (data.access_token) {
    localStorage.setItem("nutriflow_token", data.access_token);
  }

  return data;
}

// ==========================================================
// CURRENT USER
// ==========================================================

export async function getCurrentUser() {
  const response = await api.get("/auth/me");
  return response.data;
}

// ==========================================================
// LOGOUT
// ==========================================================

export function logoutUser() {
  localStorage.removeItem("nutriflow_token");
}

// ==========================================================
// CHECK AUTHENTICATION
// ==========================================================

export function isAuthenticated() {
  return Boolean(localStorage.getItem("nutriflow_token"));
}