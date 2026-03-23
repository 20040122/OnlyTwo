import { Button } from "@/components/ui/button";

export default function InvitePanel() {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl bg-zinc-50 p-5">
        <p className="text-sm text-zinc-600">当前有效邀请码</p>
        <p className="mt-2 text-2xl font-semibold tracking-[0.2em] text-zinc-950">
          ONLYTWO
        </p>
      </div>
      <div className="flex gap-3">
        <Button>生成邀请码</Button>
        <Button className="bg-zinc-200 text-zinc-950 hover:bg-zinc-300">
          复制链接
        </Button>
      </div>
    </section>
  );
}
