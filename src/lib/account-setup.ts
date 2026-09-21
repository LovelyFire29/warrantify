import { supabase } from "@/integrations/supabase/client";

async function createProfile(userId: string, email: string, name?: string) {
  const { data: profile, error: lookupError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (profile) return;

  const { error: insertError } = await supabase.from("profiles").insert({
    id: userId,
    name: name?.trim() || email.split("@")[0] || "Household",
    email,
  });
  if (insertError) throw insertError;
}

const accountSetup = new Map<string, Promise<void>>();

/**
 * Makes sure the signed-in user has a profile row (settings are saved on it). Accounts always
 * start empty: nothing here creates devices, warranties, claims or notifications.
 * Safe to call from any entry point, including ones that skip the sign-in form (e.g. returning
 * from Google): repeat and concurrent calls share one result per page load, and a failed attempt
 * is logged and retried on the next call.
 */
export function ensureAccountReady(userId: string, email: string, name?: string): Promise<void> {
  let pending = accountSetup.get(userId);
  if (!pending) {
    pending = createProfile(userId, email, name).catch((error: unknown) => {
      accountSetup.delete(userId);
      console.error("[account] setup failed", error);
    });
    accountSetup.set(userId, pending);
  }
  return pending;
}
