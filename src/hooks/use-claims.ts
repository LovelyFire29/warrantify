import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ClaimWithDevice = {
  id: string;
  issue: string | null;
  status: string;
  claim_date: string;
  service_center: string | null;
  created_at: string;
  device_id: string;
  device_name: string;
  device_brand: string | null;
  device_model: string | null;
  device_image: string | null;
};

export function useAllClaims() {
  return useQuery({
    queryKey: ["claims", "all"],
    queryFn: async (): Promise<ClaimWithDevice[]> => {
      const { data, error } = await supabase
        .from("claims")
        .select(
          "id, issue, status, claim_date, service_center, created_at, device_id, devices(name, brand, model, image_url)",
        )
        .order("claim_date", { ascending: false });
      if (error) throw error;

      return (data ?? []).map((claim) => ({
        id: claim.id,
        issue: claim.issue,
        status: claim.status,
        claim_date: claim.claim_date,
        service_center: claim.service_center,
        created_at: claim.created_at,
        device_id: claim.device_id,
        device_name: claim.devices?.name ?? "Unknown device",
        device_brand: claim.devices?.brand ?? null,
        device_model: claim.devices?.model ?? null,
        device_image: claim.devices?.image_url ?? null,
      }));
    },
  });
}

export function useClaimDocuments(deviceId: string | null) {
  return useQuery({
    enabled: Boolean(deviceId),
    queryKey: ["documents", deviceId ?? "none"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("id, type, file_url, uploaded_at")
        .eq("device_id", deviceId!)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpdateClaimStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("claims").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["claims"] }),
  });
}

export type NewClaimInput = {
  device_id: string;
  issue: string;
  service_center: string;
};

export function useCreateAnyClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewClaimInput) => {
      const { error } = await supabase.from("claims").insert({
        device_id: input.device_id,
        issue: input.issue || null,
        service_center: input.service_center || null,
        status: "submitted",
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["claims"] }),
  });
}
