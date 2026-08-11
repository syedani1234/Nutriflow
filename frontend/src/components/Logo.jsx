import { Link } from "react-router-dom";

function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2"
      aria-label="NutriFlow home"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-lg font-extrabold text-white shadow-sm">
        N
      </div>

      <span className="text-xl font-extrabold tracking-tight text-slate-900">
        Nutri<span className="text-emerald-500">Flow</span>
      </span>
    </Link>
  );
}

export default Logo;