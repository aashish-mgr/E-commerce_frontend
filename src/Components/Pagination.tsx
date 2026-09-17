import type { PaginationMeta } from "../types";

const PAGE_WINDOW = 2;

function pageList(page: number, totalPages: number): (number | "...")[] {
  const pages: (number | "...")[] = [];
  const start = Math.max(2, page - PAGE_WINDOW);
  const end = Math.min(totalPages - 1, page + PAGE_WINDOW);

  pages.push(1);

  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push("...");

  if (totalPages > 1) pages.push(totalPages);
  else pages.pop();

  return pages;
}

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

  const base = "inline-flex items-center justify-center h-9 min-w-9 px-2 text-sm font-medium rounded-lg transition-colors";
  const active = "bg-gray-900 text-white shadow-sm";
  const idle = "text-gray-600 hover:bg-gray-100";
  const disabled = "text-gray-300 cursor-not-allowed";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
      <p className="text-sm text-gray-500">
        Showing{" "}
        <span className="font-semibold text-gray-700">
          {total === 0 ? 0 : (page - 1) * pagination.limit + 1}
        </span>
        {" – "}
        <span className="font-semibold text-gray-700">
          {Math.min(page * pagination.limit, total)}
        </span>{" "}
        of <span className="font-semibold text-gray-700">{total}</span>
      </p>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className={`${base} ${hasPrevPage ? idle : disabled}`}
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {pageList(page, totalPages).map((p, i) =>
          p === "..." ? (
            <span key={`e-${i}`} className="px-1.5 text-sm text-gray-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`${base} ${p === page ? active : idle}`}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className={`${base} ${hasNextPage ? idle : disabled}`}
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}