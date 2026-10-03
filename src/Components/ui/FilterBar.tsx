import { Search, X } from "lucide-react";
import { cn } from "../../lib/cn";

/** Debounced-backed search box with an inline clear affordance. */
export function SearchField({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div className={cn("relative flex-1", className)}>
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
      />
      <input
        type="search"
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-control border border-line bg-surface pl-9 pr-9 text-sm text-ink placeholder:text-muted focus-visible:border-pine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/25"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-control text-muted transition-colors hover:bg-paper-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
        >
          <X aria-hidden className="size-4" />
        </button>
      )}
    </div>
  );
}

/** Horizontally scrollable filter chips. Labels must arrive pre-cased. */
export function ChipGroup({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn("flex gap-2 overflow-x-auto pb-1", className)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            "h-11 shrink-0 rounded-control px-4 text-sm font-medium transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine",
            option.value === value
              ? "bg-pine text-paper"
              : "border border-line bg-surface text-ink-2 hover:border-pine hover:text-pine",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Result count plus an optional reset, shared by every dashboard list. */
export function ResultMeta({
  shown,
  total,
  noun,
  onClear,
  className,
}: {
  shown: number;
  total: number;
  noun: string;
  onClear?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 text-sm text-muted",
        className,
      )}
    >
      <p className="tabular-nums">
        Showing <span className="font-semibold text-ink">{shown}</span> of{" "}
        <span className="font-semibold text-ink">{total}</span> {noun}
      </p>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="rounded-control text-sm font-medium text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
