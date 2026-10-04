import { forwardRef } from "react";
import { cn } from "../../lib/cn";

const baseControl =
  "w-full rounded-control border border-line bg-surface px-3 py-2.5 text-sm text-ink " +
  "placeholder:text-muted transition-colors focus-visible:border-pine focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-pine/25 disabled:cursor-not-allowed disabled:bg-paper-2 " +
  "disabled:text-ink-2 aria-invalid:border-crimson aria-invalid:focus-visible:ring-crimson/25";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, rows = 3, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(baseControl, "resize-y leading-relaxed", className)}
        {...props}
      />
    );
  },
);