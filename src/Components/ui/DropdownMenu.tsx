import * as MenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "../../lib/cn";

export const DropdownMenu = MenuPrimitive.Root;
export const DropdownMenuTrigger = MenuPrimitive.Trigger;
export const DropdownMenuLabel = MenuPrimitive.Label;
export const DropdownMenuSeparator = MenuPrimitive.Separator;

export function DropdownMenuContent({
  children,
  align = "end",
  className,
}: {
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
}) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        align={align}
        sideOffset={6}
        className={cn(
          "z-50 min-w-[11rem] rounded-panel border border-line bg-surface p-1 shadow-lift",
          "data-[state=open]:animate-[se-panel-in_120ms_ease-out]",
          className,
        )}
      >
        {children}
      </MenuPrimitive.Content>
    </MenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  destructive = false,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Item> & { destructive?: boolean }) {
  return (
    <MenuPrimitive.Item
      className={cn(
        "flex h-10 cursor-pointer items-center gap-2 rounded-control px-3 text-sm select-none",
        "outline-none",
        destructive
          ? "text-crimson data-[highlighted]:bg-crimson-soft"
          : "text-ink-2 data-[highlighted]:bg-pine-soft data-[highlighted]:text-pine",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}