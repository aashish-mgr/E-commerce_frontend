import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "../../lib/cn";

export const RadioGroup = RadioGroupPrimitive.Root;

export function RadioCard({
  value,
  disabled,
  className,
  children,
}: {
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <RadioGroupPrimitive.Item
      value={value}
      disabled={disabled}
      className={cn(
        "group flex w-full items-center gap-3 rounded-control border border-line bg-surface p-3 text-left",
        "transition-colors hover:bg-paper-2/60 focus-visible:outline-2 focus-visible:outline-offset-2",
        "focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-55",
        "data-[state=checked]:border-pine data-[state=checked]:bg-pine-soft",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border border-line bg-surface",
          "group-data-[state=checked]:border-pine",
        )}
      >
        <span className="size-2.5 rounded-full bg-pine opacity-0 group-data-[state=checked]:opacity-100" />
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </RadioGroupPrimitive.Item>
  );
}