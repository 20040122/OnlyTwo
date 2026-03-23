import "server-only";

export type Profile = {
  id: string;
  nickname: string;
  avatarUrl?: string | null;
};

export async function getCurrentProfile(): Promise<Profile | null> {
  return null;
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  return false;
}
