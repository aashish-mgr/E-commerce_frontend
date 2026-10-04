import { cn } from "../../lib/cn";

/**
 * Horizontal alignment for every page. Storefront uses `store`, dashboards use `dashboard`.
 * Same gutters everywhere so the Navbar brand lines up with page content.
 *
 * Widths: store 80rem (1280px), dashboard 96rem (1536px). Widen these rather than
 * adding per-page overrides, so the side gutters stay consistent across the app.
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
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        width === "store" ? "max-w-7xl" : "max-w-8xl",
        className,
      )}
    >
      {children}
    </div>
  );
}