import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "device-documents";

export type DocumentWithDevice = {
  id: string;
  type: string;
  file_url: string | null;
  uploaded_at: string;
  device_id: string;
  device_name: string;
  device_brand: string | null;
};

export function useAllDocuments() {
  return useQuery({
    queryKey: ["documents", "all"],
    queryFn: async (): Promise<DocumentWithDevice[]> => {
      const { data, error } = await supabase
        .from("documents")
        .select("id, type, file_url, uploaded_at, device_id, devices(name, brand)")
        .order("uploaded_at", { ascending: false });
      if (error) throw error;

      return (data ?? []).map((doc) => ({
        id: doc.id,
        type: doc.type,
        file_url: doc.file_url,
        uploaded_at: doc.uploaded_at,
        device_id: doc.device_id,
        device_name: doc.devices?.name ?? "Unknown device",
        device_brand: doc.devices?.brand ?? null,
      }));
    },
  });
}

export function useDeleteAnyDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (doc: DocumentWithDevice) => {
      if (doc.file_url) await supabase.storage.from(BUCKET).remove([doc.file_url]);
      const { error } = await supabase.from("documents").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });
}
