"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 px-6 py-16 selection:bg-rose-200 selection:text-rose-900">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,241,242,0.92)_0%,rgba(255,247,237,0.88)_22%,rgba(255,251,235,0.86)_40%,rgba(239,246,255,0.82)_58%,rgba(250,245,255,0.86)_76%,rgba(254,242,242,0.92)_100%)] bg-[length:220%_220%] animate-hero-gradient" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[20%] h-[50%] w-[50%] rounded-full bg-rose-200/30 blur-3xl" />
        <div className="absolute -right-[10%] top-[60%] h-[40%] w-[40%] rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute right-[10%] top-[20%] h-[30%] w-[30%] rounded-full bg-pink-200/20 blur-3xl" />
      </div>

      <main className="relative z-10 w-full max-w-4xl rounded-[2.5rem] border border-white/60 bg-white/60 p-10 shadow-2xl shadow-rose-900/5 backdrop-blur-2xl sm:p-14">
        <div className="flex flex-col items-center gap-10 text-center">
          <div className="relative flex items-center justify-center gap-6 px-6 py-2">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-400 to-orange-400 text-white shadow-xl shadow-rose-500/30">
              <svg
                aria-hidden="true"
                className="h-10 w-10 text-white/90"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35 10.55 20C5.4 15.24 2 12.09 2 8.25 2 5.1 4.42 2.75 7.5 2.75c1.74 0 3.41.81 4.5 2.09 1.09-1.28 2.76-2.09 4.5-2.09 3.08 0 5.5 2.35 5.5 5.5 0 3.84-3.4 6.99-8.55 11.76L12 21.35Z" />
              </svg>
            </div>

            <div className="absolute left-1/2 top-1/2 h-px w-16 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-rose-300 via-orange-300 to-sky-200" />

            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-300 to-cyan-200 text-white shadow-xl shadow-sky-400/30">
              <svg
                aria-hidden="true"
                className="h-10 w-10 text-white/90"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35 10.55 20C5.4 15.24 2 12.09 2 8.25 2 5.1 4.42 2.75 7.5 2.75c1.74 0 3.41.81 4.5 2.09 1.09-1.28 2.76-2.09 4.5-2.09 3.08 0 5.5 2.35 5.5 5.5 0 3.84-3.4 6.99-8.55 11.76L12 21.35Z" />
              </svg>
            </div>
          </div>

          <div className="max-w-3xl space-y-6">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-rose-500/80">
              Only Two
            </p>
            <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
              <span className="block overflow-hidden pb-1">
                <span className="animate-text-reveal-left-to-right inline-block motion-reduce:animate-none">
                  一个只属于两个人的
                </span>
              </span>
              <span className="block overflow-hidden pb-1">
                <span
                  className="animate-text-reveal-left-to-right inline-block bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent motion-reduce:animate-none"
                  style={{ animationDelay: "320ms" }}
                >
                  私密聊天空间
                </span>
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-8 text-zinc-600 sm:text-lg">
              进入应用后，你们只会拥有一段专属关系、一个固定会话，以及一条足够简单直接的沟通路径。
            </p>
          </div>

          <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
            <Link
              className="flex h-12 w-full items-center justify-center rounded-full border border-rose-200/80 bg-rose-200 px-6 text-rose-950 shadow-[0_0_0_rgba(251,113,133,0.0),0_0_24px_rgba(251,113,133,0.45)] transition-[background-color,box-shadow,transform] duration-300 animate-pulse-rose hover:-translate-y-0.5 hover:bg-rose-300 hover:shadow-[0_0_0_rgba(251,113,133,0.0),0_0_38px_rgba(244,114,182,0.65)] md:w-[158px]"
              href="/signup"
            >
              注册
            </Link>
            <Link
              className="flex h-12 w-full items-center justify-center rounded-full border border-sky-200/90 bg-sky-100 px-6 text-sky-950 shadow-[0_0_0_rgba(125,211,252,0.0),0_0_24px_rgba(125,211,252,0.42)] transition-[background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-cyan-200 hover:shadow-[0_0_0_rgba(125,211,252,0.0),0_0_38px_rgba(34,211,238,0.55)] md:w-[158px]"
              href="/login"
            >
              登录
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
