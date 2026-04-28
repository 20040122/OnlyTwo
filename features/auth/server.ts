import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";

import { ACCESS_TOKEN_COOKIE } from "@/features/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email?: string | null;
};

export const getCurrentUser = cache(async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

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
});
