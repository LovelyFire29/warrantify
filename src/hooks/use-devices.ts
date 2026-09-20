import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { daysRemaining, warrantyStatus, type WarrantyStatus } from "@/lib/warranty";

export type DeviceRow = {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  category: string | null;
  image_url: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  serial_number: string | null;
  seller: string | null;
  invoice_number: string | null;
  model_number: string | null;
  created_at: string;
  endDate: string | null;
  status: WarrantyStatus;
  days: number;
};

export function useDevices() {
  return useQuery({
    queryKey: ["devices"],
    queryFn: async (): Promise<DeviceRow[]> => {
      const { data, error } = await supabase
        .from("devices")
        .select(
          "id, name, brand, model, category, image_url, purchase_date, purchase_price, serial_number, seller, invoice_number, model_number, created_at, warranties(end_date)",
        )
        .order("purchase_date", { ascending: false });
      if (error) throw error;

      return (data ?? []).map((device) => {
        const ends = (device.warranties ?? [])
          .map((w) => w.end_date)
          .filter((d): d is string => Boolean(d))
          .sort();
        const endDate = ends.length ? ends[ends.length - 1]! : null;
        return {
          id: device.id,
          name: device.name,
          brand: device.brand,
          model: device.model,
          category: device.category,
          image_url: device.image_url,
          purchase_date: device.purchase_date,
          purchase_price: device.purchase_price,
          serial_number: device.serial_number,
          seller: device.seller,
          invoice_number: device.invoice_number,
          model_number: device.model_number,
          created_at: device.created_at,
          endDate,
          status: warrantyStatus(endDate),
          days: daysRemaining(endDate),
        };
      });
    },
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("devices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });
}

export type NewDeviceInput = {
  name: string;
  brand: string;
  model: string;
  category: string;
  purchase_date: string;
  warranty_end: string;
};

export function useCreateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewDeviceInput) => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new Error("You need to be signed in.");

      const { data: device, error } = await supabase
        .from("devices")
        .insert({
          user_id: userId,
          name: input.name,
          brand: input.brand || null,
          model: input.model || null,
          category: input.category || null,
          purchase_date: input.purchase_date || null,
        })
        .select("id")
        .single();
      if (error) throw error;

      if (input.warranty_end) {
        const { error: warrantyError } = await supabase.from("warranties").insert({
          device_id: device.id,
          type: "manufacturer",
          start_date: input.purchase_date || null,
          end_date: input.warranty_end,
        });
        if (warrantyError) throw warrantyError;
      }
      return device.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, message, link, is_read, created_at")
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data ?? [];
    },
  });
}
