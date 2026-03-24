import Link from "next/link";
import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  title: string;
  description?: string;
};

export default function PageShell({
  children,
  title,
}: PageShellProps) {
  return (
    <main className="relative flex min-h-screen flex-1 items-start justify-center overflow-hidden px-6 py-10 selection:bg-rose-200 selection:text-rose-900">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,241,242,0.95)_0%,rgba(255,247,237,0.88)_22%,rgba(255,251,235,0.86)_40%,rgba(239,246,255,0.84)_58%,rgba(250,245,255,0.88)_78%,rgba(254,242,242,0.94)_100%)] bg-[length:220%_220%] animate-hero-gradient" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[8%] top-[-12%] h-72 w-72 rounded-full bg-rose-200/35 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute -right-[10%] bottom-[-12%] h-72 w-72 rounded-full bg-amber-200/35 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
        <div className="absolute left-[56%] top-[16%] h-52 w-52 rounded-full bg-sky-200/25 blur-3xl sm:h-80 sm:w-80" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8">
        <header className="space-y-3">
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
        </header>
        {children}
      </div>
    </main>
  );
}
