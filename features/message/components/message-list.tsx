import MessageBubble from "@/features/message/components/message-bubble";
import type { ChatMessage } from "@/features/message/types";

const seedMessages: ChatMessage[] = [
  {
    id: "m1",
    conversationId: "c1",
    senderUserId: "u2",
    content: "这是聊天流骨架，后面会替换成真实消息。",
    createdAt: new Date().toISOString(),
    status: "sent",
  },
  {
    id: "m2",
    conversationId: "c1",
    senderUserId: "u1",
    content: "已按 1v1 唯一会话模型预留结构。",
    createdAt: new Date().toISOString(),
    status: "sent",
  },
];

export default function MessageList() {
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.42),rgba(255,248,250,0.34))] px-4 py-6 sm:px-6">
      {seedMessages.map((message) => (
        <MessageBubble
          isOwn={message.senderUserId === "u1"}
          key={message.id}
          message={message}
        />
      ))}
    </div>
  );
}
