import { cn } from "../../lib/cn";
import { formatRs } from "../../lib/format";

/**
 * The only money renderer in the app. Decimals appear only when the value has them,
 * unless `decimals` forces two places (totals, invoices).
 */
export function Price({
  value,
  decimals = false,
  className,
}: {
  value: number | string | null | undefined;
  decimals?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("font-display tabular-nums whitespace-nowrap", className)}>
      {formatRs(value, { decimals })}
    </span>
  );
}