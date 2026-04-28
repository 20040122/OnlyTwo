import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/server";
import { ACCESS_TOKEN_COOKIE } from "@/features/auth/session";
import { getConversationPageData } from "@/features/conversation/queries";
import ChatView from "@/features/message/components/chat-view";
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

  const { conversation, messages } = await getConversationPageData();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? "";

  if (!conversation) {
    return (
      <div className="relative flex flex-1 min-h-0 flex-col overflow-hidden rounded-[2.2rem] border border-amber-200/80 bg-[linear-gradient(145deg,rgba(255,251,235,0.92),rgba(255,247,237,0.78))] shadow-[0_24px_70px_rgba(120,53,15,0.08)] backdrop-blur-2xl">
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
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 min-h-0 flex-col overflow-hidden rounded-[2.2rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.72),rgba(255,255,255,0.52))] shadow-[0_24px_70px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/95 to-transparent" />
      <div className="pointer-events-none absolute -top-14 left-8 h-32 w-32 rounded-full bg-rose-200/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-28 w-28 rounded-full bg-sky-200/20 blur-3xl" />

      <div className="relative border-b border-white/70 px-6 py-5">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
          对话框
        </h2>
      </div>
      <ChatView
        accessToken={accessToken}
        conversationId={conversation.id}
        currentUserId={currentUser.id}
        messages={messages}
      />
    </div>
  );
}
