import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NutritionProfile from "./pages/NutritionProfile";
import MealPlanner from "./pages/MealPlanner";
import FoodDatabase from "./pages/FoodDatabase";
import NotFound from "./pages/NotFound";

// ==========================================================
// PROTECTED ROUTE
// ==========================================================

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Wait until authentication state is restored
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />

          <p className="text-sm font-medium text-slate-600">
            Loading NutriFlow...
          </p>
        </div>
      </div>
    );
  }

  // User is not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// ==========================================================
// APPLICATION ROUTES
// ==========================================================

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* ==================================================
          MAIN LAYOUT
      ================================================== */}

      <Route element={<MainLayout />}>
        {/* ==================================================
            HOME
        ================================================== */}

        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Home />
            )
          }
        />

        {/* ==================================================
            LOGIN
        ================================================== */}

        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          }
        />

        {/* ==================================================
            REGISTER
        ================================================== */}

        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register />
            )
          }
        />

        {/* ==================================================
            DASHBOARD
        ================================================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            NUTRITION PROFILE
        ================================================== */}

        <Route
          path="/nutrition-profile"
          element={
            <ProtectedRoute>
              <NutritionProfile />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            AI MEAL PLANNER
        ================================================== */}

        <Route
          path="/meal-planner"
          element={
            <ProtectedRoute>
              <MealPlanner />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            FOOD DATABASE
        ================================================== */}

        <Route
          path="/foods"
          element={
            <ProtectedRoute>
              <FoodDatabase />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            404
        ================================================== */}

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

// ==========================================================
// APPLICATION
// ==========================================================

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;