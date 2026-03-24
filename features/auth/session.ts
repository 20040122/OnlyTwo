import { createServerSupabaseClient } from "@/lib/supabase/server";

export const ACCESS_TOKEN_COOKIE = "only-two-access-token";
export const REFRESH_TOKEN_COOKIE = "only-two-refresh-token";
export const ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 7;
const SESSION_REFRESH_BUFFER_IN_SECONDS = 60;

type SessionCookie = {
  name: string;
  value: string;
};

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  return Buffer.from(padded, "base64").toString("utf8");
}

function getAccessTokenExpiry(accessToken: string) {
  try {
    const [, payload] = accessToken.split(".");

    if (!payload) {
      return null;
    }

    const parsedPayload = JSON.parse(decodeBase64Url(payload)) as { exp?: number };
    return typeof parsedPayload.exp === "number" ? parsedPayload.exp : null;
  } catch {
    return null;
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_WEEK_IN_SECONDS,
  };
}

export function shouldRefreshSession(accessToken?: string | null) {
  if (!accessToken) {
    return true;
  }

  const expiresAt = getAccessTokenExpiry(accessToken);

  if (!expiresAt) {
    return true;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return expiresAt - nowInSeconds <= SESSION_REFRESH_BUFFER_IN_SECONDS;
}

export function serializeRequestCookies(cookies: SessionCookie[]) {
  return cookies.map(({ name, value }) => `${name}=${encodeURIComponent(value)}`).join("; ");
}

export async function refreshServerSession(refreshToken: string) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session) {
    return null;
  }

  return data.session;
}
