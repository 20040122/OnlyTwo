import type { ChatMessage } from "@/features/message/types";

type SenderInfo = {
  nickname: string;
  avatarUrl: string | null;
};

type MessageBubbleProps = {
  isOwn: boolean;
  message: ChatMessage;
  senderInfo?: SenderInfo;
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

function Avatar({ senderInfo }: { senderInfo?: SenderInfo }) {
  if (senderInfo?.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={senderInfo.nickname}
        className="h-8 w-8 flex-shrink-0 rounded-full border border-white/60 object-cover shadow-sm"
        src={senderInfo.avatarUrl}
      />
    );
  }

  return (
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/60 bg-rose-100 shadow-sm">
      <span className="text-xs font-medium text-rose-700">
        {senderInfo?.nickname?.charAt(0) ?? "?"}
      </span>
    </div>
  );
}

export default function MessageBubble({
  isOwn,
  message,
  senderInfo,
}: MessageBubbleProps) {
  const messageTime = formatMessageTime(message.createdAt);
  const isSending = message.localStatus === "sending";

  return (
    <div
      className={`flex items-start gap-x-2 ${
        isOwn ? "flex-row-reverse ml-auto" : ""
      }`}
    >
      <Avatar senderInfo={senderInfo} />

      <div
        className={`flex max-w-[72%] flex-col ${
          isOwn ? "items-end" : "items-start"
        }`}
      >
        <span
          className={`mb-0.5 px-1 text-[11px] ${
            isOwn ? "text-zinc-400" : "text-zinc-500"
          }`}
        >
          {senderInfo?.nickname ?? ""}
        </span>

        <div
          className={`rounded-[1.6rem] px-4 py-3 text-sm leading-6 shadow-sm ${
            isOwn
              ? "bg-[linear-gradient(145deg,rgba(251,207,232,0.95),rgba(254,215,170,0.95))] text-rose-950"
              : "border border-white/80 bg-white/82 text-zinc-900"
          } ${isSending ? "opacity-70" : ""}`}
        >
          <p>{message.content}</p>
          {messageTime ? (
            <p
              className={`mt-2 text-[11px] ${
                isOwn ? "text-rose-900/60" : "text-zinc-500"
              }`}
            >
              {isSending ? "发送中" : messageTime}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
