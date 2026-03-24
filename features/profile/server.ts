import "server-only";

import { cookies } from "next/headers";

import { createServerSupabaseClient } from "@/lib/supabase";

export type Profile = {
  id: string;
  nickname: string;
  avatarUrl?: string | null;
  status: "active" | "inactive";
};

export async function getCurrentProfile(): Promise<Profile | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("only-two-access-token")?.value;

  if (!accessToken) {
    return null;
  }

  const supabase = createServerSupabaseClient(accessToken);
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nickname, avatar_url, status")
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    nickname: data.nickname,
    avatarUrl: data.avatar_url,
    status: data.status,
  };
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  return (await getCurrentProfile()) !== null;
}
