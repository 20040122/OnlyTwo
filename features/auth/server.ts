import "server-only";

export type CurrentUser = {
  id: string;
  email?: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  return null;
}
