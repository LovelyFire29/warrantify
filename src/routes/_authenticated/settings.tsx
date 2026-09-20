import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, Loader2, Mail, Moon, Sun, UserRound } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import { useTheme } from "@/hooks/use-theme";
import {
  DEFAULT_PREFERENCES,
  usePreferences,
  useUpdatePreferences,
  useUpdateProfile,
} from "@/hooks/use-preferences";
import { PageHeader } from "@/components/app-patterns";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Warrantify" },
      {
        name: "description",
        content:
          "Manage your Warrantify profile, reminder timing, alert channels, and light or dark appearance.",
      },
      { property: "og:title", content: "Settings — Warrantify" },
      {
        property: "og:description",
        content: "Profile, reminder timing, and appearance preferences for your warranty tracker.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

const REMINDER_OPTIONS = [7, 14, 30, 60, 90];

function Section({
  title,
  description,
  icon: Icon,
  children,
  delay,
}: {
  title: string;
  description: string;
  icon: typeof UserRound;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <section
      className="card-surface p-6"
      style={{ animation: "var(--animate-fade-up)", animationDelay: `${delay}ms` }}
    >
      <div className="mb-5 flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
          <Icon className="size-[18px]" />
        </span>
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function SettingsPage() {
  const profile = useProfile();
  const { data: savedPreferences } = usePreferences();
  const prefs = savedPreferences ?? DEFAULT_PREFERENCES;
  const updatePrefs = useUpdatePreferences();
  const updateProfile = useUpdateProfile();
  const { theme, setTheme, isDark } = useTheme();

  const [name, setName] = useState("");
  useEffect(() => setName(profile.name), [profile.name]);

  // Keep the toggle, the html class, and the saved preference in one state.
  useEffect(() => {
    if (savedPreferences?.theme === "light" || savedPreferences?.theme === "dark") {
      setTheme(savedPreferences.theme);
    }
  }, [savedPreferences?.theme, setTheme]);

  const initials =
    profile.name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  function savePrefs(patch: Parameters<typeof updatePrefs.mutate>[0]) {
    updatePrefs.mutate(patch, {
      onSuccess: () => toast.success("Preferences saved"),
      onError: (error) =>
        toast.error(error instanceof Error ? error.message : "Could not save preferences"),
    });
  }

  return (
    <AppShell>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-8 md:px-8">
        <PageHeader title="Settings" subtitle="Profile details, reminder timing, and appearance." />

        <Section
          title="Profile"
          description="How your account appears across Warrantify."
          icon={UserRound}
          delay={0}
        >
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt=""
                  className="size-16 rounded-full object-cover"
                />
              ) : (
                <span className="flex size-16 items-center justify-center rounded-full bg-primary/25 text-lg font-semibold">
                  {initials}
                </span>
              )}
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Profile picture</p>
                <p className="mt-1 text-xs text-muted-foreground/80">
                  Your initials are used when no picture is set.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Name</Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input id="profile-email" value={profile.email} readOnly disabled />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                disabled={updateProfile.isPending || !name.trim() || name === profile.name}
                onClick={() =>
                  updateProfile.mutate(
                    { name: name.trim() },
                    {
                      onSuccess: () => toast.success("Profile updated"),
                      onError: (error) =>
                        toast.error(
                          error instanceof Error ? error.message : "Could not update profile",
                        ),
                    },
                  )
                }
              >
                {updateProfile.isPending && <Loader2 className="size-4 animate-spin" />} Save
                changes
              </Button>
            </div>
          </div>
        </Section>

        <Section
          title="Notification preferences"
          description="Choose how and when Warrantify reminds you."
          icon={Bell}
          delay={60}
        >
          <div className="flex flex-col divide-y divide-border/60">
            <div className="flex items-center justify-between gap-4 pb-4">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email alerts</p>
                  <p className="text-xs text-muted-foreground">
                    Send reminders to {profile.email || "your email"}.
                  </p>
                </div>
              </div>
              <Switch
                checked={prefs.email_alerts}
                onCheckedChange={(checked) => savePrefs({ email_alerts: checked })}
                aria-label="Email alerts"
              />
            </div>

            <div className="flex items-center justify-between gap-4 py-4">
              <div className="flex items-start gap-3">
                <Bell className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">In-app alerts</p>
                  <p className="text-xs text-muted-foreground">
                    Show reminders on your notifications page.
                  </p>
                </div>
              </div>
              <Switch
                checked={prefs.inapp_alerts}
                onCheckedChange={(checked) => savePrefs({ inapp_alerts: checked })}
                aria-label="In-app alerts"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
              <div>
                <p className="text-sm font-medium">Notify me before expiry</p>
                <p className="text-xs text-muted-foreground">
                  How far ahead of a warranty ending you want a reminder.
                </p>
              </div>
              <Select
                value={String(prefs.reminder_days)}
                onValueChange={(value) => savePrefs({ reminder_days: Number(value) })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REMINDER_OPTIONS.map((days) => (
                    <SelectItem key={days} value={String(days)}>
                      {days} days before
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Section>

        <Section
          title="Appearance"
          description="Switch between the dark navy and light themes."
          icon={isDark ? Moon : Sun}
          delay={120}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Sun className={cn("size-4", !isDark ? "text-warning" : "text-muted-foreground")} />
              <span className="text-muted-foreground">
                {isDark ? "Dark mode" : "Light mode"} is active
              </span>
              <Moon className={cn("size-4", isDark ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="theme-toggle" className="text-sm text-muted-foreground">
                Dark mode
              </Label>
              <Switch
                id="theme-toggle"
                checked={theme === "dark"}
                onCheckedChange={(checked) => {
                  const next = checked ? "dark" : "light";
                  setTheme(next);
                  updatePrefs.mutate({ theme: next });
                }}
                aria-label="Dark mode"
              />
            </div>
          </div>
        </Section>
      </main>
    </AppShell>
  );
}
