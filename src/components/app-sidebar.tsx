import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, MonitorSmartphone, FileText, Wrench, Bell, Settings, LogOut, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/devices", label: "Devices", icon: MonitorSmartphone },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/claims", label: "Claims", icon: Wrench },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar({ name, email }: { name: string; email: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:w-60">
      <div className="flex items-center gap-2 px-3 py-5 md:px-5">
        <span className="flex size-9 items-center justify-center rounded-md bg-primary/20 text-primary">
          <ShieldCheck className="size-5" />
        </span>
        <span className="hidden text-base font-semibold md:inline">Warrantify</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 md:px-3">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors duration-200 hover:bg-sidebar-accent hover:text-foreground"
            activeProps={{ className: "bg-primary-soft text-foreground font-medium" }}
          >
            <Icon className="size-[18px] shrink-0" />
            <span className="hidden md:inline">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/25 text-xs font-semibold text-foreground">
            {initials || "U"}
          </span>
          <div className="hidden min-w-0 flex-1 md:block">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={signOut}
            aria-label="Sign out"
            className="hidden text-muted-foreground hover:bg-sidebar-accent hover:text-foreground md:inline-flex"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
