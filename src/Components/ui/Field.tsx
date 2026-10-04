import { cloneElement, isValidElement, useId } from "react";
import { cn } from "../../lib/cn";

/**
 * A visible label, one control, optional hint text and an optional error message.
 * The control is cloned with the id and `aria-describedby` / `aria-labelledby` /
 * `aria-invalid` wiring, so pass exactly one form control as the child.
 */
export function Field({
  label,
  hint,
  error,
  required,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactElement;
}) {
  const id = useId();
  const labelId = `${id}-label`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  const control = isValidElement(children)
    ? cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        id,
        "aria-labelledby": labelId,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        "aria-required": required || undefined,
      })
    : children;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label id={labelId} htmlFor={id} className="text-sm font-medium text-ink-2">
        {label}
        {required && (
          <span className="ml-1 text-crimson" aria-hidden>
            *
          </span>
        )}
      </label>
      {control}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs font-medium text-crimson">
          {error}
        </p>
      )}
    </div>
  );
}