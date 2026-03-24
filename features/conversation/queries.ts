import type { Conversation } from "@/features/conversation/server";
import { getConversationForCurrentUser } from "@/features/conversation/server";
import { listMessages } from "@/features/message/server";
import type { ChatMessage } from "@/features/message/types";

export async function getConversationPageData(): Promise<{
  conversation: Conversation | null;
  messages: ChatMessage[];
}> {
  const conversation = await getConversationForCurrentUser();

  return {
    conversation,
    messages: conversation ? await listMessages(conversation.id) : [],
  };
}
