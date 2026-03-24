"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCESS_TOKEN_COOKIE } from "@/features/auth/session";
import { assertCanCreateInvite } from "@/features/relationship/guards";
import { getActiveRelationship } from "@/features/relationship/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type CreateInviteActionState = {
  code: string;
  message: string;
  status: "idle" | "error" | "success";
};

const INITIAL_CREATE_INVITE_STATE: CreateInviteActionState = {
  code: "",
  message: "",
  status: "idle",
};

function generateInviteCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let nextCode = "";

  for (let index = 0; index < 8; index += 1) {
    nextCode += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return nextCode;
}

export async function createInvite(
  prevState: CreateInviteActionState = INITIAL_CREATE_INVITE_STATE,
): Promise<CreateInviteActionState> {
  void prevState;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return { code: "", status: "error", message: "登录状态已失效，请重新登录。" };
  }

  const activeRelationship = await getActiveRelationship();

  try {
    assertCanCreateInvite(Boolean(activeRelationship));
  } catch (error) {
    return {
      code: "",
      status: "error",
      message: error instanceof Error ? error.message : "当前无法创建邀请码。",
    };
  }

  const supabase = createServerSupabaseClient(accessToken);
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { code: "", status: "error", message: "无法确认当前用户，请重新登录。" };
  }

  const { error: cleanupInviteError } = await supabase
    .from("relationship_invites")
    .delete()
    .eq("inviter_user_id", userData.user.id)
    .in("status", ["pending", "expired", "cancelled"]);

  if (cleanupInviteError) {
    return { code: "", status: "error", message: "清理旧邀请码失败，请稍后重试。" };
  }

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateInviteCode();
    const { data, error } = await supabase
      .from("relationship_invites")
      .insert({
        code,
        inviter_user_id: userData.user.id,
        status: "pending",
        expires_at: expiresAt,
      })
      .select("code")
      .single();

    if (!error && data) {
      revalidatePath("/invite");

      return {
        code: data.code,
        status: "success",
        message: "邀请码已生成。",
      };
    }
  }

  return { code: "", status: "error", message: "生成邀请码失败，请稍后重试。" };
}

export type AcceptInviteActionState = {
  message: string;
  status: "idle" | "error" | "success";
};

const INITIAL_ACCEPT_INVITE_STATE: AcceptInviteActionState = {
  message: "",
  status: "idle",
};

export async function acceptInvite(
  prevState: AcceptInviteActionState = INITIAL_ACCEPT_INVITE_STATE,
  formData: FormData,
): Promise<AcceptInviteActionState> {
  void prevState;

  const code =
    typeof formData.get("code") === "string"
      ? formData.get("code")!.toString().trim().toUpperCase()
      : "";

  if (!code) {
    return { status: "error", message: "邀请码不能为空。" };
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return { status: "error", message: "登录状态已失效，请重新登录。" };
  }

  const supabase = createServerSupabaseClient(accessToken);
  const { error } = await supabase.rpc("accept_relationship_invite", {
    p_code: code,
  });

  if (error) {
    const message = error.message.toLowerCase();
    const details = error.details?.toLowerCase() ?? "";
    const hint = error.hint?.toLowerCase() ?? "";
    const combinedMessage = `${message} ${details} ${hint}`;

    if (message.includes("invite not found")) {
      return {
        status: "error",
        message: "邀请码不存在，可能对方已经重新生成了新的邀请码。",
      };
    }

    if (message.includes("expired")) {
      return { status: "error", message: "邀请码已过期。" };
    }

    if (message.includes("own invite")) {
      return { status: "error", message: "不能接受自己生成的邀请码。" };
    }

    if (message.includes("active relationship")) {
      return { status: "error", message: "你或对方已经存在有效绑定关系。" };
    }

    if (message.includes("no longer pending")) {
      return {
        status: "error",
        message: "邀请码已被使用或已失效，可能对方已经重新生成了新的邀请码。",
      };
    }

    if (
      combinedMessage.includes("accept_relationship_invite")
      || combinedMessage.includes("function public.accept_relationship_invite")
    ) {
      return {
        status: "error",
        message: "数据库迁移还没执行，缺少绑定函数。请先运行最新 Supabase migration。",
      };
    }

    if (
      combinedMessage.includes("relationships_user_a_id_fkey")
      || combinedMessage.includes("relationships_user_b_id_fkey")
      || combinedMessage.includes("profiles")
    ) {
      return {
        status: "error",
        message: "双方需要先完成资料初始化后才能绑定。",
      };
    }

    return { status: "error", message: "绑定失败，请稍后重试。" };
  }

  revalidatePath("/invite");
  revalidatePath("/chat");
  redirect("/chat");
}

export async function unbindRelationship() {
  return { message: "TODO: unbind the active relationship safely." };
}
