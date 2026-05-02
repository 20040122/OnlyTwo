"use client";

import { useCallback, useRef, useState, useTransition } from "react";

import { sendTextMessage } from "@/features/message/actions";
import type { ChatMessage } from "@/features/message/types";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_TEXTAREA_HEIGHT = 128;

type MessageInputProps = {
  conversationId: string;
  currentUserId: string;
  onOptimisticSend: (message: ChatMessage) => void;
};

export default function MessageInput({ conversationId, currentUserId, onOptimisticSend }: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const content = textareaRef.current?.value?.trim() ?? "";
    if (!content || isPending) {
      return;
    }

    textareaRef.current!.value = "";
    autoResize();
    setError(null);

    const clientId = crypto.randomUUID();
    const optimisticMessage: ChatMessage = {
      clientId,
      content,
      conversationId,
      createdAt: new Date().toISOString(),
      id: `optimistic-${clientId}`,
      senderUserId: currentUserId,
      status: "sending",
      localStatus: "sending",
    };

    onOptimisticSend(optimisticMessage);

    startTransition(async () => {
      const result = await sendTextMessage(content, conversationId, clientId);

      if (result.status === "error") {
        setError(result.message);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      textareaRef.current?.form?.requestSubmit();
    }
  };

  return (
    <form className="space-y-1.5" onSubmit={handleSubmit}>
      <div
        className={`mx-auto flex w-full max-w-2xl items-end gap-2 rounded-[1.6rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,252,254,0.72))] p-2 shadow-[0_2px_12px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-sm transition-opacity ${
          isPending ? "opacity-75" : ""
        }`}
      >
        <textarea
          className="flex-1 resize-none border-none bg-transparent px-3 py-2.5 text-sm leading-6 text-zinc-900 outline-none placeholder:text-zinc-400"
          disabled={isPending}
          maxLength={MAX_MESSAGE_LENGTH}
          name="content"
          onChange={autoResize}
          onKeyDown={handleKeyDown}
          placeholder="输入想说的话..."
          ref={textareaRef}
          required
          rows={1}
        />
        <button
          className={`flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-full shadow-[0_2px_8px_rgba(225,29,72,0.18)] transition-all duration-200 ${
            isPending
              ? "bg-rose-200/70 text-rose-400"
              : "bg-[linear-gradient(135deg,rgba(251,113,133,0.92),rgba(251,146,60,0.88))] text-white hover:shadow-[0_4px_16px_rgba(225,29,72,0.25)] hover:scale-[1.04] active:scale-[0.97]"
          }`}
          disabled={isPending}
          type="submit"
        >
          {isPending ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" d="M4 12a8 8 0 018-8" fill="currentColor" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>

      {error ? (
        <p aria-live="polite" className="px-4 text-sm leading-5 text-rose-500/90">
          {error}
        </p>
      ) : null}
    </form>
  );
}
