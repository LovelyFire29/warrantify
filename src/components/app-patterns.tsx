import type { LucideIcon } from "lucide-react";
import { Loader2, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { statusLabel, statusPillClass, type WarrantyStatus } from "@/lib/warranty";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  action,
  className,
}: {
  title: ReactNode;
  subtitle: ReactNode;
  eyebrow?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("animate-fade-up flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        {eyebrow && <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{eyebrow}</p>}
        <h1 className={cn("text-2xl font-semibold tracking-normal md:text-3xl", eyebrow && "mt-1.5")}>{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {action}
    </header>
  );
}

export function LoadingState({ label = "Loading…", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground", className)}>
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("card-surface animate-fade-up flex flex-col items-center px-6 py-16 text-center", className)}>
      <Icon className="size-12 text-muted-foreground" strokeWidth={1} aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold tracking-tight">{title}</h2>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </section>
  );
}

export function WarrantyStatusPill({ status, className }: { status: WarrantyStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
        statusPillClass[status],
        className,
      )}
    >
      <ShieldCheck className="size-3.5" aria-hidden="true" />
      {statusLabel[status]}
    </span>
  );
}