import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/server";
import MessageInput from "@/features/message/components/message-input";
import MessageList from "@/features/message/components/message-list";
import { getCurrentProfile } from "@/features/profile/server";
import { getActiveRelationship } from "@/features/relationship/server";

export default async function ChatPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?next=/chat");
  }

  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/onboarding");
  }

  if (profile.status !== "inactive") {
    redirect("/invite");
  }

  const activeRelationship = await getActiveRelationship();

  if (!activeRelationship) {
    redirect("/invite");
  }

  return (
    <div className="relative flex min-h-[78vh] flex-col overflow-hidden rounded-[2.2rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.72),rgba(255,255,255,0.52))] shadow-[0_24px_70px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/95 to-transparent" />
      <div className="pointer-events-none absolute -top-14 left-8 h-32 w-32 rounded-full bg-rose-200/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-28 w-28 rounded-full bg-sky-200/20 blur-3xl" />

      <div className="relative border-b border-white/70 px-6 py-5">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
          对话框
        </h2>
      </div>
      <MessageList />
      <div className="relative border-t border-white/70 p-4 sm:p-5">
        <MessageInput />
      </div>
    </div>
  );
}
