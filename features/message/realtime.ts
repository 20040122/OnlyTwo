"use client";

import type { ChatMessage } from "@/features/message/types";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type MessageRow = {
  client_id: string | null;
  content: string;
  conversation_id: string;
  created_at: string;
  id: string;
  sender_user_id: string;
  status: ChatMessage["status"];
};

type SubscribeToMessagesParams = {
  accessToken: string;
  conversationId: string;
  onMessage: (message: ChatMessage) => void;
};

function mapRealtimeRowToMessage(message: MessageRow): ChatMessage {
  return {
    clientId: message.client_id ?? undefined,
    content: message.content,
    conversationId: message.conversation_id,
    createdAt: message.created_at,
    id: message.id,
    senderUserId: message.sender_user_id,
    status: message.status,
  };
}

export function subscribeToMessages({
  accessToken,
  conversationId,
  onMessage,
}: SubscribeToMessagesParams) {
  if (!accessToken) {
    console.warn("subscribeToMessages skipped: missing access token", {
      conversationId,
    });
    return () => {};
  }

  const supabase = createBrowserSupabaseClient();
  void supabase.realtime.setAuth(accessToken);
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        filter: `conversation_id=eq.${conversationId}`,
        schema: "public",
        table: "messages",
      },
      (payload) => {
        if (!payload.new) {
          return;
        }

        onMessage(mapRealtimeRowToMessage(payload.new as MessageRow));
      },
    )
    .subscribe((status) => {
      console.info("subscribeToMessages status", {
        conversationId,
        status,
      });

      if (status === "CHANNEL_ERROR") {
        console.error("subscribeToMessages channel error", { conversationId });
      }
    });

  return () => {
    void supabase.removeChannel(channel);
  };
}
