import { forwardRef } from "react";
import { cn } from "../../lib/cn";

const baseControl =
  "w-full rounded-control border border-line bg-surface px-3 py-2.5 text-sm text-ink " +
  "placeholder:text-muted transition-colors focus-visible:border-pine focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-pine/25 disabled:cursor-not-allowed disabled:bg-paper-2 " +
  "disabled:text-ink-2 aria-invalid:border-crimson aria-invalid:focus-visible:ring-crimson/25";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Static prefix inside the same border, e.g. a +977 country code. */
  addon?: React.ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, addon, ...props },
  ref,
) {
  if (addon) {
    return (
      <div
        className={cn(
          "flex h-11 items-center overflow-hidden rounded-control border border-line bg-surface",
          "focus-within:border-pine focus-within:ring-2 focus-within:ring-pine/25",
          "has-[aria-invalid]:border-crimson has-[aria-invalid]:ring-crimson/25",
          className,
        )}
      >
        <span className="flex h-full shrink-0 items-center border-r border-line bg-paper-2 px-3 text-sm text-ink-2">
          {addon}
        </span>
        <input
          ref={ref}
          className={cn(
            baseControl,
            "h-full flex-1 rounded-none border-0 bg-transparent focus-visible:ring-0",
          )}
          {...props}
        />
      </div>
    );
  }

  return <input ref={ref} className={cn(baseControl, "h-11", className)} {...props} />;
});