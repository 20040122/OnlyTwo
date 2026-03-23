type AcceptInvitePageProps = {
  params: Promise<{ code: string }>;
};

export default async function AcceptInvitePage({
  params,
}: AcceptInvitePageProps) {
  const { code } = await params;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-16">
      <div className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          接受邀请
        </h1>
        <p className="text-sm text-zinc-600">
          当前邀请码：<span className="font-medium text-zinc-950">{code}</span>
        </p>
        <p className="text-sm text-zinc-600">
          后续会在这里调用 relationship 接受邀请逻辑，并原子创建关系和会话。
        </p>
      </div>
    </main>
  );
}
