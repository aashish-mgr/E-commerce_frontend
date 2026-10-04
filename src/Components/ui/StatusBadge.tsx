import { cn } from "../../lib/cn";

/** Dot plus text, driven by the shared status maps. */
export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: "pending" | "shipped" | "delivered" | "cancelled" | "unpaid" | "neutral";
  children: React.ReactNode;
  className?: string;
}) {
  const tones: Record<string, string> = {
    pending: "bg-marigold-soft text-amber",
    shipped: "bg-sky-soft text-sky",
    delivered: "bg-pine-soft text-pine",
    cancelled: "bg-crimson-soft text-crimson",
    unpaid: "bg-paper-2 text-muted",
    neutral: "bg-paper-2 text-ink-2",
  };
  const dots: Record<string, string> = {
    pending: "bg-marigold",
    shipped: "bg-sky",
    delivered: "bg-pine",
    cancelled: "bg-crimson",
    unpaid: "bg-muted",
    neutral: "bg-ink-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", dots[tone])} />
      {children}
    </span>
  );
}