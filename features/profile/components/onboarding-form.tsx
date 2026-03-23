import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OnboardingForm() {
  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="nickname">
          昵称
        </label>
        <Input id="nickname" name="nickname" placeholder="给彼此起个专属昵称" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="avatarUrl">
          头像 URL
        </label>
        <Input id="avatarUrl" name="avatarUrl" placeholder="https://example.com/avatar.png" />
      </div>
      <Button className="w-full" type="submit">
        保存资料
      </Button>
    </form>
  );
}
