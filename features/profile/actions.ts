"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCESS_TOKEN_COOKIE } from "@/features/auth/session";
import { normalizeProfileInput, type ProfileInput } from "@/features/profile/schemas";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type SaveProfileActionState = {
  message: string;
  status: "idle" | "error";
};

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_FILE_SIZE = 15 * 1024 * 1024;

type UpsertProfileResult =
  | {
      message: "";
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

function sanitizeAvatarFileName(fileName: string) {
  const [baseName, ...restExtensions] = fileName.split(".");
  const extension = restExtensions.length > 0 ? `.${restExtensions.join(".").toLowerCase()}` : "";
  const normalizedBaseName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `${normalizedBaseName || "avatar"}${extension}`;
}

async function uploadAvatarFile(
  accessToken: string,
  userId: string,
  file: File,
): Promise<UpsertProfileResult & { url?: string }> {
  if (!file.type.startsWith("image/")) {
    return { ok: false, message: "头像必须是图片文件。" };
  }

  if (file.size > MAX_AVATAR_FILE_SIZE) {
    return { ok: false, message: "头像大小不能超过 15MB。" };
  }

  const supabase = createServerSupabaseClient(accessToken);
  const filePath = `${userId}/${Date.now()}-${sanitizeAvatarFileName(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return {
      ok: false,
      message: uploadError.message
        ? `头像上传失败：${uploadError.message}`
        : "头像上传失败，请稍后重试。",
    };
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);

  if (!data.publicUrl) {
    return { ok: false, message: "头像上传成功，但无法获取访问地址。" };
  }

  return {
    ok: true,
    message: "",
    url: data.publicUrl,
  };
}

export async function upsertProfileForUser(
  accessToken: string,
  userId: string,
  input: ProfileInput,
): Promise<UpsertProfileResult> {
  const result = normalizeProfileInput(input);

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  const supabase = createServerSupabaseClient(accessToken);
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      nickname: result.data.nickname,
      avatar_url: result.data.avatarUrl,
    },
    {
      onConflict: "id",
    },
  );

  if (error) {
    return { ok: false, message: "保存失败，请稍后重试。" };
  }

  return { ok: true, message: "" };
}

export async function saveProfile(
  prevState: SaveProfileActionState = { message: "", status: "idle" },
  formData: FormData,
): Promise<SaveProfileActionState> {
  void prevState;

  const nickname = typeof formData.get("nickname") === "string"
    ? formData.get("nickname")!.toString()
    : "";
  const avatarUrl = typeof formData.get("avatarUrl") === "string"
    ? formData.get("avatarUrl")!.toString()
    : "";
  const avatarFile = formData.get("avatarFile");

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

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", userData.user.id)
    .maybeSingle();

  let finalAvatarUrl = avatarUrl || existingProfile?.avatar_url || "";

  if (avatarFile instanceof File && avatarFile.size > 0) {
    const uploadResult = await uploadAvatarFile(accessToken, userData.user.id, avatarFile);

    if (!uploadResult.ok) {
      return { status: "error", message: uploadResult.message };
    }

    finalAvatarUrl = uploadResult.url ?? "";
  }

  const result = await upsertProfileForUser(accessToken, userData.user.id, {
    nickname,
    avatarUrl: finalAvatarUrl,
  });

  if (!result.ok) {
    return { status: "error", message: result.message };
  }

  revalidatePath("/", "layout");
  redirect("/invite");
}
