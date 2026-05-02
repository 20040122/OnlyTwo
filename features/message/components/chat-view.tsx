"use client";

import { useRef } from "react";

import MessageInput from "@/features/message/components/message-input";
import MessageList, { type MessageListHandle } from "@/features/message/components/message-list";
import type { ChatMessage } from "@/features/message/types";

type SenderInfo = {
  nickname: string;
  avatarUrl: string | null;
};

type ChatViewProps = {
  accessToken: string;
  conversationId: string;
  currentUserId: string;
  messages: ChatMessage[];
  senderProfiles: Record<string, SenderInfo>;
};

export default function ChatView({
  accessToken,
  conversationId,
  currentUserId,
  messages,
  senderProfiles,
}: ChatViewProps) {
  const messageListRef = useRef<MessageListHandle>(null);

  const handleOptimisticSend = (optimisticMessage: ChatMessage) => {
    messageListRef.current?.addOptimisticMessage(optimisticMessage);
  };

  return (
    <>
      <MessageList
        accessToken={accessToken}
        conversationId={conversationId}
        currentUserId={currentUserId}
        messages={messages}
        senderProfiles={senderProfiles}
        ref={messageListRef}
      />
      <div className="relative border-t border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.3),rgba(255,252,254,0.5))] px-4 pt-3 pb-4 sm:px-5 sm:pt-4 sm:pb-5">
        <MessageInput
          conversationId={conversationId}
          currentUserId={currentUserId}
          onOptimisticSend={handleOptimisticSend}
        />
      </div>
    </>
  );
}