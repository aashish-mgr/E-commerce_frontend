import { Minus, Plus } from "lucide-react";
import { cn } from "../../lib/cn";

export function QuantityStepper({
  value,
  min = 1,
  max = 15,
  onChange,
  label = "Quantity",
  size = "md",
  onPine = false,
  className,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  label?: string;
  size?: "sm" | "md";
  /** Draws the control for use inside a pine summary panel. */
  onPine?: boolean;
  className?: string;
}) {
  const target = size === "sm" ? "size-9" : "size-11";
  const canDecrease = value > min;
  const canIncrease = value < max;

  const shell = onPine
    ? "border-paper/25 bg-paper/10"
    : "border-line bg-surface";
  const buttonTone = onPine
    ? "text-paper/80 hover:bg-paper/10 hover:text-paper disabled:text-paper/25"
    : "text-ink-2 hover:bg-paper-2 disabled:text-line";
  const valueTone = onPine
    ? "border-paper/25 text-paper"
    : "border-line text-ink";
  const ring = onPine ? "focus-visible:outline-marigold" : "focus-visible:outline-pine";

  return (
    <div className={cn("inline-flex items-center rounded-control border", shell, className)}>
      <button
        type="button"
        aria-label={`Decrease ${label.toLowerCase()}`}
        onClick={() => canDecrease && onChange(value - 1)}
        disabled={!canDecrease}
        className={cn(
          target,
          "flex items-center justify-center rounded-l-control transition-colors",
          "disabled:cursor-not-allowed",
          "focus-visible:outline-2 focus-visible:-outline-offset-2",
          buttonTone,
          ring,
        )}
      >
        <Minus aria-hidden className="size-4" />
      </button>
      <span
        aria-live="polite"
        className={cn(
          "flex items-center justify-center border-x font-display text-sm font-semibold tabular-nums",
          size === "sm" ? "h-9 w-9" : "h-11 w-11",
          valueTone,
        )}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={`Increase ${label.toLowerCase()}`}
        onClick={() => canIncrease && onChange(value + 1)}
        disabled={!canIncrease}
        className={cn(
          target,
          "flex items-center justify-center rounded-r-control transition-colors",
          "disabled:cursor-not-allowed",
          "focus-visible:outline-2 focus-visible:-outline-offset-2",
          buttonTone,
          ring,
        )}
      >
        <Plus aria-hidden className="size-4" />
      </button>
    </div>
  );
}