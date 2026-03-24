"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase";

const ACCESS_TOKEN_COOKIE = "only-two-access-token";

export type SaveProfileActionState = {
  message: string;
  status: "idle" | "error";
};

export async function saveProfile(
  prevState: SaveProfileActionState = { message: "", status: "idle" },
  formData: FormData,
): Promise<SaveProfileActionState> {
  void prevState;

  const nickname = typeof formData.get("nickname") === "string"
    ? formData.get("nickname")!.toString().trim()
    : "";
  const avatarUrlValue = typeof formData.get("avatarUrl") === "string"
    ? formData.get("avatarUrl")!.toString().trim()
    : "";

  if (!nickname) {
    return { status: "error", message: "请输入昵称。" };
  }

  if (avatarUrlValue) {
    try {
      new URL(avatarUrlValue);
    } catch {
      return { status: "error", message: "头像地址格式不正确。" };
    }
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return { status: "error", message: "登录状态已失效，请重新登录。" };
  }

  const supabase = createServerSupabaseClient(accessToken);
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { status: "error", message: "无法确认当前用户，请重新登录。" };
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: userData.user.id,
      nickname,
      avatar_url: avatarUrlValue || null,
    },
    {
      onConflict: "id",
    },
  );

  if (error) {
    return { status: "error", message: "保存失败，请稍后重试。" };
  }

  revalidatePath("/", "layout");
  redirect("/invite");
}
