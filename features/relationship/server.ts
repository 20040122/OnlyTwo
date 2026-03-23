import "server-only";

import type { Relationship, RelationshipInvite } from "@/features/relationship/types";

export async function getActiveRelationship(): Promise<Relationship | null> {
  return null;
}

export async function getPendingInvite(): Promise<RelationshipInvite | null> {
  return null;
}
