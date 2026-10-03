import { cn } from "../../lib/cn";

/**
 * The resting surface for dashboard blocks: 1px `line` border, no shadow.
 * Tinted table headers use `paper-2` on top of this, never a shadow.
 */
export function Panel({
  as: Tag = "section",
  className,
  children,
}: {
  as?: "section" | "div" | "article" | "aside";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag className={cn("rounded-panel border border-line bg-surface", className)}>
      {children}
    </Tag>
  );
}
