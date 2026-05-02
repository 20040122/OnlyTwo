"use client";

import { forwardRef, startTransition, useEffect, useEffectEvent, useImperativeHandle, useRef, useState } from "react";

import MessageBubble from "@/features/message/components/message-bubble";
import { subscribeToMessages } from "@/features/message/realtime";
import type { ChatMessage } from "@/features/message/types";

type MessageListProps = {
  accessToken: string;
  conversationId: string;
  currentUserId: string;
  messages: ChatMessage[];
  senderProfiles: Record<string, { nickname: string; avatarUrl: string | null }>;
};

export type MessageListHandle = {
  addOptimisticMessage: (message: ChatMessage) => void;
};

function sortMessages(messages: ChatMessage[]) {
  return [...messages].sort((left, right) => {
    const leftTimestamp = new Date(left.createdAt).getTime();
    const rightTimestamp = new Date(right.createdAt).getTime();

    if (leftTimestamp !== rightTimestamp) {
      return leftTimestamp - rightTimestamp;
    }

    return left.id.localeCompare(right.id);
  });
}

function mergeMessage(messages: ChatMessage[], incomingMessage: ChatMessage) {
  if (incomingMessage.clientId) {
    const withoutOptimistic = messages.filter((m) => m.clientId !== incomingMessage.clientId || m.id === incomingMessage.id);
    const nextMessages = new Map(withoutOptimistic.map((message) => [message.id, message]));
    nextMessages.set(incomingMessage.id, incomingMessage);
    return sortMessages([...nextMessages.values()]);
  }

  const nextMessages = new Map(messages.map((message) => [message.id, message]));
  nextMessages.set(incomingMessage.id, incomingMessage);

  return sortMessages([...nextMessages.values()]);
}

async function fetchLatestMessages() {
  const response = await fetch("/api/messages", {
    cache: "no-store",
    credentials: "same-origin",
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as { messages?: ChatMessage[] };
  return Array.isArray(payload.messages) ? payload.messages : [];
}

function isNearBottom(element: HTMLDivElement) {
  return element.scrollHeight - element.scrollTop - element.clientHeight <= 64;
}

const MessageList = forwardRef<MessageListHandle, MessageListProps>(function MessageList({
  accessToken,
  conversationId,
  currentUserId,
  messages,
  senderProfiles,
}, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const previousMessageCountRef = useRef(messages.length);
  const [messageItems, setMessageItems] = useState(() => sortMessages(messages));

  const scrollToBottom = useEffectEvent((behavior: ScrollBehavior) => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  });

  const handleIncomingMessage = useEffectEvent((incomingMessage: ChatMessage) => {
    startTransition(() => {
      setMessageItems((currentMessages) => mergeMessage(currentMessages, incomingMessage));
    });
  });

  const syncLatestMessages = useEffectEvent(async () => {
    try {
      const latestMessages = await fetchLatestMessages();

      if (latestMessages.length === 0) {
        return;
      }

      startTransition(() => {
        setMessageItems((currentMessages) => {
          let nextMessages = currentMessages;

          for (const message of latestMessages) {
            nextMessages = mergeMessage(nextMessages, message);
          }

          return nextMessages;
        });
      });
    } catch (error) {
      console.error("syncLatestMessages failed", error);
    }
  });

  useImperativeHandle(ref, () => ({
    addOptimisticMessage(message: ChatMessage) {
      shouldStickToBottomRef.current = true;
      startTransition(() => {
        setMessageItems((currentMessages) => sortMessages([...currentMessages, message]));
      });
    },
  }));

  useEffect(() => {
    setMessageItems(sortMessages(messages));
  }, [messages]);

  useEffect(() => {
    scrollToBottom("auto");
  }, []);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    return subscribeToMessages({
      accessToken,
      conversationId,
      onMessage: handleIncomingMessage,
    });
  }, [accessToken, conversationId]);

  useEffect(() => {
    void syncLatestMessages();

    const intervalId = window.setInterval(() => {
      void syncLatestMessages();
    }, 4000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void syncLatestMessages();
      }
    };

    window.addEventListener("focus", syncLatestMessages);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", syncLatestMessages);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [conversationId]);

  useEffect(() => {
    if (messageItems.length === 0) {
      previousMessageCountRef.current = 0;
      return;
    }

    const lastMessage = messageItems[messageItems.length - 1];
    const hasNewMessage = messageItems.length !== previousMessageCountRef.current;
    previousMessageCountRef.current = messageItems.length;

    if (!hasNewMessage) {
      return;
    }

    if (shouldStickToBottomRef.current || lastMessage.senderUserId === currentUserId) {
      scrollToBottom("smooth");
    }
  }, [currentUserId, messageItems]);

  return (
    <div
      className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.42),rgba(255,248,250,0.34))] px-4 py-6 sm:px-6"
      onScroll={(event) => {
        shouldStickToBottomRef.current = isNearBottom(event.currentTarget);
      }}
      ref={containerRef}
    >
      {messageItems.length > 0 ? (
        messageItems.map((message) => (
          <MessageBubble
            isOwn={message.senderUserId === currentUserId}
            key={message.id}
            message={message}
            senderInfo={senderProfiles[message.senderUserId]}
          />
        ))
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-[1.8rem] border border-dashed border-white/80 bg-white/45 px-6 py-10 text-center text-sm leading-6 text-zinc-600">
          你们的专属会话已经建立，还没有消息。
        </div>
      )}
    </div>
  );
});

export default MessageList;