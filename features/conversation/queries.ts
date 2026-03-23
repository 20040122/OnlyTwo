import type { Conversation } from "@/features/conversation/server";

export async function getConversationPageData(): Promise<{
  conversation: Conversation | null;
}> {
  return {
    conversation: null,
  };
}
