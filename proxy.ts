import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  getSessionCookieOptions,
  refreshServerSession,
  serializeRequestCookies,
  shouldRefreshSession,
} from "@/features/auth/session";

function buildRequestHeaders(request: NextRequest, accessToken: string, refreshToken: string) {
  request.cookies.set(ACCESS_TOKEN_COOKIE, accessToken);
  request.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("cookie", serializeRequestCookies(request.cookies.getAll()));

  return requestHeaders;
}

function clearSession(request: NextRequest) {
  request.cookies.delete(ACCESS_TOKEN_COOKIE);
  request.cookies.delete(REFRESH_TOKEN_COOKIE);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("cookie", serializeRequestCookies(request.cookies.getAll()));

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  const cookieOptions = getSessionCookieOptions();

  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    ...cookieOptions,
    maxAge: 0,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    ...cookieOptions,
    maxAge: 0,
  });
  return response;
}

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken || !shouldRefreshSession(accessToken)) {
    return NextResponse.next();
  }

  const session = await refreshServerSession(refreshToken);

  if (!session?.access_token || !session.refresh_token) {
    return clearSession(request);
  }

  const requestHeaders = buildRequestHeaders(
    request,
    session.access_token,
    session.refresh_token,
  );
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  const cookieOptions = getSessionCookieOptions();

  response.cookies.set(ACCESS_TOKEN_COOKIE, session.access_token, cookieOptions);
  response.cookies.set(REFRESH_TOKEN_COOKIE, session.refresh_token, cookieOptions);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
