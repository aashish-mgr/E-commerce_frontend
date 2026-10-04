import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold rounded-control select-none " +
    "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "disabled:pointer-events-none disabled:opacity-55 whitespace-nowrap",
  {
    variants: {
      variant: {
        primary:
          "bg-marigold text-ink hover:bg-marigold-hover focus-visible:outline-ink",
        solid:
          "bg-pine text-paper hover:bg-pine-hover focus-visible:outline-pine",
        outline:
          "border border-pine/35 bg-transparent text-pine hover:bg-pine-soft focus-visible:outline-pine",
        ghost:
          "bg-transparent text-ink-2 hover:bg-paper-2 hover:text-ink focus-visible:outline-pine",
        danger:
          "bg-crimson-soft text-crimson hover:bg-crimson hover:text-surface focus-visible:outline-crimson",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-sm",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: { variant: "solid", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  /** Announced while `loading` is true and replaces the label visually. */
  loadingLabel?: string;
  /** Draws the focus ring in marigold — use when the button sits on a pine surface. */
  onPine?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant,
    size,
    loading = false,
    loadingLabel,
    onPine = false,
    disabled,
    children,
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        buttonVariants({ variant, size }),
        onPine && "focus-visible:outline-marigold",
        className,
      )}
      {...props}
    >
      {loading && <Loader2 aria-hidden className="size-4 shrink-0 animate-spin" />}
      {loading && loadingLabel ? loadingLabel : children}
    </button>
  );
});

export { buttonVariants };