import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "../../lib/cn";

export const Checkbox = CheckboxPrimitive.Root;

export function CheckboxControl({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-[4px] border border-line bg-surface",
        "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine",
        "data-[state=checked]:border-pine data-[state=checked]:bg-pine",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-paper">
        <Check aria-hidden className="size-3.5" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}