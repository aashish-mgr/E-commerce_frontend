import { forwardRef } from "react";
import { cn } from "../../lib/cn";

const baseControl =
  "w-full rounded-control border border-line bg-surface px-3 py-2.5 text-sm text-ink " +
  "placeholder:text-muted transition-colors focus-visible:border-pine focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-pine/25 disabled:cursor-not-allowed disabled:bg-paper-2 " +
  "disabled:text-ink-2 aria-invalid:border-crimson aria-invalid:focus-visible:ring-crimson/25";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(baseControl, "h-11", className)} {...props} />;
});