import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MessageInput() {
  return (
    <form className="flex items-center gap-3 rounded-[1.8rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(255,255,255,0.62))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_40px_rgba(15,23,42,0.05)]">
      <Input
        className="border-white/80 bg-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_14px_30px_rgba(15,23,42,0.04)] focus:border-rose-200 focus:bg-white focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_0_0_4px_rgba(251,113,133,0.08),0_18px_40px_rgba(15,23,42,0.05)]"
        name="content"
        placeholder="输入想说的话..."
      />
      <Button className="bg-rose-200 text-rose-950 hover:bg-rose-300" type="submit">
        发送
      </Button>
    </form>
  );
}
