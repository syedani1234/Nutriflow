import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import Button from "../components/Button";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      // ==========================================================
      // LOGIN
      // ==========================================================

      const response = await loginUser(email, password);

      console.log("LOGIN RESPONSE:", response);

      // ==========================================================
      // SAVE ACCESS TOKEN
      // ==========================================================

      if (response?.access_token) {
        localStorage.setItem("access_token", response.access_token);
      }

      // ==========================================================
      // SAVE USER DATA
      // ==========================================================

      if (response?.user) {
        localStorage.setItem(
          "nutriflow_user",
          JSON.stringify(response.user)
        );
      }

      // ==========================================================
      // SUCCESS
      // ==========================================================

      toast.success("Login successful!");

      // Give localStorage a moment to update before navigation.
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Login error:", error);

      const detail = error?.response?.data?.detail;

      let message = "Unable to login. Please check your email and password.";

      if (typeof detail === "string") {
        message = detail;
      } else if (Array.isArray(detail)) {
        message =
          detail[0]?.msg ||
          "Please check your login information and try again.";
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">

        {/* ======================================================
            LOGO
        ====================================================== */}

        <div className="mb-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-2xl font-extrabold text-slate-900"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
              N
            </span>

            <span>
              Nutri<span className="text-emerald-500">Flow</span>
            </span>
          </Link>

          <h1 className="mt-8 text-3xl font-extrabold text-slate-900">
            Welcome back
          </h1>

          <p className="mt-2 text-slate-500">
            Sign in to continue your nutrition journey.
          </p>
        </div>

        {/* ======================================================
            LOGIN CARD
        ====================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            {/* Password */}

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            {/* Submit */}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Register */}

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-emerald-600 transition hover:text-emerald-700"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}