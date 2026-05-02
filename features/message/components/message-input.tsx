"use client";

import { useCallback, useRef, useState } from "react";

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
  const [error, setError] = useState<string | null>(null);
  const sendingRef = useRef(false);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const content = textareaRef.current?.value?.trim() ?? "";
    if (!content || sendingRef.current) {
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
    sendingRef.current = true;

    sendTextMessage(content, conversationId, clientId).then((result) => {
      sendingRef.current = false;

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
      <div className="mx-auto flex w-full max-w-2xl items-end gap-2 rounded-[1.6rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,252,254,0.72))] p-2 shadow-[0_2px_12px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-sm">
        <textarea
          className="flex-1 resize-none border-none bg-transparent px-3 py-2.5 text-sm leading-6 text-zinc-900 outline-none placeholder:text-zinc-400"
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
          className="flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-full bg-[linear-gradient(135deg,rgba(251,113,133,0.92),rgba(251,146,60,0.88))] text-white shadow-[0_2px_8px_rgba(225,29,72,0.18)] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(225,29,72,0.25)] hover:scale-[1.04] active:scale-[0.97]"
          type="submit"
        >
          <svg fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
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
