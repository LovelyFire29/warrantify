/* eslint-disable react-refresh/only-export-components -- error boundaries must be class components */
import { Component, Fragment, type ReactNode } from "react";

const MAX_RETRIES = 3;

function LoadFailed() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. Try reloading the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Reload
        </button>
      </div>
    </div>
  );
}

/**
 * Works around a race in TanStack Router 1.170.x. When a route load is cancelled and restarted
 * mid-flight (supabase-js cleaning the token out of the URL after Google sign-in does exactly
 * that), the router can briefly render a match that is still "pending" but has no promise left.
 * React then receives `throw undefined`, which the router's own error boundary does not treat as an
 * error, so the whole page goes blank. The router state settles a moment later, so remounting the
 * subtree recovers it.
 */
export class RouteRetryBoundary extends Component<
  { children: ReactNode },
  { attempt: number; failed: boolean }
> {
  override state = { attempt: 0, failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: unknown) {
    if (this.state.attempt >= MAX_RETRIES) {
      console.error(error);
      return;
    }
    console.warn("[router] recovered from a stale route render; retrying");
    setTimeout(() => this.setState((s) => ({ attempt: s.attempt + 1, failed: false })), 60);
  }

  override render() {
    if (this.state.failed) return this.state.attempt >= MAX_RETRIES ? <LoadFailed /> : null;
    return <Fragment key={this.state.attempt}>{this.props.children}</Fragment>;
  }
}
