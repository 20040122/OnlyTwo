import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  title: string;
  description?: string;
};

export default function PageShell({
  children,
  title,
  description,
}: PageShellProps) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-zinc-600">{description}</p>
        ) : null}
      </header>
      {children}
    </main>
  );
}
