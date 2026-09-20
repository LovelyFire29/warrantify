import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutGrid,
  MonitorSmartphone,
  MoreVertical,
  Pencil,
  Plus,
  Rows3,
  Search,
  Trash2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDeleteDevice, useDevices, type DeviceRow } from "@/hooks/use-devices";
import { formatDate } from "@/lib/warranty";
import { cn } from "@/lib/utils";
import { EmptyState, LoadingState, PageHeader, WarrantyStatusPill } from "@/components/app-patterns";

export const Route = createFileRoute("/_authenticated/devices/")({
  head: () => ({
    meta: [
      { title: "Devices — Warrantify" },
      {
        name: "description",
        content:
          "Browse every registered device with search, category, brand, and warranty status filters in table or card view.",
      },
      { property: "og:title", content: "Devices — Warrantify" },
      {
        property: "og:description",
        content: "Search and filter all household devices and their warranty coverage.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DevicesPage,
});

const ALL = "all";

function DaysCell({ days }: { days: number }) {
  return days < 0 ? (
    <span className="text-danger">{Math.abs(days)} days ago</span>
  ) : (
    <span>{days} days</span>
  );
}

function StatusPill({ device }: { device: DeviceRow }) {
  return <WarrantyStatusPill status={device.status} />;
}

function Thumbnail({ device, size = "size-10" }: { device: DeviceRow; size?: string }) {
  if (device.image_url) {
    return (
      <img
        src={device.image_url}
        alt={device.name}
        loading="lazy"
        className={cn(size, "shrink-0 rounded-md border border-border object-cover")}
      />
    );
  }
  return (
    <span
      className={cn(
        size,
        "flex shrink-0 items-center justify-center rounded-md border border-border bg-primary-soft text-primary",
      )}
    >
      <MonitorSmartphone className="size-4" />
    </span>
  );
}

function DevicesPage() {
  const navigate = useNavigate();
  const { data: devices = [], isLoading } = useDevices();
  const deleteDevice = useDeleteDevice();

  const [view, setView] = useState<"table" | "grid">("table");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [brand, setBrand] = useState(ALL);

  const categories = useMemo(
    () => [...new Set(devices.map((d) => d.category).filter((c): c is string => Boolean(c)))].sort(),
    [devices],
  );
  const brands = useMemo(
    () => [...new Set(devices.map((d) => d.brand).filter((b): b is string => Boolean(b)))].sort(),
    [devices],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return devices.filter((device) => {
      const haystack = [device.name, device.brand, device.model, device.category, device.serial_number]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (q && !haystack.includes(q)) return false;
      if (category !== ALL && device.category !== category) return false;
      if (brand !== ALL && device.brand !== brand) return false;
      if (status !== ALL && device.status !== status) return false;
      return true;
    });
  }, [devices, query, category, brand, status]);

  const openDevice = (id: string) =>
    navigate({ to: "/devices/$deviceId", params: { deviceId: id } });

  const removeDevice = (device: DeviceRow) => {
    deleteDevice.mutate(device.id, {
      onSuccess: () => toast.success(`${device.name} deleted.`),
      onError: () => toast.error("Could not delete this device."),
    });
  };

  const hasFilters = Boolean(query) || category !== ALL || brand !== ALL || status !== ALL;

  const kebab = (device: DeviceRow) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Actions for ${device.name}`}
          onClick={(event) => event.stopPropagation()}
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
        <DropdownMenuItem onSelect={() => openDevice(device.id)}>
          <Eye className="size-4" /> View
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => openDevice(device.id)}>
          <Pencil className="size-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem className="text-danger" onSelect={() => removeDevice(device)}>
          <Trash2 className="size-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <PageHeader
          title="Devices"
          subtitle={<>{filtered.length} of {devices.length} {devices.length === 1 ? "device" : "devices"} shown</>}
          action={<Button asChild>
            <Link to="/devices/new">
              <Plus className="size-4" /> Register Device
            </Link>
          </Button>}
        />

        <section
          className="card-surface animate-fade-up mt-6 flex flex-wrap items-center gap-3 p-4"
          style={{ animationDelay: "80ms" }}
        >
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, brand, model, or serial…"
              className="pl-9"
              aria-label="Search devices"
            />
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-40" aria-label="Filter by category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All categories</SelectItem>
              {categories.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expiring">Expiring Soon</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>

          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger className="w-36" aria-label="Filter by brand">
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All brands</SelectItem>
              {brands.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 rounded-md border border-border p-1">
            <Button
              variant={view === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("table")}
              aria-pressed={view === "table"}
            >
              <Rows3 className="size-4" /> Table
            </Button>
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
            >
              <LayoutGrid className="size-4" /> Cards
            </Button>
          </div>
        </section>

        {isLoading && <LoadingState label="Loading devices…" className="mt-6" />}

        {!isLoading && filtered.length === 0 && (
          <EmptyState
            className="mt-6"
            icon={MonitorSmartphone}
            title={hasFilters ? "No matching devices" : "No devices yet"}
            description={
              hasFilters
                ? "Try a different search term or clear the filters to see everything."
                : "Register a device to start tracking its warranty, documents, and service history."
            }
            action={hasFilters ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setCategory(ALL);
                  setStatus(ALL);
                  setBrand(ALL);
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button asChild>
                <Link to="/devices/new">
                  <Plus className="size-4" /> Register your first device
                </Link>
              </Button>

            )}
          />
        )}

        {!isLoading && filtered.length > 0 && view === "table" && (
          <section className="card-surface animate-fade-up mt-6 overflow-hidden" style={{ animationDelay: "140ms" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs tracking-wide text-muted-foreground uppercase">
                    <th className="px-6 py-3 font-medium">Device</th>
                    <th className="px-6 py-3 font-medium">Category</th>
                    <th className="px-6 py-3 font-medium">Purchase Date</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 text-right font-medium">Days Remaining</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((device, index) => (
                    <tr
                      key={device.id}
                      onClick={() => openDevice(device.id)}
                      className="animate-fade-up cursor-pointer border-t border-border transition-colors duration-200 hover:bg-accent/50"
                      style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <Thumbnail device={device} />
                          <div className="min-w-0">
                            <p className="truncate font-medium">{device.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {[device.brand, device.model].filter(Boolean).join(" · ") || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-muted-foreground">{device.category ?? "—"}</td>
                      <td className="px-6 py-3.5 text-muted-foreground">{formatDate(device.purchase_date)}</td>
                      <td className="px-6 py-3.5">
                        <StatusPill device={device} />
                      </td>
                      <td className="px-6 py-3.5 text-right font-medium">
                        <DaysCell days={device.days} />
                      </td>
                      <td className="px-3 py-3.5 text-right">{kebab(device)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {!isLoading && filtered.length > 0 && view === "grid" && (
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((device, index) => (
              <article
                key={device.id}
                onClick={() => openDevice(device.id)}
                className="card-surface card-lift animate-fade-up cursor-pointer p-4"
                style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Thumbnail device={device} size="size-12" />
                    <div className="min-w-0">
                      <h2 className="truncate font-medium">{device.name}</h2>
                      <p className="truncate text-xs text-muted-foreground">
                        {[device.brand, device.model].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                  </div>
                  {kebab(device)}
                </div>

                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Category</dt>
                    <dd>{device.category ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Purchased</dt>
                    <dd>{formatDate(device.purchase_date)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Remaining</dt>
                    <dd className="font-medium">
                      <DaysCell days={device.days} />
                    </dd>
                  </div>
                </dl>

                <div className="mt-4">
                  <StatusPill device={device} />
                </div>
              </article>
            ))}
          </section>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Need a coverage summary?{" "}
          <Link to="/dashboard" className="text-primary transition-colors hover:text-foreground">
            Back to dashboard
          </Link>
        </p>
      </main>
    </AppShell>
  );
}
