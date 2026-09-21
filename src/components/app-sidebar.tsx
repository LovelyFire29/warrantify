import { Link } from "@tanstack/react-router";
import { LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV, getInitials, useSignOut } from "@/components/app-nav";

// Persistent sidebar: desktop and tablet only (768px and up). Phones use the drawer in mobile-nav.tsx.
export function AppSidebar({ name, email }: { name: string; email: string }) {
  const signOut = useSignOut();
  const initials = getInitials(name);

  return (
    <aside className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex md:w-60">
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
