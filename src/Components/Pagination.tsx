import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "../types";
import { cn } from "../lib/cn";

const PAGE_WINDOW = 2;

function pageList(page: number, totalPages: number): (number | "gap")[] {
  const pages: (number | "gap")[] = [];
  const start = Math.max(2, page - PAGE_WINDOW);
  const end = Math.min(totalPages - 1, page + PAGE_WINDOW);

  pages.push(1);

  if (start > 2) pages.push("gap");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push("gap");

  if (totalPages > 1) pages.push(totalPages);
  else pages.pop();

  return pages;
}

const stepClass =
  "flex size-11 items-center justify-center rounded-control border border-line bg-surface text-ink-2 " +
  "transition-colors hover:border-pine hover:text-pine focus-visible:outline-2 " +
  "focus-visible:outline-offset-2 focus-visible:outline-pine";

export default function Pagination({
  pagination,
  onPageChange,
}: {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}) {
  if (!pagination || pagination.total <= 0 || pagination.totalPages <= 1) {
    return null;
  }

  const { page, total, totalPages, hasNextPage, hasPrevPage } = pagination;
  const first = total === 0 ? 0 : (page - 1) * pagination.limit + 1;
  const last = Math.min(page * pagination.limit, total);

  return (
    <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
      <p aria-live="polite" className="text-sm text-muted">
        Showing{" "}
        <span className="font-display font-semibold tabular-nums text-ink">{first}</span>
        {" to "}
        <span className="font-display font-semibold tabular-nums text-ink">{last}</span>
        {" of "}
        <span className="font-display font-semibold tabular-nums text-ink">{total}</span>
      </p>

      <nav aria-label="Pagination" className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          aria-label="Previous page"
          className={cn(stepClass, !hasPrevPage && "cursor-not-allowed text-line hover:border-line hover:text-line")}
        >
          <ChevronLeft aria-hidden className="size-4" />
        </button>

        {pageList(page, totalPages).map((entry, index) =>
          entry === "gap" ? (
            <span key={`gap-${index}`} aria-hidden className="px-1 text-sm text-muted">
              &hellip;
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => onPageChange(entry)}
              aria-label={`Page ${entry}`}
              aria-current={entry === page ? "page" : undefined}
              className={cn(
                "flex size-11 items-center justify-center rounded-control text-sm font-medium tabular-nums transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine",
                entry === page
                  ? "bg-pine text-paper"
                  : "border border-line bg-surface text-ink-2 hover:border-pine hover:text-pine",
              )}
            >
              {entry}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          aria-label="Next page"
          className={cn(stepClass, !hasNextPage && "cursor-not-allowed text-line hover:border-line hover:text-line")}
        >
          <ChevronRight aria-hidden className="size-4" />
        </button>
      </nav>
    </div>
  );
}