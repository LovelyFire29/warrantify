import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetDescription,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV, getInitials, useSignOut } from "@/components/app-nav";

// Phones (below 768px): a slim top bar plus a slide-in drawer with the full labelled navigation.
export function MobileNav({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false);
  const signOut = useSignOut();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  // Any navigation closes the drawer, however it was triggered.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // If the screen grows into the desktop layout while the drawer is open (e.g. rotating a tablet),
  // close it so the page is never left locked behind an invisible modal.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (query.matches) setOpen(false);
    };
    query.addEventListener("change", closeOnDesktop);
    return () => query.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-sidebar-border bg-sidebar/95 px-3 backdrop-blur md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            className="text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>

        <SheetPortal>
          <SheetOverlay className="bg-black/60 data-[state=open]:duration-300 data-[state=closed]:duration-200 motion-reduce:animate-none motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none" />
          <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-sidebar-border bg-sidebar shadow-2xl ease-in-out focus:outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-left data-[state=open]:duration-300 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=closed]:duration-200 motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SheetDescription className="sr-only">
              Pages of your Warrantify account
            </SheetDescription>

            <div className="flex items-center justify-between py-4 pl-5 pr-3">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-md bg-primary/20 text-primary">
                  <ShieldCheck className="size-5" />
                </span>
                <span className="text-base font-semibold">Warrantify</span>
              </div>
              <DialogPrimitive.Close
                aria-label="Close menu"
                className="grid size-10 place-items-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-sidebar-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-5" />
              </DialogPrimitive.Close>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
              {NAV.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-3 text-sm text-muted-foreground transition-colors duration-200 hover:bg-sidebar-accent hover:text-foreground"
                  activeProps={{ className: "bg-primary-soft text-foreground font-medium" }}
                >
                  <Icon className="size-[18px] shrink-0" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>

            <div className="border-t border-sidebar-border p-3">
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                aria-label="Your profile and settings"
                className="flex items-center gap-3 rounded-md p-2 transition-colors duration-200 hover:bg-sidebar-accent active:bg-sidebar-accent"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/25 text-xs font-semibold text-foreground">
                  {getInitials(name) || "U"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{name}</p>
                  <p className="truncate text-xs text-muted-foreground">{email}</p>
                </div>
              </Link>
              <Button
                type="button"
                variant="ghost"
                onClick={signOut}
                className="mt-1 h-11 w-full justify-start gap-3 px-4 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              >
                <LogOut className="size-[18px]" />
                Sign out
              </Button>
            </div>
          </DialogPrimitive.Content>
        </SheetPortal>
      </Sheet>

      <Link to="/dashboard" className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-md bg-primary/20 text-primary">
          <ShieldCheck className="size-[18px]" />
        </span>
        <span className="text-base font-semibold">Warrantify</span>
      </Link>
    </header>
  );
}
