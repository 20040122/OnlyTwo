import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { ACCESS_TOKEN_COOKIE } from "@/features/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: "登录状态已失效，请重新登录。" },
      { status: 401 },
    );
  }

  const { code } = await request.json().catch(() => ({ code: "" }));
  const normalizedCode = typeof code === "string" ? code.trim().toUpperCase() : "";

  if (!normalizedCode) {
    return NextResponse.json(
      { message: "请提供有效的邀请码。" },
      { status: 400 },
    );
  }

  const supabase = createServerSupabaseClient(accessToken);
  const { error } = await supabase.rpc("accept_relationship_invite", {
    p_code: normalizedCode,
  });

  if (error) {
    const message = error.message.toLowerCase();
    const details = error.details?.toLowerCase() ?? "";
    const hint = error.hint?.toLowerCase() ?? "";
    const combined = `${message} ${details} ${hint}`;

    let displayMessage = "绑定失败，请稍后重试。";

    if (message.includes("invite not found")) {
      displayMessage = "邀请码不存在，可能对方已经重新生成了新的邀请码。";
    } else if (message.includes("expired")) {
      displayMessage = "邀请码已过期。";
    } else if (message.includes("own invite")) {
      displayMessage = "不能接受自己生成的邀请码。";
    } else if (message.includes("active relationship")) {
      displayMessage = "你或对方已经存在有效绑定关系。";
    } else if (message.includes("no longer pending")) {
      displayMessage = "邀请码已被使用或已失效，可能对方已经重新生成了新的邀请码。";
    } else if (
      combined.includes("accept_relationship_invite")
      || combined.includes("function public.accept_relationship_invite")
    ) {
      displayMessage = "数据库迁移还没执行，缺少绑定函数。请先运行最新 Supabase migration。";
    } else if (
      combined.includes("relationships_user_a_id_fkey")
      || combined.includes("relationships_user_b_id_fkey")
      || combined.includes("profiles")
    ) {
      displayMessage = "双方需要先完成资料初始化后才能绑定。";
    }

    const status =
      message.includes("auth") ? 401
        : message.includes("not found") || message.includes("no longer pending") ? 404
          : message.includes("expired") ? 410
            : message.includes("own invite") || message.includes("active relationship") ? 409
              : 500;

    return NextResponse.json({ message: displayMessage }, { status });
  }

  return NextResponse.json({ success: true });
}
