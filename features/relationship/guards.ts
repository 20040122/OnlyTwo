export function assertCanCreateInvite(hasActiveRelationship: boolean) {
  if (hasActiveRelationship) {
    throw new Error("Users with an active relationship cannot create another invite.");
  }
}

export function assertNotSelfInvite(inviterUserId: string, inviteeUserId: string) {
  if (inviterUserId === inviteeUserId) {
    throw new Error("A user cannot bind with themselves.");
  }
}
