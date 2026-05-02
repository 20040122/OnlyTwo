import type { ReactNode } from "react";

type ChatLayoutProps = {
  children: ReactNode;
};

export default function ChatLayout({ children }: ChatLayoutProps) {
  return <>{children}</>;
}
