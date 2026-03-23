import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") ?? "/onboarding";

  return NextResponse.redirect(new URL(next, request.url));
}
