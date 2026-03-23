import type { ReactNode } from "react";

import PageShell from "@/components/layout/page-shell";

type ChatLayoutProps = {
  children: ReactNode;
};

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <PageShell
      title="聊天区"
      description="这里会接入登录态校验、profile 完整性检查和 relationship 守卫。"
    >
      {children}
    </PageShell>
  );
}
