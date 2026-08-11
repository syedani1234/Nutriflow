import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* =====================================================
          HERO
      ===================================================== */}

      <main>
        <section className="relative overflow-hidden bg-slate-50">
          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />

          <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
            {/* Hero Content */}

            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                <span className="text-sm font-semibold text-emerald-700">
                  AI-powered nutrition planning
                </span>
              </div>

              <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
                Your nutrition.
                <br />
                <span className="text-emerald-500">Simplified.</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                NutriFlow creates personalized meal plans based on your
                nutrition goals, calorie requirements, food preferences, and
                lifestyle.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="rounded-xl bg-emerald-500 px-6 py-3.5 text-center font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600"
                >
                  Create Your Plan
                </Link>

                <a
                  href="#how-it-works"
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  See How It Works
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
                <span>✓ Personalized plans</span>
                <span>✓ Macro tracking</span>
                <span>✓ AI recommendations</span>
              </div>
            </div>

            {/* Nutrition Preview */}

            <div className="relative mx-auto w-full max-w-lg">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Today's nutrition
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                      1,972 kcal
                    </h2>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
                    <span className="text-xl">🥗</span>
                  </div>
                </div>

                <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[92%] rounded-full bg-emerald-500" />
                </div>

                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>Daily target</span>
                  <span>2,000 kcal</span>
                </div>

                {/* Macro Cards */}

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Protein
                    </p>

                    <p className="mt-2 text-lg font-bold text-slate-900">
                      123g
                    </p>

                    <p className="mt-1 text-xs text-emerald-600">
                      Target 120g
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Carbs
                    </p>

                    <p className="mt-2 text-lg font-bold text-slate-900">
                      231g
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Target 220g
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Fat
                    </p>

                    <p className="mt-2 text-lg font-bold text-slate-900">
                      66g
                    </p>

                    <p className="mt-1 text-xs text-emerald-600">
                      Target 65g
                    </p>
                  </div>
                </div>

                {/* Meal Preview */}

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">
                      Today's meals
                    </h3>

                    <span className="text-xs font-medium text-emerald-600">
                      3 meals
                    </span>
                  </div>

                  <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                          🌅
                        </span>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            Breakfast
                          </p>

                          <p className="text-xs text-slate-500">
                            Oats, banana & milk
                          </p>
                        </div>
                      </div>

                      <span className="text-sm font-semibold text-slate-700">
                        844 kcal
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                          🥗
                        </span>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            Lunch
                          </p>

                          <p className="text-xs text-slate-500">
                            Chicken, vegetables & rice
                          </p>
                        </div>
                      </div>

                      <span className="text-sm font-semibold text-slate-700">
                        617 kcal
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                          🌙
                        </span>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            Dinner
                          </p>

                          <p className="text-xs text-slate-500">
                            Lentils, roti & yogurt
                          </p>
                        </div>
                      </div>

                      <span className="text-sm font-semibold text-slate-700">
                        511 kcal
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FEATURES
        ===================================================== */}

        <section id="features" className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-600">
                Everything you need
              </p>

              <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">
                Nutrition planning made easier
              </h2>

              <p className="mt-4 text-lg leading-8 text-slate-600">
                NutriFlow combines nutrition tracking with AI-powered meal
                planning to make healthy eating easier to manage.
              </p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon="🤖"
                title="AI Meal Planning"
                description="Generate personalized meal plans based on your calorie and macronutrient targets."
              />

              <FeatureCard
                icon="🎯"
                title="Personalized Goals"
                description="Set your nutrition goals and let NutriFlow build a plan around your requirements."
              />

              <FeatureCard
                icon="📊"
                title="Macro Tracking"
                description="Monitor calories, protein, carbohydrates, fat, and fiber throughout your plan."
              />

              <FeatureCard
                icon="🍎"
                title="Food Database"
                description="Build meals using foods and nutrition information stored in your NutriFlow database."
              />

              <FeatureCard
                icon="🔄"
                title="Flexible Portions"
                description="Adjust serving sizes while keeping track of how your daily nutrition changes."
              />

              <FeatureCard
                icon="💡"
                title="Smart Recommendations"
                description="Receive practical recommendations when your meal plan needs nutritional adjustments."
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}

        <section id="how-it-works" className="bg-slate-50 py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-600">
                Simple process
              </p>

              <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">
                How NutriFlow works
              </h2>

              <p className="mt-4 text-lg leading-8 text-slate-600">
                Get from your nutrition goals to a personalized meal plan in
                a few simple steps.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <StepCard
                number="01"
                title="Set your goals"
                description="Tell NutriFlow about your nutritional requirements, calorie target, and preferred goals."
              />

              <StepCard
                number="02"
                title="Generate your plan"
                description="Our AI meal planner creates meals using foods from your available nutrition database."
              />

              <StepCard
                number="03"
                title="Track and improve"
                description="Review your meals, macros, and recommendations and adjust your plan as needed."
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            ABOUT / CTA
        ===================================================== */}

        <section id="about" className="bg-white py-24">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl bg-slate-900 px-8 py-16 text-center shadow-xl sm:px-16">
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">
                Start your journey
              </p>

              <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                Make every meal count.
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Create a personalized nutrition plan and take control of your
                everyday eating with NutriFlow.
              </p>

              <Link
                to="/register"
                className="mt-8 inline-block rounded-xl bg-emerald-500 px-7 py-3.5 font-semibold text-white transition hover:bg-emerald-600"
              >
                Get Started with NutriFlow
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <p className="font-bold text-slate-900">
              Nutri<span className="text-emerald-500">Flow</span>
            </p>

            <p className="mt-1 text-sm text-slate-500">
              AI Nutrition & Meal Planner
            </p>
          </div>

          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} NutriFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({ icon, title, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/5">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   STEP CARD
========================================================= */

function StepCard({ number, title, description }) {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-8">
      <span className="text-sm font-extrabold tracking-widest text-emerald-500">
        {number}
      </span>

      <h3 className="mt-5 text-xl font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-600">
        {description}
      </p>
    </div>
  );
}

export default Home;