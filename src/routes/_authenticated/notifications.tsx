import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BellRing, Check, CheckCheck, MailOpen } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useAllNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/hooks/use-notifications";
import { EmptyState, LoadingState, PageHeader } from "@/components/app-patterns";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Warrantify" },
      {
        name: "description",
        content:
          "Every warranty expiry reminder, claim update, and device alert in one place, with unread filtering.",
      },
      { property: "og:title", content: "Notifications — Warrantify" },
      {
        property: "og:description",
        content: "Warranty reminders and claim updates for all your devices.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotificationsPage,
});

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days >= 7)
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (days >= 1) return `${days}d ago`;
  const hours = Math.floor(diff / 3_600_000);
  if (hours >= 1) return `${hours}h ago`;
  const minutes = Math.max(1, Math.floor(diff / 60_000));
  return `${minutes}m ago`;
}

function NotificationsPage() {
  const { data: notifications = [], isLoading } = useAllNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((note) => !note.is_read).length;
  const visible = useMemo(
    () => (filter === "unread" ? notifications.filter((note) => !note.is_read) : notifications),
    [notifications, filter],
  );

  return (
    <AppShell>
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-5 py-8 md:px-8">
        <PageHeader
          title="Notifications"
          subtitle={<>{unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"} · {notifications.length} total</>}
          action={<div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-md border border-border bg-card p-0.5">
              {(["all", "unread"] as const).map((value) => (
                <Button
                  key={value}
                  variant={filter === value ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setFilter(value)}
                  className="capitalize"
                >
                  {value}
                  {value === "unread" && unreadCount > 0 && (
                    <span className="ml-1.5 text-xs text-muted-foreground">{unreadCount}</span>
                  )}
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              disabled={unreadCount === 0 || markAll.isPending}
              onClick={() =>
                markAll.mutate(undefined, {
                  onSuccess: () => toast.success("All notifications marked as read"),
                  onError: (error) =>
                    toast.error(error instanceof Error ? error.message : "Could not update"),
                })
              }
            >
              <CheckCheck className="size-4" /> Mark all read
            </Button>
          </div>}
        />

        {isLoading ? (
          <LoadingState label="Loading notifications…" className="flex-1" />
        ) : visible.length === 0 ? (
          <EmptyState
            className="flex-1 justify-center"
            icon={BellRing}
            title={filter === "unread" ? "No unread notifications" : "No notifications yet"}
            description="Reminders about expiring warranties and claim updates will appear here."
            action={filter === "unread" ? (
              <Button variant="ghost" onClick={() => setFilter("all")}>
                Show all
              </Button>
            ) : undefined}
          />
        ) : (
          <ul className="card-surface divide-y divide-border overflow-hidden">
            {visible.map((note, index) => (
              <li
                key={note.id}
                className={cn(
                  "flex items-start gap-3 p-4 transition-colors hover:bg-primary-soft/40",
                  !note.is_read && "bg-primary-soft/25",
                )}
                style={{ animation: "var(--animate-fade-up)", animationDelay: `${index * 35}ms` }}
              >
                <span
                  className={cn(
                    "mt-1.5 size-2 shrink-0 rounded-full",
                    note.is_read ? "bg-muted-foreground/40" : "bg-primary",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm", !note.is_read && "font-medium")}>{note.message}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>{timeAgo(note.created_at)}</span>
                    {note.device_id && (
                      <Link
                        to="/devices/$deviceId"
                        params={{ deviceId: note.device_id }}
                        className="hover:text-primary"
                      >
                        View device
                      </Link>
                    )}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={note.is_read ? "Mark as unread" : "Mark as read"}
                  title={note.is_read ? "Mark as unread" : "Mark as read"}
                  onClick={() =>
                    markRead.mutate(
                      { id: note.id, is_read: !note.is_read },
                      {
                        onError: (error) =>
                          toast.error(error instanceof Error ? error.message : "Could not update"),
                      },
                    )
                  }
                >
                  {note.is_read ? <MailOpen className="size-4" /> : <Check className="size-4" />}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppShell>
  );
}
