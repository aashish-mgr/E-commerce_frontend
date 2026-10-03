import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";

export function EmptyState({
  icon: Icon,
  title,
  direction,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  direction?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-16 text-center",
        className,
      )}
    >
      <span className="mb-4 flex size-14 items-center justify-center rounded-control bg-pine-soft text-pine">
        <Icon aria-hidden className="size-6" />
      </span>
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      {direction && (
        <p className="mt-1 max-w-prose text-sm text-muted">{direction}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}