import type { ChatMessage } from "@/features/message/types";

type MessageBubbleProps = {
  isOwn: boolean;
  message: ChatMessage;
};

export default function MessageBubble({
  isOwn,
  message,
}: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-3xl px-4 py-3 text-sm leading-6 ${
          isOwn ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-900"
        }`}
      >
        <p>{message.content}</p>
      </div>
    </div>
  );
}
