import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="text-center">
        <p className="text-7xl font-extrabold text-emerald-500">
          404
        </p>

        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          Page not found
        </h1>

        <p className="mt-3 text-slate-600">
          The page you're looking for doesn't exist.
        </p>

        <Link
          to="/"
          className="mt-8 inline-block rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}

export default NotFound;