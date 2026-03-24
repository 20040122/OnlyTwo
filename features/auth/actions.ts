"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase";

const ACCESS_TOKEN_COOKIE = "only-two-access-token";
const REFRESH_TOKEN_COOKIE = "only-two-refresh-token";
const ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 7;

export type AuthActionState = {
  message: string;
  status: "idle" | "error" | "success";
};

const EMPTY_STATE: AuthActionState = {
  message: "",
  status: "idle",
};

function normalizeValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNextPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "";
  }

  return value;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getBaseUrl(headerList: Headers) {
  const origin = headerList.get("origin");

  if (origin) {
    return origin;
  }

  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";

  return host ? `${protocol}://${host}` : "http://127.0.0.1:3000";
}

async function setSessionCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";

  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: ONE_WEEK_IN_SECONDS,
  });
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: ONE_WEEK_IN_SECONDS,
  });
}

async function clearSessionCookies() {
  const cookieStore = await cookies();

  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

async function getExistingUserByEmail(email: string) {
  try {
    const adminClient = createServiceRoleSupabaseClient();
    const { data, error } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });

    if (error) {
      return null;
    }

    return data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) ?? null;
  } catch {
    return null;
  }
}

async function getPostLoginRedirectPath(accessToken: string) {
  const supabase = createServerSupabaseClient(accessToken);
  const { data, error } = await supabase
    .from("profiles")
    .select("id, status")
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return "/onboarding";
  }

  if (data.status === "inactive") {
    return "/chat";
  }

  return "/invite";
}

export async function signup(
  prevState: AuthActionState = EMPTY_STATE,
  formData: FormData,
): Promise<AuthActionState> {
  void prevState;

  const nickname = normalizeValue(formData.get("nickname"));
  const email = normalizeValue(formData.get("email")).toLowerCase();
  const password = normalizeValue(formData.get("password"));

  if (!nickname) {
    return { status: "error", message: "请输入昵称。" };
  }

  if (!email || !isValidEmail(email)) {
    return { status: "error", message: "请输入有效邮箱。" };
  }

  if (password.length < 6) {
    return { status: "error", message: "密码至少需要 6 位。" };
  }

  const existingUser = await getExistingUserByEmail(email);

  if (existingUser) {
    return { status: "error", message: "该邮箱已注册，请直接登录。" };
  }

  const headerList = await headers();
  const supabase = createServerSupabaseClient();
  const emailRedirectTo = `${getBaseUrl(headerList)}/callback?next=/login?verified=1`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {
        nickname,
      },
    },
  });

  if (error) {
    return {
      status: "error",
      message: error.message.includes("already")
        ? "该邮箱已注册，请直接登录。"
        : "注册失败，请稍后重试。",
    };
  }

  // Supabase may return a placeholder user with no identities when the email already exists.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return { status: "error", message: "该邮箱已注册，请直接登录。" };
  }

  return {
    status: "success",
    message: "账号已创建，请先完成邮箱验证，验证后返回登录页继续。",
  };
}

export async function login(
  prevState: AuthActionState = EMPTY_STATE,
  formData: FormData,
): Promise<AuthActionState> {
  void prevState;

  const email = normalizeValue(formData.get("email")).toLowerCase();
  const password = normalizeValue(formData.get("password"));
  const nextPath = normalizeNextPath(normalizeValue(formData.get("next")));

  if (!email || !isValidEmail(email)) {
    return { status: "error", message: "请输入有效邮箱。" };
  }

  if (!password) {
    return { status: "error", message: "请输入密码。" };
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user || !data.session) {
    return { status: "error", message: "邮箱或密码错误。" };
  }

  if (!data.user.email_confirmed_at) {
    return { status: "error", message: "请先完成邮箱验证后再登录。" };
  }

  await setSessionCookies(data.session.access_token, data.session.refresh_token);
  revalidatePath("/", "layout");

  redirect(nextPath || await getPostLoginRedirectPath(data.session.access_token));
}

export async function signOut() {
  await clearSessionCookies();
  revalidatePath("/", "layout");
  redirect("/login");
}
