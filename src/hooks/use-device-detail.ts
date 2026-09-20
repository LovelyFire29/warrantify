import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "device-documents";

export type WarrantyRecord = {
  id: string;
  type: string;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
};

export type DocumentRecord = {
  id: string;
  type: string;
  file_url: string | null;
  uploaded_at: string;
};

export type ServiceRecord = {
  id: string;
  issue: string | null;
  service_center: string | null;
  status: string;
  cost: number | null;
  date: string | null;
};

export type ClaimRecord = {
  id: string;
  issue: string | null;
  status: string;
  claim_date: string;
  service_center: string | null;
};

export function useDeviceExtras(deviceId: string) {
  const warranties = useQuery({
    queryKey: ["warranties", deviceId],
    queryFn: async (): Promise<WarrantyRecord[]> => {
      const { data, error } = await supabase
        .from("warranties")
        .select("id, type, start_date, end_date, notes")
        .eq("device_id", deviceId)
        .order("end_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const documents = useQuery({
    queryKey: ["documents", deviceId],
    queryFn: async (): Promise<DocumentRecord[]> => {
      const { data, error } = await supabase
        .from("documents")
        .select("id, type, file_url, uploaded_at")
        .eq("device_id", deviceId)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const service = useQuery({
    queryKey: ["service_history", deviceId],
    queryFn: async (): Promise<ServiceRecord[]> => {
      const { data, error } = await supabase
        .from("service_history")
        .select("id, issue, service_center, status, cost, date")
        .eq("device_id", deviceId)
        .order("date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const claims = useQuery({
    queryKey: ["claims", deviceId],
    queryFn: async (): Promise<ClaimRecord[]> => {
      const { data, error } = await supabase
        .from("claims")
        .select("id, issue, status, claim_date, service_center")
        .eq("device_id", deviceId)
        .order("claim_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return { warranties, documents, service, claims };
}

export function useUploadDocument(deviceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, type }: { file: File; type: string }) => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new Error("You need to be signed in.");
      const path = `${userId}/${deviceId}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
      if (uploadError) throw uploadError;
      const { error } = await supabase.from("documents").insert({ device_id: deviceId, type, file_url: path });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents", deviceId] }),
  });
}

export function useDeleteDocument(deviceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (doc: DocumentRecord) => {
      if (doc.file_url) await supabase.storage.from(BUCKET).remove([doc.file_url]);
      const { error } = await supabase.from("documents").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents", deviceId] }),
  });
}

export async function getDocumentUrl(path: string, download = false) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60, download ? { download: true } : undefined);
  if (error) throw error;
  return data.signedUrl;
}

export function useCreateClaim(deviceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { issue: string; service_center: string }) => {
      const { error } = await supabase.from("claims").insert({
        device_id: deviceId,
        issue: input.issue,
        service_center: input.service_center || null,
        status: "submitted",
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["claims", deviceId] }),
  });
}

export function documentFileName(doc: DocumentRecord) {
  if (!doc.file_url) return "Untitled document";
  const raw = doc.file_url.split("/").pop() ?? "document";
  return raw.replace(/^\d+-/, "");
}
