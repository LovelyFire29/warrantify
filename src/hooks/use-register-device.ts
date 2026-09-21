import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "device-documents";

export type RegisterDeviceInput = {
  name: string;
  brand: string;
  model: string;
  model_number: string;
  serial_number: string;
  category: string;
  purchase_date: string;
  purchase_price: string;
  seller: string;
  invoice_number: string;
  warranty_type: string;
  duration: string;
  duration_unit: "months" | "years";
  files: File[];
};

/** Warranty end date derived from purchase date + duration. */
export function computeEndDate(
  purchaseDate: string,
  duration: string,
  unit: "months" | "years",
): string | null {
  const amount = Number(duration);
  if (!purchaseDate || !Number.isFinite(amount) || amount <= 0) return null;
  const start = new Date(`${purchaseDate}T00:00:00`);
  const months = unit === "years" ? amount * 12 : amount;
  const end = new Date(start);
  end.setMonth(end.getMonth() + Math.round(months));
  return end.toISOString().slice(0, 10);
}

export function useRegisterDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RegisterDeviceInput) => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new Error("You need to be signed in.");

      const price = Number(input.purchase_price);

      const { data: device, error } = await supabase
        .from("devices")
        .insert({
          user_id: userId,
          name: input.name.trim(),
          brand: input.brand.trim() || null,
          model: input.model.trim() || null,
          model_number: input.model_number.trim() || null,
          serial_number: input.serial_number.trim() || null,
          category: input.category || null,
          purchase_date: input.purchase_date || null,
          purchase_price: Number.isFinite(price) && input.purchase_price ? price : null,
          seller: input.seller.trim() || null,
          invoice_number: input.invoice_number.trim() || null,
        })
        .select("id")
        .single();
      if (error) throw error;

      const endDate = computeEndDate(input.purchase_date, input.duration, input.duration_unit);
      if (endDate) {
        const { error: warrantyError } = await supabase.from("warranties").insert({
          device_id: device.id,
          type: input.warranty_type || "manufacturer",
          start_date: input.purchase_date || null,
          end_date: endDate,
        });
        if (warrantyError) throw warrantyError;
      }

      // The device is already saved, so a failed file doesn't abort registration; report it instead.
      const failedFiles: string[] = [];
      for (const file of input.files) {
        const path = `${userId}/${device.id}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
        if (uploadError) {
          console.error("[upload] storage upload failed", file.name, uploadError);
          failedFiles.push(file.name);
          continue;
        }
        const { error: documentError } = await supabase.from("documents").insert({
          device_id: device.id,
          type: /invoice|receipt|bill/i.test(file.name) ? "invoice" : "other",
          file_url: path,
        });
        if (documentError) {
          console.error("[upload] could not record document", file.name, documentError);
          failedFiles.push(file.name);
        }
      }

      return { deviceId: device.id, failedFiles };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });
}
