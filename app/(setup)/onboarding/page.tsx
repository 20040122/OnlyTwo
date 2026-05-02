import Link from "next/link";

import OnboardingForm from "@/features/profile/components/onboarding-form";

export default function OnboardingPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-14 selection:bg-rose-200 selection:text-rose-900">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,241,242,0.95)_0%,rgba(255,247,237,0.88)_22%,rgba(255,251,235,0.86)_40%,rgba(239,246,255,0.84)_58%,rgba(250,245,255,0.88)_78%,rgba(254,242,242,0.94)_100%)] bg-[length:220%_220%] animate-hero-gradient" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[8%] top-[-12%] h-72 w-72 rounded-full bg-rose-200/35 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute -right-[10%] bottom-[-12%] h-72 w-72 rounded-full bg-amber-200/35 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
        <div className="absolute left-[56%] top-[16%] h-52 w-52 rounded-full bg-sky-200/25 blur-3xl sm:h-80 sm:w-80" />
      </div>

      <section className="relative z-10 w-full max-w-md">
        <div className="relative overflow-hidden rounded-[2.15rem] border border-white/70 bg-white/66 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl sm:p-9">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/95 to-transparent" />
          <div className="pointer-events-none absolute -top-14 right-6 h-32 w-32 rounded-full bg-amber-200/28 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-28 w-28 rounded-full bg-rose-200/22 blur-3xl" />

          <div className="relative space-y-8">
            <div className="space-y-3">
              <Link
                className="inline-flex items-center gap-3 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm font-medium text-zinc-700 shadow-[0_12px_30px_rgba(255,255,255,0.3)] backdrop-blur-xl transition hover:bg-white/85"
                href="/"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-orange-300 text-white shadow-lg shadow-rose-300/50">
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35 10.55 20C5.4 15.24 2 12.09 2 8.25 2 5.1 4.42 2.75 7.5 2.75c1.74 0 3.41.81 4.5 2.09 1.09-1.28 2.76-2.09 4.5-2.09 3.08 0 5.5 2.35 5.5 5.5 0 3.84-3.4 6.99-8.55 11.76L12 21.35Z" />
                  </svg>
                </span>
                Only Two
              </Link>

              <div className="space-y-3">
                <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">
                  完善资料
                </h2>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(255,255,255,0.62))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_40px_rgba(15,23,42,0.05)] sm:p-6">
              <OnboardingForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
