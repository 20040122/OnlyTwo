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
        className={`max-w-[75%] rounded-[1.6rem] px-4 py-3 text-sm leading-6 shadow-sm ${
          isOwn
            ? "bg-[linear-gradient(145deg,rgba(251,207,232,0.95),rgba(254,215,170,0.95))] text-rose-950"
            : "border border-white/80 bg-white/82 text-zinc-900"
        }`}
      >
        <p>{message.content}</p>
      </div>
    </div>
  );
}
