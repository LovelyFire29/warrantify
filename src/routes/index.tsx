import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureAccountReady } from "@/lib/account-setup";
import { LandingPage } from "@/components/landing-page";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Warrantify — Household Warranty & Device Tracker" },
      {
        name: "description",
        content:
          "Warrantify keeps every appliance and gadget warranty in one place: automatic status tracking, stored invoices, expiry reminders, and repair claims.",
      },
      { property: "og:title", content: "Warrantify — Household Warranty & Device Tracker" },
      {
        property: "og:description",
        content: "Track warranty status, store invoices, get expiry reminders, and manage repair claims.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (!user) return;
      // Covers the Google sign-in round-trip, which lands back here.
      await ensureAccountReady(user.id, user.email ?? "", user.user_metadata?.["name"] as string | undefined);
      navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  return <LandingPage />;
}
