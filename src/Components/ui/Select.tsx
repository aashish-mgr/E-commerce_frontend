import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = "Select",
  ariaLabel,
  className,
  contentClassName,
  disabled,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
}) {
  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-control border border-line",
          "bg-surface px-3 text-sm text-ink transition-colors",
          "hover:bg-paper-2/60 focus-visible:border-pine focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-pine/25 disabled:cursor-not-allowed disabled:opacity-60",
          "data-[placeholder]:text-muted",
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown aria-hidden className="size-4 shrink-0 text-muted" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className={cn(
            "z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden",
            "rounded-panel border border-line bg-surface shadow-lift",
            "data-[state=open]:animate-[se-panel-in_120ms_ease-out]",
            contentClassName,
          )}
        >
          <SelectPrimitive.Viewport className="p-1">{options.map((o) => (
            <SelectPrimitive.Item
              key={o.value}
              value={o.value}
              className={cn(
                "flex h-10 cursor-pointer items-center justify-between gap-2 rounded-control px-3",
                "text-sm text-ink-2 outline-none select-none",
                "data-[highlighted]:bg-pine-soft data-[highlighted]:text-pine",
              )}
            >
              <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
              <SelectPrimitive.ItemIndicator>
                <Check aria-hidden className="size-4 text-pine" />
              </SelectPrimitive.ItemIndicator>
            </SelectPrimitive.Item>
          ))}</SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}