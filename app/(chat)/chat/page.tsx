import MessageInput from "@/features/message/components/message-input";
import MessageList from "@/features/message/components/message-list";

export default function ChatPage() {
  return (
    <div className="flex min-h-[70vh] flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-6 py-4">
        <h1 className="text-lg font-semibold text-zinc-950">Only Two Chat</h1>
        <p className="text-sm text-zinc-600">
          首期只保留唯一会话，不做会话列表。
        </p>
      </div>
      <MessageList />
      <div className="border-t border-zinc-200 p-4">
        <MessageInput />
      </div>
    </div>
  );
}
