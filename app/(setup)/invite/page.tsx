import InvitePanel from "@/features/relationship/components/invite-panel";

export default function InvitePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-16">
      <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            绑定关系
          </h1>
          <p className="text-sm text-zinc-600">
            当前页面承载 relationship_invites 和 active relationship 的入口。
          </p>
        </div>
        <InvitePanel />
      </div>
    </main>
  );
}
