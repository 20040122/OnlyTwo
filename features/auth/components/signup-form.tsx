"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signup, type AuthActionState } from "@/features/auth/actions";

const INITIAL_STATE: AuthActionState = {
  message: "",
  status: "idle",
};

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, INITIAL_STATE);
  const submitLabel = pending ? "注册中..." : "注册";

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2.5">
        <label className="text-sm font-medium text-zinc-700/90" htmlFor="email">
          邮箱
        </label>
        <Input
          className="h-13 rounded-[1.15rem] border-white/80 bg-white/72 px-4 text-[15px] text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_14px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl placeholder:text-zinc-400 focus:border-rose-200 focus:bg-white focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_0_0_4px_rgba(251,113,133,0.08),0_18px_40px_rgba(15,23,42,0.05)]"
          id="email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
      </div>
      <div className="space-y-2.5">
        <label className="text-sm font-medium text-zinc-700/90" htmlFor="password">
          密码
        </label>
        <Input
          className="h-13 rounded-[1.15rem] border-white/80 bg-white/72 px-4 text-[15px] text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_14px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl placeholder:text-zinc-400 focus:border-rose-200 focus:bg-white focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_0_0_4px_rgba(251,113,133,0.08),0_18px_40px_rgba(15,23,42,0.05)]"
          id="password"
          name="password"
          placeholder="创建一个密码"
          minLength={6}
          required
          type="password"
        />
      </div>

      {state.message ? (
        <p
          aria-live="polite"
          className={`rounded-2xl px-4 py-3 text-sm ${
            state.status === "error"
              ? "border border-rose-200 bg-rose-50 text-rose-700"
              : "border border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <Button
        className="group h-13 w-full rounded-full border border-rose-200/80 bg-rose-200 text-[15px] font-semibold text-rose-950 shadow-sm transition-[background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-rose-300 hover:shadow-md"
        disabled={pending}
        type="submit"
      >
        <span className="flex items-center justify-center">
          {Array.from(submitLabel).map((character, index) => (
            <span
              className="inline-block whitespace-pre transition-[color,transform] duration-300 ease-out group-hover:-translate-y-0.5 group-hover:text-rose-700 motion-reduce:transform-none motion-reduce:transition-none"
              key={`${character}-${index}`}
              style={{ transitionDelay: `${index * 55}ms` }}
            >
              {character}
            </span>
          ))}
        </span>
      </Button>
    </form>
  );
}
