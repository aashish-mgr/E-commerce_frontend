import { Minus, Plus } from "lucide-react";
import { cn } from "../../lib/cn";

export function QuantityStepper({
  value,
  min = 1,
  max = 15,
  onChange,
  label = "Quantity",
  size = "md",
  className,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const target = size === "sm" ? "size-9" : "size-11";
  const canDecrease = value > min;
  const canIncrease = value < max;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-control border border-line bg-surface",
        className,
      )}
    >
      <button
        type="button"
        aria-label={`Decrease ${label.toLowerCase()}`}
        onClick={() => canDecrease && onChange(value - 1)}
        disabled={!canDecrease}
        className={cn(
          target,
          "flex items-center justify-center rounded-l-control text-ink-2 transition-colors",
          "hover:bg-paper-2 disabled:cursor-not-allowed disabled:text-line",
          "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pine",
        )}
      >
        <Minus aria-hidden className="size-4" />
      </button>
      <span
        aria-live="polite"
        className={cn(
          "flex items-center justify-center border-x border-line font-display text-sm font-semibold tabular-nums text-ink",
          size === "sm" ? "h-9 w-9" : "h-11 w-11",
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
          "flex items-center justify-center rounded-r-control text-ink-2 transition-colors",
          "hover:bg-paper-2 disabled:cursor-not-allowed disabled:text-line",
          "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pine",
        )}
      >
        <Plus aria-hidden className="size-4" />
      </button>
    </div>
  );
}