import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MessageInput() {
  return (
    <form className="flex items-center gap-3">
      <Input name="content" placeholder="输入想说的话..." />
      <Button type="submit">发送</Button>
    </form>
  );
}
