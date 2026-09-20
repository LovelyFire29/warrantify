import { createFileRoute, Link } from "@tanstack/react-router";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Bell, Plus, ShieldAlert, Clock, Wrench } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import { CountUp } from "@/components/count-up";
import { useDevices, useNotifications } from "@/hooks/use-devices";
import { useProfile } from "@/hooks/use-profile";
import { formatDate, greeting, relativeTime } from "@/lib/warranty";
import { Button } from "@/components/ui/button";
import { PageHeader, WarrantyStatusPill } from "@/components/app-patterns";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Warrantify" },
      {
        name: "description",
        content:
          "See warranty coverage at a glance: active, expiring, and expired devices, recent alerts, and your device list.",
      },
      { property: "og:title", content: "Dashboard — Warrantify" },
      {
        property: "og:description",
        content: "Warranty coverage overview for every device in your household.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { firstName } = useProfile();
  const { data: devices = [], isLoading } = useDevices();
  const { data: notifications = [] } = useNotifications();

  const active = devices.filter((d) => d.status === "active").length;
  const expiring = devices.filter((d) => d.status === "expiring").length;
  const expired = devices.filter((d) => d.status === "expired").length;
  const total = devices.length;
  const coverage = total ? Math.round((active / total) * 100) : 0;

  const monthAgo = Date.now() - 30 * 86_400_000;
  const addedThisMonth = devices.filter((d) => new Date(d.created_at).getTime() > monthAgo).length;

  const chartData = [
    { name: "Active", value: active, color: "var(--success)" },
    { name: "Expiring Soon", value: expiring, color: "var(--warning)" },
    { name: "Expired", value: expired, color: "var(--danger)" },
  ];

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <PageHeader
          eyebrow={today}
          title={<>{greeting()}, {firstName || "there"}</>}
          subtitle={<>{total} registered {total === 1 ? "device" : "devices"} · {coverage}% under active coverage</>}
          action={<Button asChild>
            <Link to="/devices">
              <Plus className="size-4" /> Register Device
            </Link>
          </Button>}
        />

        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Devices"
            value={total}
            tone="neutral"
            trend={addedThisMonth ? `+${addedThisMonth} this month` : "No new devices this month"}
            index={0}
          />
          <StatCard label="Active" value={active} tone="good" trend="Covered by warranty" index={1} />
          <StatCard
            label="Expiring Soon"
            value={expiring}
            tone="warn"
            trend="Within the next 90 days"
            index={2}
          />
          <StatCard label="Expired" value={expired} tone="critical" trend="Coverage has lapsed" index={3} />
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-5">
          <div
            className="card-surface card-lift animate-fade-up p-6 lg:col-span-2"
            style={{ animationDelay: "160ms" }}
          >
            <h2 className="text-base font-semibold tracking-tight">Warranty overview</h2>
            <p className="mt-1 text-xs text-muted-foreground">Coverage split across all registered devices</p>

            <div className="relative mx-auto mt-4 h-52 w-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    innerRadius={68}
                    outerRadius={94}
                    paddingAngle={3}
                    stroke="none"
                    animationDuration={900}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-semibold tracking-tight text-success">
                  <CountUp value={coverage} />%
                </span>
                <span className="text-[11px] text-muted-foreground">active coverage</span>
              </div>
            </div>

            <ul className="mt-5 space-y-2.5">
              {chartData.map((entry) => (
                <li key={entry.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2.5">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-muted-foreground">{entry.name}</span>
                  </span>
                  <span className="font-medium">
                    {entry.value} {entry.value === 1 ? "device" : "devices"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="card-surface card-lift animate-fade-up p-6 lg:col-span-3"
            style={{ animationDelay: "220ms" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold tracking-tight">Recent notifications</h2>
              <Link
                to="/claims"
                className="text-xs font-medium text-primary transition-colors duration-200 hover:text-foreground"
              >
                View all
              </Link>
            </div>

            <ul className="mt-4 divide-y divide-border">
              {notifications.length === 0 && (
                <li className="py-6 text-sm text-muted-foreground">No notifications yet.</li>
              )}
              {notifications.map((note) => {
                const Icon = note.message.includes("expired")
                  ? ShieldAlert
                  : note.message.includes("Claim")
                    ? Wrench
                    : note.message.includes("expires")
                      ? Clock
                      : Bell;
                return (
                  <li key={note.id} className="flex items-start gap-3 py-3.5">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug">{note.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{relativeTime(note.created_at)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="card-surface animate-fade-up mt-6 overflow-hidden" style={{ animationDelay: "280ms" }}>
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-base font-semibold tracking-tight">My devices</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Showing up to 5 of {total}</p>
            </div>
            <Link
              to="/devices"
              className="text-xs font-medium text-primary transition-colors duration-200 hover:text-foreground"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="px-6 py-3 font-medium">Device</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Purchase Date</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 text-right font-medium">Days Remaining</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      Loading devices…
                    </td>
                  </tr>
                )}
                {!isLoading && devices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No devices registered yet.
                    </td>
                  </tr>
                )}
                {devices.slice(0, 5).map((device) => (
                  <tr
                    key={device.id}
                    className="border-t border-border transition-colors duration-200 hover:bg-accent/50"
                  >
                    <td className="px-6 py-3.5">
                      <p className="font-medium">{device.name}</p>
                      <p className="text-xs text-muted-foreground">{device.brand ?? "—"}</p>
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground">{device.category ?? "—"}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{formatDate(device.purchase_date)}</td>
                    <td className="px-6 py-3.5">
                      <WarrantyStatusPill status={device.status} />
                    </td>
                    <td className="px-6 py-3.5 text-right font-medium">
                      {device.days < 0 ? (
                        <span className="text-danger">{Math.abs(device.days)} days ago</span>
                      ) : (
                        <span>{device.days} days</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
