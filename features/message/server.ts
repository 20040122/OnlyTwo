import "server-only";

import type { ChatMessage } from "@/features/message/types";

export async function listMessages(): Promise<ChatMessage[]> {
  return [];
}

export async function requireConversationMembership() {
  return;
}
