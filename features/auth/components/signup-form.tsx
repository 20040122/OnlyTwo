import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignupForm() {
  return (
    <form className="space-y-5">
      <div className="space-y-2.5">
        <label className="text-sm font-medium text-zinc-700/90" htmlFor="nickname">
          昵称
        </label>
        <Input
          className="h-13 rounded-[1.15rem] border-white/80 bg-white/72 px-4 text-[15px] text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_14px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl placeholder:text-zinc-400 focus:border-rose-200 focus:bg-white focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_0_0_4px_rgba(251,113,133,0.08),0_18px_40px_rgba(15,23,42,0.05)]"
          id="nickname"
          name="nickname"
          placeholder="Only Two"
        />
      </div>
      <div className="space-y-2.5">
        <label className="text-sm font-medium text-zinc-700/90" htmlFor="email">
          邮箱
        </label>
        <Input
          className="h-13 rounded-[1.15rem] border-white/80 bg-white/72 px-4 text-[15px] text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_14px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl placeholder:text-zinc-400 focus:border-rose-200 focus:bg-white focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_0_0_4px_rgba(251,113,133,0.08),0_18px_40px_rgba(15,23,42,0.05)]"
          id="email"
          name="email"
          placeholder="you@example.com"
          type="email"
        />
      </div>
      <div className="space-y-2.5">
        <label className="text-sm font-medium text-zinc-700/90" htmlFor="password">
          密码
        </label>
        <Input
          className="h-13 rounded-[1.15rem] border-white/80 bg-white/72 px-4 text-[15px] text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_14px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl placeholder:text-zinc-400 focus:border-rose-200 focus:bg-white focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_0_0_4px_rgba(251,113,133,0.08),0_18px_40px_rgba(15,23,42,0.05)]"
          id="password"
          name="password"
          placeholder="创建一个密码"
          type="password"
        />
      </div>

      <Button
        className="h-13 w-full rounded-full border border-rose-200/80 bg-rose-200 text-[15px] font-semibold text-rose-950 shadow-sm transition-[background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-rose-300 hover:shadow-md"
        type="submit"
      >
        注册
      </Button>
    </form>
  );
}
