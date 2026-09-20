import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Preferences = {
  email_alerts: boolean;
  inapp_alerts: boolean;
  reminder_days: number;
  theme: string;
};

export const DEFAULT_PREFERENCES: Preferences = {
  email_alerts: true,
  inapp_alerts: true,
  reminder_days: 30,
  theme: "dark",
};

export function usePreferences() {
  return useQuery({
    queryKey: ["preferences"],
    queryFn: async (): Promise<Preferences> => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) return DEFAULT_PREFERENCES;
      const { data, error } = await supabase
        .from("profiles")
        .select("email_alerts, inapp_alerts, reminder_days, theme")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return {
        email_alerts: data?.email_alerts ?? DEFAULT_PREFERENCES.email_alerts,
        inapp_alerts: data?.inapp_alerts ?? DEFAULT_PREFERENCES.inapp_alerts,
        reminder_days: data?.reminder_days ?? DEFAULT_PREFERENCES.reminder_days,
        theme: data?.theme ?? DEFAULT_PREFERENCES.theme,
      };
    },
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Preferences>) => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new Error("You need to be signed in.");
      const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["preferences"] }),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: { name?: string; avatar_url?: string | null }) => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new Error("You need to be signed in.");
      const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
}
