export type PersistedMessageStatus = "sent" | "deleted";
export type LocalMessageStatus = "sending" | "sent" | "failed";

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderUserId: string;
  content: string;
  createdAt: string;
  status: PersistedMessageStatus | LocalMessageStatus;
  clientId?: string;
  localStatus?: LocalMessageStatus;
};
