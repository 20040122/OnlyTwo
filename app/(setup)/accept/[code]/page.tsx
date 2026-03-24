import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/server";
import VerificationModule from "@/features/relationship/components/verification-module";

type AcceptInvitePageProps = {
  params: Promise<{ code: string }>;
};

export default async function AcceptInvitePage({
  params,
}: AcceptInvitePageProps) {
  const { code } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(`/login?next=/accept/${encodeURIComponent(code)}`);
  }

  return <VerificationModule inviteCode={code} />;
}
