import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/server";
import { ACCESS_TOKEN_COOKIE } from "@/features/auth/session";
import { getConversationPageData } from "@/features/conversation/queries";
import ChatView from "@/features/message/components/chat-view";
import { getCurrentProfile, getProfileById } from "@/features/profile/server";
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

  const partnerId =
    currentUser.id === activeRelationship.userAId
      ? activeRelationship.userBId
      : activeRelationship.userAId;

  const partnerProfile = await getProfileById(partnerId);

  const senderProfiles: Record<string, { nickname: string; avatarUrl: string | null }> = {
    [currentUser.id]: { nickname: profile.nickname, avatarUrl: profile.avatarUrl ?? null },
  };

  if (partnerProfile) {
    senderProfiles[partnerId] = {
      nickname: partnerProfile.nickname,
      avatarUrl: partnerProfile.avatarUrl ?? null,
    };
  }

  const { conversation, messages } = await getConversationPageData();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? "";

  return (
    <main className="relative flex min-h-screen items-stretch justify-center overflow-hidden px-6 py-4 selection:bg-rose-200 selection:text-rose-900">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,241,242,0.95)_0%,rgba(255,247,237,0.88)_22%,rgba(255,251,235,0.86)_40%,rgba(239,246,255,0.84)_58%,rgba(250,245,255,0.88)_78%,rgba(254,242,242,0.94)_100%)] bg-[length:220%_220%] animate-hero-gradient" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[8%] top-[-14%] h-72 w-72 rounded-full bg-rose-200/40 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute -right-[10%] bottom-[-10%] h-72 w-72 rounded-full bg-amber-200/40 blur-3xl sm:h-[26rem] sm:w-[26rem]" />
        <div className="absolute left-[58%] top-[18%] h-48 w-48 rounded-full bg-sky-200/30 blur-3xl sm:h-72 sm:w-72" />
      </div>

      <section className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2.2rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.72),rgba(255,255,255,0.52))] shadow-[0_24px_70px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/95 to-transparent" />
          <div className="pointer-events-none absolute -top-14 left-8 h-32 w-32 rounded-full bg-rose-200/25 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-28 w-28 rounded-full bg-sky-200/20 blur-3xl" />

          {!conversation ? (
            <div className="relative flex flex-1 items-center justify-center px-6 py-12">
              <div className="max-w-md rounded-[1.8rem] border border-amber-200/80 bg-white/80 p-6 text-center shadow-[0_18px_45px_rgba(120,53,15,0.08)]">
                <h2 className="text-lg font-semibold tracking-tight text-amber-950">
                  会话尚未就绪
                </h2>
                <p className="mt-3 text-sm leading-6 text-amber-900/80">
                  当前已检测到绑定关系，但没有找到对应的唯一会话。为避免进入脏状态，聊天页面已暂停展示消息区。
                </p>
                <p className="mt-2 text-sm leading-6 text-amber-900/70">
                  请先检查绑定流程是否完整，或重新进入页面。
                </p>
              </div>
            </div>
          ) : (
            <ChatView
              accessToken={accessToken}
              conversationId={conversation.id}
              currentUserId={currentUser.id}
              messages={messages}
              senderProfiles={senderProfiles}
            />
          )}
        </div>
      </section>
    </main>
  );
}
