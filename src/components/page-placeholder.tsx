import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";

export function PagePlaceholder({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <header className="animate-fade-up">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        </header>
        <div
          className="card-surface animate-fade-up mt-6 p-8 text-sm text-muted-foreground"
          style={{ animationDelay: "80ms" }}
        >
          {children ?? "This section is coming next."}
        </div>
      </main>
    </AppShell>
  );
}
