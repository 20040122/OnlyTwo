"use server";

import { cookies } from "next/headers";

import { getCurrentUser } from "@/features/auth/server";
import { ACCESS_TOKEN_COOKIE } from "@/features/auth/session";
import type { ChatMessage } from "@/features/message/types";
import { requireConversationMembership } from "@/features/message/server";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase/server";

const MAX_MESSAGE_LENGTH = 2000;

type SendTextMessageResult =
  | {
      conversationId: string;
      message: ChatMessage;
      status: "success";
    }
  | {
      code:
        | "authentication_required"
        | "empty_content"
        | "message_too_long"
        | "conversation_access_denied"
        | "insert_failed";
      message: string;
      status: "error";
    };

export async function sendTextMessage(
  rawContent: string,
  conversationId: string,
  clientId?: string,
): Promise<SendTextMessageResult> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      code: "authentication_required",
      message: "请先登录。",
      status: "error",
    };
  }

  const content = typeof rawContent === "string" ? rawContent.trim() : "";

  if (!content) {
    return {
      code: "empty_content",
      message: "消息内容不能为空。",
      status: "error",
    };
  }

  if (content.length > MAX_MESSAGE_LENGTH) {
    return {
      code: "message_too_long",
      message: `消息不能超过 ${MAX_MESSAGE_LENGTH} 个字符。`,
      status: "error",
    };
  }

  try {
    await requireConversationMembership(conversationId);
  } catch {
    return {
      code: "conversation_access_denied",
      message: "你没有当前会话的发送权限。",
      status: "error",
    };
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return {
      code: "authentication_required",
      message: "请先登录。",
      status: "error",
    };
  }

  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createServiceRoleSupabaseClient()
    : createServerSupabaseClient(accessToken);
  const { data, error } = await supabase
    .from("messages")
    .insert({
      client_id: clientId ?? crypto.randomUUID(),
      content,
      conversation_id: conversationId,
      sender_user_id: currentUser.id,
    })
    .select("id, conversation_id, sender_user_id, content, created_at, status, client_id")
    .single();

  if (error || !data) {
    console.error("sendTextMessage insert failed", {
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      message: error?.message,
    });

    const combinedMessage =
      `${error?.message ?? ""} ${error?.details ?? ""} ${error?.hint ?? ""}`.toLowerCase();

    if (
      combinedMessage.includes("row-level security")
        || combinedMessage.includes("permission denied")
        || combinedMessage.includes("conversations")
    ) {
      return {
        code: "insert_failed",
        message: "消息发送依赖的数据库迁移尚未完整执行。请先运行最新 Supabase migration。",
        status: "error",
      };
    }

    return {
      code: "insert_failed",
      message:
        process.env.NODE_ENV === "development" && error?.message
          ? `消息发送失败：${error.message}`
          : "消息发送失败，请稍后重试。",
      status: "error",
    };
  }

  // No revalidatePath / refresh() — realtime subscription handles UI updates

  return {
    conversationId,
    message: {
      clientId: data.client_id ?? undefined,
      content: data.content,
      conversationId: data.conversation_id,
      createdAt: data.created_at,
      id: data.id,
      senderUserId: data.sender_user_id,
      status: data.status,
    },
    status: "success",
  };
}

// Legacy form-action entry point

type SendMessageActionState = {
  message: string;
  status: "idle" | "error" | "success";
};

const INITIAL_SEND_MESSAGE_STATE: SendMessageActionState = {
  message: "",
  status: "idle",
};

function normalizeMessageContent(value: FormDataEntryValue | string | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function sendMessage(
  prevState: SendMessageActionState = INITIAL_SEND_MESSAGE_STATE,
  formData: FormData,
): Promise<SendMessageActionState> {
  void prevState;

  const content = normalizeMessageContent(formData.get("content"));
  const { getConversationForCurrentUser } = await import("@/features/conversation/server");

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { message: "请先登录。", status: "error" };
  }

  const conversation = await getConversationForCurrentUser();

  if (!conversation) {
    return { message: "当前没有可发送消息的唯一会话。", status: "error" };
  }

  const result = await sendTextMessage(content, conversation.id);

  if (result.status === "error") {
    return { message: result.message, status: "error" };
  }

  return { message: "", status: "success" };
}

export async function markConversationRead() {
  return { message: "TODO: update last_read_message_id and last_read_at." };
}

export async function retryMessage() {
  return { message: "TODO: retry a locally failed message." };
}