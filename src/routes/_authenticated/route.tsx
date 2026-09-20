import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ensureAccountReady } from "@/lib/seed-data";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    // Google returns straight to /dashboard and never touches the /auth form handlers,
    // so make sure the account has its profile row and starter data before rendering.
    const meta = data.user.user_metadata;
    await ensureAccountReady(
      data.user.id,
      data.user.email ?? "",
      (meta?.["name"] ?? meta?.["full_name"]) as string | undefined,
    );
    return { user: data.user };
  },
  component: () => <Outlet />,
});
