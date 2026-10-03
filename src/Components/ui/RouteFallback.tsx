import { Loader2 } from "lucide-react";

/** Shared waiting screen for the route guards while auth status resolves. */
export function RouteFallback({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div role="status" className="flex items-center gap-3 text-ink-2">
        <Loader2 aria-hidden className="size-4 animate-spin text-pine" />
        <span className="text-sm">{label}…</span>
      </div>
    </div>
  );
}
