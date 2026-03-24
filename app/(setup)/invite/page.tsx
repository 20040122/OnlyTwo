import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/server";
import VerificationModule from "@/features/relationship/components/verification-module";

export default async function InvitePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?next=/invite");
  }

  return <VerificationModule currentUserId={currentUser.id} />;
}
