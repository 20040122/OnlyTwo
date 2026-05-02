import Link from "next/link";

import SignupForm from "@/features/auth/components/signup-form";

export default function SignupPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-14 selection:bg-rose-200 selection:text-rose-900">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,241,242,0.95)_0%,rgba(255,247,237,0.88)_22%,rgba(255,251,235,0.86)_40%,rgba(239,246,255,0.84)_58%,rgba(250,245,255,0.88)_78%,rgba(254,242,242,0.94)_100%)] bg-[length:220%_220%] animate-hero-gradient" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[8%] top-[-14%] h-72 w-72 rounded-full bg-rose-200/40 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute -right-[10%] bottom-[-10%] h-72 w-72 rounded-full bg-amber-200/40 blur-3xl sm:h-[26rem] sm:w-[26rem]" />
        <div className="absolute left-[58%] top-[18%] h-48 w-48 rounded-full bg-sky-200/30 blur-3xl sm:h-72 sm:w-72" />
      </div>

      <section className="relative z-10 w-full max-w-md">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/66 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl sm:p-9">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/95 to-transparent" />
          <div className="pointer-events-none absolute -top-14 right-6 h-32 w-32 rounded-full bg-amber-200/30 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-28 w-28 rounded-full bg-rose-200/25 blur-3xl" />

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
                  创建你的账号
                </h2>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(255,255,255,0.62))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_40px_rgba(15,23,42,0.05)] sm:p-6">
              <SignupForm />
            </div>

            <div className="flex flex-col gap-4 border-t border-white/70 pt-6 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
              <p>已有账号的话，可以直接返回登录。</p>
              <Link
                className="flex h-12 w-full items-center justify-center rounded-full border border-sky-200/90 bg-sky-100 px-6 text-sky-950 shadow-[0_0_0_rgba(125,211,252,0.0),0_0_24px_rgba(125,211,252,0.42)] transition-[background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-cyan-200 hover:shadow-[0_0_0_rgba(125,211,252,0.0),0_0_38px_rgba(34,211,238,0.55)] md:w-[158px]"
                href="/login"
              >
                前往登录
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
