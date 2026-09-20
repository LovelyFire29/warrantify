import { supabase } from "@/integrations/supabase/client";

type SeedDevice = {
  name: string;
  brand: string;
  model: string;
  model_number: string;
  serial_number: string;
  category: string;
  purchase_date: string;
  purchase_price: number;
  seller: string;
  invoice_number: string;
  warranty: { type: string; start_date: string; end_date: string; notes: string };
};

const SEED_DEVICES: SeedDevice[] = [
  {
    name: 'MacBook Pro 14"',
    brand: "Apple",
    model: "MacBook Pro 14 M4 Pro",
    model_number: "MX2H3",
    serial_number: "C02XK1QNJGH7",
    category: "Laptop",
    purchase_date: "2026-02-14",
    purchase_price: 2299,
    seller: "Apple Store",
    invoice_number: "APL-2026-88214",
    warranty: {
      type: "manufacturer",
      start_date: "2026-02-14",
      end_date: "2027-02-14",
      notes: "AppleCare+ eligible until Feb 2027.",
    },
  },
  {
    name: "Samsung Bespoke Refrigerator",
    brand: "Samsung",
    model: "Bespoke 4-Door Flex",
    model_number: "RF29BB8600AP",
    serial_number: "0J4T3PBW400123",
    category: "Appliance",
    purchase_date: "2024-06-02",
    purchase_price: 3199,
    seller: "Best Buy",
    invoice_number: "BBY-4471902",
    warranty: {
      type: "extended",
      start_date: "2024-06-02",
      end_date: "2026-10-18",
      notes: "5-year sealed-system coverage on compressor.",
    },
  },
  {
    name: "Sony BRAVIA 9 75\"",
    brand: "Sony",
    model: "BRAVIA 9 Mini LED",
    model_number: "K-75XR90",
    serial_number: "SN9931004221",
    category: "Television",
    purchase_date: "2025-11-28",
    purchase_price: 3499,
    seller: "Costco",
    invoice_number: "CST-2025-33871",
    warranty: {
      type: "seller",
      start_date: "2025-11-28",
      end_date: "2027-11-28",
      notes: "Costco concierge extends manufacturer warranty by 1 year.",
    },
  },
  {
    name: "Dyson V15 Detect",
    brand: "Dyson",
    model: "V15 Detect Absolute",
    model_number: "SV47",
    serial_number: "DY-SV47-772410",
    category: "Appliance",
    purchase_date: "2024-03-09",
    purchase_price: 749,
    seller: "Dyson.com",
    invoice_number: "DYS-556120",
    warranty: {
      type: "manufacturer",
      start_date: "2024-03-09",
      end_date: "2026-03-09",
      notes: "Battery replaced under warranty in Jan 2026.",
    },
  },
  {
    name: "iPhone 16 Pro",
    brand: "Apple",
    model: "iPhone 16 Pro 256GB",
    model_number: "MYNJ3",
    serial_number: "F17GQ2LKPX",
    category: "Phone",
    purchase_date: "2025-09-22",
    purchase_price: 1099,
    seller: "Verizon",
    invoice_number: "VZN-2025-99120",
    warranty: {
      type: "manufacturer",
      start_date: "2025-09-22",
      end_date: "2026-09-22",
      notes: "Limited one-year warranty.",
    },
  },
  {
    name: "Bosch 800 Series Dishwasher",
    brand: "Bosch",
    model: "800 Series Crystal Dry",
    model_number: "SHP78CM5N",
    serial_number: "BSH-78CM5N-0091",
    category: "Appliance",
    purchase_date: "2023-08-15",
    purchase_price: 1349,
    seller: "Home Depot",
    invoice_number: "HD-2023-71204",
    warranty: {
      type: "manufacturer",
      start_date: "2023-08-15",
      end_date: "2025-08-15",
      notes: "Expired — extended plan was declined at purchase.",
    },
  },
  {
    name: "LG WashTower",
    brand: "LG",
    model: "WashTower Smart Laundry Center",
    model_number: "WKEX200HBA",
    serial_number: "LG-WK200-441209",
    category: "Appliance",
    purchase_date: "2025-05-30",
    purchase_price: 2699,
    seller: "Lowe's",
    invoice_number: "LWS-2025-11833",
    warranty: {
      type: "extended",
      start_date: "2025-05-30",
      end_date: "2028-05-30",
      notes: "3-year protection plan, includes in-home service.",
    },
  },
];

/**
 * One-time starter content created right after sign-up so a brand-new account
 * has something to look at. Never called on page load.
 */
export async function seedStarterData(userId: string) {
  const { data: devices, error } = await supabase
    .from("devices")
    .insert(
      SEED_DEVICES.map(({ warranty: _w, ...d }) => ({ ...d, user_id: userId })),
    )
    .select("id, name");
  if (error) throw error;
  if (!devices) return;

  const byName = new Map(devices.map((d) => [d.name, d.id]));

  await supabase.from("warranties").insert(
    SEED_DEVICES.flatMap((d) => {
      const id = byName.get(d.name);
      return id ? [{ device_id: id, ...d.warranty }] : [];
    }),
  );

  const fridge = byName.get("Samsung Bespoke Refrigerator");
  const dyson = byName.get("Dyson V15 Detect");
  const bosch = byName.get("Bosch 800 Series Dishwasher");

  if (fridge && dyson) {
    await supabase.from("claims").insert([
      {
        device_id: fridge,
        issue: "Ice maker stopped dispensing",
        status: "under_inspection",
        claim_date: "2026-08-11",
        service_center: "Samsung Care — Austin, TX",
      },
      {
        device_id: dyson,
        issue: "Battery drains after 6 minutes",
        status: "completed",
        claim_date: "2026-01-19",
        service_center: "Dyson Service Center",
      },
    ]);
  }

  if (bosch) {
    await supabase.from("service_history").insert([
      {
        device_id: bosch,
        issue: "Drain pump replacement",
        service_center: "Bosch Authorized Repair",
        status: "repaired",
        cost: 214.5,
        date: "2026-04-02",
      },
    ]);
  }

  const notifications = [
    {
      user_id: userId,
      device_id: dyson ?? null,
      message: "Dyson V15 Detect warranty expired 5 months ago — consider an extended plan.",
      link: "/devices",
    },
    {
      user_id: userId,
      device_id: fridge ?? null,
      message: "Samsung Bespoke Refrigerator warranty expires in 56 days.",
      link: "/devices",
    },
    {
      user_id: userId,
      device_id: byName.get("iPhone 16 Pro") ?? null,
      message: "iPhone 16 Pro warranty expires on Sep 22, 2026.",
      link: "/devices",
    },
    {
      user_id: userId,
      device_id: fridge ?? null,
      message: "Claim moved to Under inspection at Samsung Care — Austin, TX.",
      link: "/claims",
    },
  ];
  await supabase.from("notifications").insert(notifications);
}

async function createProfileAndStarterData(userId: string, email: string, name?: string) {
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

  const { count } = await supabase
    .from("devices")
    .select("id", { count: "exact", head: true });
  if (!count) await seedStarterData(userId);
}

const accountSetup = new Map<string, Promise<void>>();

/**
 * Creates the profile row and, if the account is empty, the starter content.
 * Safe to call from any entry point, including ones that skip the sign-in form
 * (e.g. returning from Google): repeat and concurrent calls share one result
 * per page load, and a failed attempt is logged and retried on the next call.
 */
export function ensureAccountReady(userId: string, email: string, name?: string): Promise<void> {
  let pending = accountSetup.get(userId);
  if (!pending) {
    pending = createProfileAndStarterData(userId, email, name).catch((error: unknown) => {
      accountSetup.delete(userId);
      console.error("[account] setup failed", error);
    });
    accountSetup.set(userId, pending);
  }
  return pending;
}
