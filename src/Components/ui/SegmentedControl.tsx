import { cn } from "../../lib/cn";

export interface SegmentedOption {
  value: string;
  label: string;
}

/**
 * Small exclusive switch for order status and payment status. Labels must arrive
 * pre-cased — the design system bans the `capitalize` utility on UI strings.
 */
export function SegmentedControl({
  value,
  options,
  onChange,
  ariaLabel,
  className,
  disabled = false,
}: {
  value: string;
  options: SegmentedOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex flex-wrap gap-1 rounded-control border border-line bg-paper-2/60 p-1",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-9 rounded-control px-3 text-sm font-medium transition-colors",
              "disabled:cursor-not-allowed disabled:opacity-50",
              active
                ? "bg-pine text-paper"
                : "text-ink-2 hover:bg-surface hover:text-pine",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
