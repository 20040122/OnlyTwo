"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createInvite,
  type CreateInviteActionState,
} from "@/features/relationship/actions";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type AcceptState = {
  message: string;
  status: "idle" | "loading" | "error" | "success";
};

type InvitePanelProps = {
  currentUserId: string;
  currentInviteCode?: string;
  prefilledInviteCode?: string;
};

export default function InvitePanel({
  currentUserId,
  currentInviteCode: initialInviteCode,
  prefilledInviteCode,
}: InvitePanelProps) {
  const router = useRouter();
  const isAcceptMode = Boolean(prefilledInviteCode);
  const hasAutoSubmittedRef = useRef(false);
  const [inviteState, createInviteAction, createInvitePending] = useActionState(
    createInvite,
    {
      code: initialInviteCode ?? "",
      message: "",
      status: "idle",
    } satisfies CreateInviteActionState,
  );
  const [acceptState, setAcceptState] = useState<AcceptState>({ message: "", status: "idle" });
  const [candidateCode, setCandidateCode] = useState(prefilledInviteCode ?? "");
  const currentInviteCode =
    inviteState.code || initialInviteCode || "暂未生成";
  const acceptMessage =
    acceptState.message === "邀请码不能为空。" ? "" : acceptState.message;

  const handleAccept = useCallback(async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const code = candidateCode.trim().toUpperCase();
    if (!code || acceptState.status === "loading") return;

    setAcceptState({ message: "正在校验邀请码并完成绑定...", status: "loading" });

    try {
      const response = await fetch("/api/relationship/accept", {
        body: JSON.stringify({ code }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const data = await response.json() as { message?: string };

      if (!response.ok) {
        setAcceptState({ message: data.message ?? "绑定失败，请稍后重试。", status: "error" });
        return;
      }

      router.replace("/chat");
    } catch {
      setAcceptState({ message: "绑定失败，请稍后重试。", status: "error" });
    }
  }, [candidateCode, acceptState.status, router]);

  useEffect(() => {
    if (!isAcceptMode || hasAutoSubmittedRef.current) {
      return;
    }

    const normalizedCode = candidateCode.trim().toUpperCase();

    if (!normalizedCode) {
      return;
    }

    hasAutoSubmittedRef.current = true;
    handleAccept();
  }, [candidateCode, isAcceptMode, handleAccept]);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    const channel = supabase
      .channel(`profile-status:${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          filter: `id=eq.${currentUserId}`,
          schema: "public",
          table: "profiles",
        },
        (payload: { new: { status: string } }) => {
          if (payload.new.status === "inactive") {
            router.replace("/chat");
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUserId, router]);

  useEffect(() => {
    if (isAcceptMode) return;

    const id = setInterval(() => {
      router.refresh();
    }, 3000);

    return () => clearInterval(id);
  }, [isAcceptMode, router]);

  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <div className="grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-4 rounded-[1.9rem] border border-white/75 bg-white/70 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_40px_rgba(15,23,42,0.05)]">
        <p className="text-sm font-medium text-zinc-600">我的邀请码</p>

        <div className="space-y-3">
          <p className="text-3xl font-semibold tracking-[0.24em] text-zinc-950">
            {currentInviteCode}
          </p>
          <p aria-live="polite" className="min-h-6 text-sm text-zinc-500">
            {inviteState.message}
          </p>
        </div>

        <form action={createInviteAction}>
          <Button
            className="bg-rose-200 text-rose-950 hover:bg-rose-300"
            disabled={createInvitePending}
            type="submit"
          >
            {createInvitePending ? "生成中..." : "生成邀请码"}
          </Button>
        </form>
      </div>

      <div className="grid h-full grid-rows-[auto_minmax(0,1fr)] gap-4 rounded-[1.9rem] border border-white/75 bg-[linear-gradient(145deg,rgba(255,255,255,0.78),rgba(255,255,255,0.62))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_40px_rgba(15,23,42,0.05)]">
        <p className="text-sm font-medium text-zinc-600">输入邀请码</p>

        <form
          className="grid h-full grid-rows-[minmax(0,1fr)_auto] gap-4"
          onSubmit={handleAccept}
        >
          <Input
            className="h-13 rounded-[1.15rem] border-white/80 bg-white/72 px-4 text-[15px] text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_14px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl placeholder:text-zinc-400 focus:border-rose-200 focus:bg-white focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_0_0_4px_rgba(251,113,133,0.08),0_18px_40px_rgba(15,23,42,0.05)]"
            name="code"
            onChange={(event) => {
              setCandidateCode(event.target.value);
            }}
            placeholder="输入邀请码，例如 ONLYTWO"
            required
            value={candidateCode}
          />

          <div className="space-y-3">
            {isAcceptMode ? (
              <p aria-live="polite" className="min-h-6 text-sm text-zinc-500">
                {acceptMessage
                    || (acceptState.status === "loading"
                      ? "正在校验邀请码并完成绑定..."
                      : "已自动开始校验并绑定。")}
              </p>
            ) : acceptMessage ? (
              <p aria-live="polite" className="min-h-6 text-sm text-zinc-500">
                {acceptMessage}
              </p>
            ) : (
              <div className="min-h-6" />
            )}

            {!isAcceptMode ? (
              <Button
                className="bg-amber-50 text-amber-950 hover:bg-yellow-50"
                disabled={acceptState.status === "loading"}
                type="submit"
              >
                {acceptState.status === "loading" ? "绑定中..." : "验证并绑定"}
              </Button>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  );
}
