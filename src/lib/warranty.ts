export type WarrantyStatus = "active" | "expiring" | "expired";

export function daysRemaining(endDate: string | null | undefined, from = new Date()): number {
  if (!endDate) return 0;
  const end = new Date(`${endDate}T00:00:00`);
  const start = new Date(from.toISOString().slice(0, 10) + "T00:00:00");
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

/** Status is always computed from end_date, never stored. */
export function warrantyStatus(endDate: string | null | undefined, from = new Date()): WarrantyStatus {
  const days = daysRemaining(endDate, from);
  if (days < 0) return "expired";
  if (days <= 90) return "expiring";
  return "active";
}

export const statusLabel: Record<WarrantyStatus, string> = {
  active: "Active",
  expiring: "Expiring Soon",
  expired: "Expired",
};

export const statusPillClass: Record<WarrantyStatus, string> = {
  active: "bg-success/15 text-success border-success/30",
  expiring: "bg-warning/15 text-warning border-warning/30",
  expired: "bg-danger/15 text-danger border-danger/30",
};

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.round(days / 7)}w ago`;
}

export function greeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
