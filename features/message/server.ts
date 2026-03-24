import "server-only";

import { cookies } from "next/headers";

import { getCurrentUser } from "@/features/auth/server";
import { ACCESS_TOKEN_COOKIE } from "@/features/auth/session";
import { getConversationForCurrentUser } from "@/features/conversation/server";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase/server";
import type { ChatMessage } from "@/features/message/types";

export async function listMessages(conversationId?: string): Promise<ChatMessage[]> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return [];
  }

  const resolvedConversationId =
    conversationId ?? (await getConversationForCurrentUser())?.id;

  if (!resolvedConversationId) {
    return [];
  }

  await requireConversationMembership(resolvedConversationId);

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return [];
  }

  const serverSupabase = createServerSupabaseClient(accessToken);
  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createServiceRoleSupabaseClient()
    : serverSupabase;
  const { data, error } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_user_id, content, created_at, status")
    .eq("conversation_id", resolvedConversationId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((message) => ({
    id: message.id,
    conversationId: message.conversation_id,
    senderUserId: message.sender_user_id,
    content: message.content,
    createdAt: message.created_at,
    status: message.status,
  }));
}

export async function requireConversationMembership(conversationId: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("Authentication required.");
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    throw new Error("Authentication required.");
  }

  const serverSupabase = createServerSupabaseClient(accessToken);
  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createServiceRoleSupabaseClient()
    : serverSupabase;
  const { data, error } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", currentUser.id)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Conversation access denied.");
  }

  return data;
}
