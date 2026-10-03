import { cn } from "../../lib/cn";
import { formatRs } from "../../lib/format";

export interface ChartPoint {
  key: string;
  label: string;
  value: number;
  /** Extra context announced in the bar's tooltip, e.g. "3 orders". */
  hint?: string;
}

const WIDTH = 720;
const HEIGHT = 200;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

/**
 * Daily revenue bars. Colours come from the theme (`line`, `muted`, `pine`) via
 * `currentColor`, so the chart stays inside the token palette.
 */
export function RevenueChart({
  data,
  caption,
  emptyLabel = "No data for this period",
  className,
}: {
  data: ChartPoint[];
  caption: string;
  emptyLabel?: string;
  className?: string;
}) {
  if (data.length === 0) {
    return (
      <div
        className={cn(
          "flex h-32 items-center justify-center rounded-control bg-paper-2 text-sm text-muted",
          className,
        )}
      >
        {emptyLabel}
      </div>
    );
  }

  const max = Math.max(...data.map((d) => Math.max(d.value, 0)), 1);
  const slot = WIDTH / data.length;
  const barWidth = Math.min(28, slot * 0.5);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={cn("w-full", className)}
      role="img"
      aria-label={caption}
    >
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1="0"
          x2={WIDTH}
          y1={PAD_TOP + plotHeight * f}
          y2={PAD_TOP + plotHeight * f}
          stroke="currentColor"
          strokeWidth="1"
          className="text-line"
        />
      ))}

      {data.map((point, index) => {
        const height = Math.max(
          2,
          (Math.max(point.value, 0) / max) * plotHeight,
        );
        const x = index * slot + (slot - barWidth) / 2;
        const y = HEIGHT - PAD_BOTTOM - height;
        const showLabel =
          data.length <= 7 || index % 5 === 0 || index === data.length - 1;

        return (
          <g key={point.key}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={height}
              rx="4"
              fill="currentColor"
              className="text-pine"
            >
              <title>{`${point.label}: ${formatRs(point.value)}${
                point.hint ? ` (${point.hint})` : ""
              }`}</title>
            </rect>
            {showLabel && (
              <text
                x={x + barWidth / 2}
                y={HEIGHT - PAD_BOTTOM + 16}
                textAnchor="middle"
                fontSize="10"
                fill="currentColor"
                className="fill-muted"
              >
                {point.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
