import { useState } from "react";
import { Link } from "react-router-dom";

import Logo from "./Logo";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm font-medium text-slate-600 transition hover:text-emerald-600"
          >
            Features
          </a>

          <a
            href="#how-it-works"
            className="text-sm font-medium text-slate-600 transition hover:text-emerald-600"
          >
            How It Works
          </a>

          <a
            href="#about"
            className="text-sm font-medium text-slate-600 transition hover:text-emerald-600"
          >
            About
          </a>
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Sign In
          </Link>

          <Link
            to="/register"
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((current) => !current)}
          className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-6 py-5 md:hidden">
          <div className="flex flex-col gap-2">
            <a
              href="#features"
              onClick={closeMobileMenu}
              className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              onClick={closeMobileMenu}
              className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              How It Works
            </a>

            <a
              href="#about"
              onClick={closeMobileMenu}
              className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              About
            </a>

            <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-4">
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                onClick={closeMobileMenu}
                className="rounded-xl bg-emerald-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-600"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;