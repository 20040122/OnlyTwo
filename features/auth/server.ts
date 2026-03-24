import "server-only";

import { cookies } from "next/headers";

import { createServerSupabaseClient } from "@/lib/supabase";

export type CurrentUser = {
  id: string;
  email?: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("only-two-access-token")?.value;

  if (!accessToken) {
    return null;
  }

  const supabase = createServerSupabaseClient(accessToken);
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return {
    id: data.user.id,
    email: data.user.email,
  };
}
