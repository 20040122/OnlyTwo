import "server-only";

export type Conversation = {
  id: string;
  relationshipId: string;
  lastMessageAt?: string | null;
};

export async function getConversationForCurrentUser(): Promise<Conversation | null> {
  return null;
}
