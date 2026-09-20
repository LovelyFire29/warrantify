import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useProfile() {
  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) return null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, name, email, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      const metaName = (user.user_metadata?.["name"] as string | undefined) ?? undefined;
      return {
        id: user.id,
        name: profile?.name ?? metaName ?? user.email?.split("@")[0] ?? "There",
        email: profile?.email ?? user.email ?? "",
        avatar_url: profile?.avatar_url ?? null,
      };
    },
  });

  return {
    id: data?.id ?? null,
    name: data?.name ?? "",
    email: data?.email ?? "",
    avatarUrl: data?.avatar_url ?? null,
    firstName: (data?.name ?? "").split(" ")[0] ?? "",
  };
}
