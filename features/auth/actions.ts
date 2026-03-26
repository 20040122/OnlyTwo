"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  getSessionCookieOptions,
} from "@/features/auth/session";
import { upsertProfileForUser } from "@/features/profile/actions";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase/server";

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

function buildSignupEmailRedirectUrl(headerList: Headers) {
  const callbackUrl = new URL("/callback", getBaseUrl(headerList));
  callbackUrl.searchParams.set("next", "/login?verified=1");

  return callbackUrl.toString();
}

function getSignupErrorMessage(errorMessage: string) {
  const normalizedMessage = errorMessage.toLowerCase();

  if (normalizedMessage.includes("already")) {
    return "该邮箱已注册，请直接登录。";
  }

  if (
    (normalizedMessage.includes("redirect") && normalizedMessage.includes("allow")) ||
    normalizedMessage.includes("invalid redirect url")
  ) {
    return "注册失败：Supabase Auth 的 Redirect URLs 没有包含当前域名的 /callback 地址。";
  }

  if (
    normalizedMessage.includes("error sending confirmation email") ||
    normalizedMessage.includes("smtp")
  ) {
    return "注册失败：Supabase 暂时无法发送验证邮件，请检查 Auth 邮件配置。";
  }

  if (
    normalizedMessage.includes("email rate limit") ||
    normalizedMessage.includes("over_email_send_rate_limit") ||
    normalizedMessage.includes("rate limit")
  ) {
    return "注册失败：验证邮件发送过于频繁，请稍后再试。";
  }

  if (normalizedMessage.includes("signups not allowed")) {
    return "注册失败：当前 Supabase 项目已关闭注册。";
  }

  return `注册失败：${errorMessage}`;
}

async function setSessionCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  const cookieOptions = getSessionCookieOptions();

  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...cookieOptions,
  });
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...cookieOptions,
  });
}

async function clearSessionCookies() {
  const cookieStore = await cookies();
  const cookieOptions = getSessionCookieOptions();

  cookieStore.set(ACCESS_TOKEN_COOKIE, "", {
    ...cookieOptions,
    maxAge: 0,
  });
  cookieStore.set(REFRESH_TOKEN_COOKIE, "", {
    ...cookieOptions,
    maxAge: 0,
  });
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

async function bootstrapProfileAfterLogin(
  accessToken: string,
  userId: string,
  nickname: string,
) {
  const normalizedNickname = nickname.trim();

  if (!normalizedNickname) {
    return;
  }

  const result = await upsertProfileForUser(accessToken, userId, {
    nickname: normalizedNickname,
  });

  if (!result.ok) {
    console.error("Failed to bootstrap profile after login.", result.message);
  }
}

export async function signup(
  prevState: AuthActionState = EMPTY_STATE,
  formData: FormData,
): Promise<AuthActionState> {
  void prevState;

  const email = normalizeValue(formData.get("email")).toLowerCase();
  const password = normalizeValue(formData.get("password"));

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
  const emailRedirectTo = buildSignupEmailRedirectUrl(headerList);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
    },
  });

  if (error) {
    console.error("Supabase signup failed.", error);

    return {
      status: "error",
      message: getSignupErrorMessage(error.message),
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
  await bootstrapProfileAfterLogin(
    data.session.access_token,
    data.user.id,
    typeof data.user.user_metadata?.nickname === "string"
      ? data.user.user_metadata.nickname
      : "",
  );
  revalidatePath("/", "layout");

  redirect(nextPath || await getPostLoginRedirectPath(data.session.access_token));
}

export async function signOut() {
  await clearSessionCookies();
  revalidatePath("/", "layout");
  redirect("/login");
}
