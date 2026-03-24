"use server";

import { refresh, revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { getCurrentUser } from "@/features/auth/server";
import { ACCESS_TOKEN_COOKIE } from "@/features/auth/session";
import { getConversationForCurrentUser } from "@/features/conversation/server";
import { requireConversationMembership } from "@/features/message/server";
import type { ChatMessage } from "@/features/message/types";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase/server";

const MAX_MESSAGE_LENGTH = 2000;

type SendMessageActionState = {
  message: string;
  status: "idle" | "error" | "success";
};

type CreateTextMessageResult =
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
        | "conversation_not_found"
        | "conversation_access_denied"
        | "insert_failed";
      message: string;
      status: "error";
    };

const INITIAL_SEND_MESSAGE_STATE: SendMessageActionState = {
  message: "",
  status: "idle",
};

function normalizeMessageContent(value: FormDataEntryValue | string | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function createTextMessageForCurrentUser(
  rawContent: string,
): Promise<CreateTextMessageResult> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      code: "authentication_required",
      message: "Authentication required.",
      status: "error",
    };
  }

  const content = normalizeMessageContent(rawContent);

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

  const conversation = await getConversationForCurrentUser();

  if (!conversation) {
    return {
      code: "conversation_not_found",
      message: "当前没有可发送消息的唯一会话。",
      status: "error",
    };
  }

  try {
    await requireConversationMembership(conversation.id);
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
      message: "Authentication required.",
      status: "error",
    };
  }

  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createServiceRoleSupabaseClient()
    : createServerSupabaseClient(accessToken);
  const { data, error } = await supabase
    .from("messages")
    .insert({
      client_id: crypto.randomUUID(),
      content,
      conversation_id: conversation.id,
      sender_user_id: currentUser.id,
    })
    .select("id, conversation_id, sender_user_id, content, created_at, status")
    .single();

  if (error || !data) {
    console.error("sendMessage insert failed", {
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

  revalidatePath("/chat");

  return {
    conversationId: conversation.id,
    message: {
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

export async function sendMessage(
  prevState: SendMessageActionState = INITIAL_SEND_MESSAGE_STATE,
  formData: FormData,
): Promise<SendMessageActionState> {
  void prevState;

  const result = await createTextMessageForCurrentUser(
    normalizeMessageContent(formData.get("content")),
  );

  if (result.status === "error") {
    return {
      message: result.message,
      status: "error",
    };
  }

  refresh();

  return {
    message: "",
    status: "success",
  };
}

export async function markConversationRead() {
  return { message: "TODO: update last_read_message_id and last_read_at." };
}

export async function retryMessage() {
  return { message: "TODO: retry a locally failed message." };
}
