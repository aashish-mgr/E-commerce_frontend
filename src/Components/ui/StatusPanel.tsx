import { CircleCheck, Loader2, X } from "lucide-react";
import { cn } from "../../lib/cn";

export type StatusPanelVariant = "verifying" | "success" | "failed";

const TONES: Record<
  StatusPanelVariant,
  { circle: string; icon: string; title: string }
> = {
  verifying: { circle: "bg-pine-soft", icon: "text-pine", title: "text-ink" },
  success: { circle: "bg-pine-soft", icon: "text-pine", title: "text-ink" },
  failed: { circle: "bg-crimson-soft", icon: "text-crimson", title: "text-ink" },
};

export function StatusPanel({
  variant,
  title,
  description,
  meta,
  actions,
  className,
}: {
  variant: StatusPanelVariant;
  title: string;
  description?: React.ReactNode;
  /** Order id or other identifier, shown in the display font. */
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  const tone = TONES[variant];

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div
        className={cn(
          "flex w-full max-w-md flex-col items-center rounded-panel border border-line bg-surface px-6 py-10 text-center",
          className,
        )}
      >
        <span
          className={cn(
            "mb-5 flex size-14 items-center justify-center rounded-full",
            tone.circle,
            tone.icon,
          )}
        >
          {variant === "verifying" ? (
            <Loader2 aria-hidden className="size-6 animate-spin" />
          ) : variant === "success" ? (
            <CircleCheck aria-hidden className="size-7" strokeWidth={2} />
          ) : (
            <X aria-hidden className="size-6" strokeWidth={2.5} />
          )}
        </span>

        <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>

        {description && (
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
            {description}
          </p>
        )}

        {meta && (
          <p className="mt-4 font-display text-lg font-semibold tracking-tight text-pine tabular-nums">
            {meta}
          </p>
        )}

        {actions && (
          <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}