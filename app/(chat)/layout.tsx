import type { ReactNode } from "react";

import PageShell from "@/components/layout/page-shell";

type ChatLayoutProps = {
  children: ReactNode;
};

export default function ChatLayout({ children }: ChatLayoutProps) {
  return <PageShell title="你们的空间">{children}</PageShell>;
}
