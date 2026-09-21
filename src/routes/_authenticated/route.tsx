import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ensureAccountReady } from "@/lib/account-setup";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const { id, email } = user;
  const meta = user.user_metadata;
  const name = (meta?.["name"] ?? meta?.["full_name"]) as string | undefined;

  // Google returns straight to /dashboard and never touches the /auth form handlers, so make sure
  // the account has its profile row. This runs after the layout renders, not in beforeLoad: extra
  // network round trips inside the route load make it easy for the router to be cancelled and
  // restarted mid-flight (the token being cleaned out of the URL does exactly that), which can
  // leave the page blank.
  useEffect(() => {
    ensureAccountReady(id, email ?? "", name).then(() => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      void queryClient.invalidateQueries({ queryKey: ["preferences"] });
    });
  }, [id, email, name, queryClient]);

  return <Outlet />;
}
