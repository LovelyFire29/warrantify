import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { useProfile } from "@/hooks/use-profile";

export function AppShell({ children }: { children: ReactNode }) {
  const { name, email } = useProfile();

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar name={name} email={email} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
