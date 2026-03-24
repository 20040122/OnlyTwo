"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveProfile, type SaveProfileActionState } from "@/features/profile/actions";

const INITIAL_STATE: SaveProfileActionState = {
  message: "",
  status: "idle",
};

export default function OnboardingForm() {
  const [state, formAction, pending] = useActionState(saveProfile, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="nickname">
          昵称
        </label>
        <Input
          id="nickname"
          name="nickname"
          placeholder="给彼此起个专属昵称"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="avatarUrl">
          头像 URL（可选）
        </label>
        <Input
          id="avatarUrl"
          name="avatarUrl"
          placeholder="https://example.com/avatar.png（可稍后再补）"
        />
      </div>

      {state.message ? (
        <p
          aria-live="polite"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {state.message}
        </p>
      ) : null}

      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "保存中..." : "保存资料"}
      </Button>
    </form>
  );
}
