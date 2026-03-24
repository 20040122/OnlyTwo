import "server-only";

import { cookies } from "next/headers";

import { getCurrentUser } from "@/features/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { Relationship, RelationshipInvite } from "@/features/relationship/types";

export async function getActiveRelationship(): Promise<Relationship | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("only-two-access-token")?.value;

  if (!accessToken) {
    return null;
  }

  const supabase = createServerSupabaseClient(accessToken);
  const { data, error } = await supabase
    .from("relationships")
    .select("id, user_a_id, user_b_id, status")
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    userAId: data.user_a_id,
    userBId: data.user_b_id,
    status: data.status,
  };
}

export async function getPendingInvite(): Promise<RelationshipInvite | null> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("only-two-access-token")?.value;

  if (!accessToken) {
    return null;
  }

  const supabase = createServerSupabaseClient(accessToken);
  const { data, error } = await supabase
    .from("relationship_invites")
    .select("id, code, inviter_user_id, invitee_user_id, status")
    .eq("inviter_user_id", currentUser.id)
    .eq("status", "pending")
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    code: data.code,
    inviterUserId: data.inviter_user_id,
    inviteeUserId: data.invitee_user_id,
    status: data.status,
  };
}
