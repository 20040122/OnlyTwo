import "server-only";

import { cookies } from "next/headers";

import { getCurrentUser } from "@/features/auth/server";
import { ACCESS_TOKEN_COOKIE } from "@/features/auth/session";
import { getActiveRelationship } from "@/features/relationship/server";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase/server";

export type Conversation = {
  id: string;
  relationshipId: string;
  lastMessageAt?: string | null;
};

type ConversationRow = {
  id: string;
  relationship_id: string;
  last_message_at: string | null;
};

function mapConversation(conversation: ConversationRow): Conversation {
  return {
    id: conversation.id,
    relationshipId: conversation.relationship_id,
    lastMessageAt: conversation.last_message_at,
  };
}

async function getConversationById(
  conversationId: string,
  client: ReturnType<typeof createServerSupabaseClient>,
): Promise<ConversationRow | null> {
  const { data: conversation, error } = await client
    .from("conversations")
    .select("id, relationship_id, last_message_at")
    .eq("id", conversationId)
    .limit(1)
    .maybeSingle();

  if (error || !conversation) {
    return null;
  }

  return conversation;
}

async function getConversationByRelationshipId(
  relationshipId: string,
  client: ReturnType<typeof createServerSupabaseClient>,
): Promise<ConversationRow | null> {
  const { data: conversation, error } = await client
    .from("conversations")
    .select("id, relationship_id, last_message_at")
    .eq("relationship_id", relationshipId)
    .limit(1)
    .maybeSingle();

  if (error || !conversation) {
    return null;
  }

  return conversation;
}

async function ensureConversationMembers(
  conversationId: string,
  userIds: string[],
  client: ReturnType<typeof createServiceRoleSupabaseClient>,
) {
  const { error } = await client.from("conversation_members").upsert(
    userIds.map((userId) => ({
      conversation_id: conversationId,
      user_id: userId,
      role: "member" as const,
    })),
    {
      onConflict: "conversation_id,user_id",
      ignoreDuplicates: true,
    },
  );

  if (error) {
    return false;
  }

  return true;
}

export async function getConversationForCurrentUser(): Promise<Conversation | null> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  const serverSupabase = createServerSupabaseClient(accessToken);
  const serviceSupabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createServiceRoleSupabaseClient()
    : null;

  const membershipClient = serviceSupabase ?? serverSupabase;
  const { data: membership, error: membershipError } = await membershipClient
    .from("conversation_members")
    .select("conversation_id")
    .eq("user_id", currentUser.id)
    .limit(1)
    .maybeSingle();
  const membershipConversationId = !membershipError
    ? membership?.conversation_id ?? null
    : null;
  const hasMembership = Boolean(membershipConversationId);

  const conversationClient = serviceSupabase ?? serverSupabase;
  let conversation =
    !hasMembership
      ? null
      : await getConversationById(membershipConversationId, conversationClient);

  const activeRelationship = await getActiveRelationship();

  if (!conversation && serviceSupabase && activeRelationship) {
    conversation = await getConversationByRelationshipId(
      activeRelationship.id,
      serviceSupabase,
    );
  }

  if (!conversation) {
    return null;
  }

  if (serviceSupabase && activeRelationship?.id === conversation.relationship_id) {
    const membersEnsured = await ensureConversationMembers(
      conversation.id,
      [activeRelationship.userAId, activeRelationship.userBId],
      serviceSupabase,
    );

    if (!membersEnsured && !hasMembership) {
      return null;
    }
  }

  return mapConversation(conversation);
}
