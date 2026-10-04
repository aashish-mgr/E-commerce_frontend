import { cn } from "../../lib/cn";

/**
 * Horizontal alignment for every page. Storefront uses `store`, dashboards use `dashboard`.
 * Same gutters everywhere so the Navbar brand lines up with page content.
 */
export function Container({
  width = "store",
  className,
  children,
}: {
  width?: "store" | "dashboard";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6",
        width === "store" ? "max-w-6xl" : "max-w-7xl",
        className,
      )}
    >
      {children}
    </div>
  );
}