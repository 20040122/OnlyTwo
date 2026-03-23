export type RelationshipStatus = "active" | "unbound";

export type Relationship = {
  id: string;
  userAId: string;
  userBId: string;
  status: RelationshipStatus;
};

export type RelationshipInviteStatus =
  | "pending"
  | "accepted"
  | "expired"
  | "cancelled";

export type RelationshipInvite = {
  id: string;
  code: string;
  inviterUserId: string;
  inviteeUserId?: string | null;
  status: RelationshipInviteStatus;
};
