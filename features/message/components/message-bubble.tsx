import type { ChatMessage } from "@/features/message/types";

type MessageBubbleProps = {
  isOwn: boolean;
  message: ChatMessage;
};

function formatMessageTime(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function MessageBubble({
  isOwn,
  message,
}: MessageBubbleProps) {
  const messageTime = formatMessageTime(message.createdAt);
  const isSending = message.localStatus === "sending";

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-[1.6rem] px-4 py-3 text-sm leading-6 shadow-sm ${
          isOwn
            ? "bg-[linear-gradient(145deg,rgba(251,207,232,0.95),rgba(254,215,170,0.95))] text-rose-950"
            : "border border-white/80 bg-white/82 text-zinc-900"
        } ${isSending ? "opacity-70" : ""}`}
      >
        <p>{message.content}</p>
        {messageTime ? (
          <p className={`mt-2 text-[11px] ${isOwn ? "text-rose-900/60" : "text-zinc-500"}`}>
            {isSending ? "发送中" : messageTime}
          </p>
        ) : null}
      </div>
    </div>
  );
}