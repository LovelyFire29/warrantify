import { CountUp } from "@/components/count-up";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "good" | "warn" | "critical";

const ACCENT: Record<Tone, string> = {
  neutral: "bg-primary",
  good: "bg-success",
  warn: "bg-warning",
  critical: "bg-danger",
};

const VALUE: Record<Tone, string> = {
  neutral: "text-foreground",
  good: "text-success",
  warn: "text-warning",
  critical: "text-danger",
};

export function StatCard({
  label,
  value,
  trend,
  tone,
  index = 0,
}: {
  label: string;
  value: number;
  trend: string;
  tone: Tone;
  index?: number;
}) {
  return (
    <div
      className="card-surface card-lift animate-fade-up relative overflow-hidden p-4"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <span className={cn("absolute inset-x-0 top-0 h-[3px]", ACCENT[tone])} />
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className={cn("mt-3 text-3xl font-semibold tracking-normal", VALUE[tone])}>
        <CountUp value={value} />
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground">{trend}</p>
    </div>
  );
}
