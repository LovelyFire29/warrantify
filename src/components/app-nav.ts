import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, MonitorSmartphone, FileText, Wrench, Bell, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Shared by the desktop sidebar (app-sidebar.tsx) and the phone drawer (mobile-nav.tsx).
export const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/devices", label: "Devices", icon: MonitorSmartphone },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/claims", label: "Claims", icon: Wrench },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function useSignOut() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };
}
