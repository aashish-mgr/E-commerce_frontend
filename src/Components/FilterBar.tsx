import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "../lib/cn";
import { Select } from "./ui/Select";

interface Props {
  search: string;
  selectedCategory: string;
  categories: string[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export default function FilterBar({
  search,
  selectedCategory,
  categories,
  onSearchChange,
  onCategoryChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          aria-label="Search products"
          placeholder="Search products"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className={cn(
            "h-11 w-full rounded-control border border-line bg-surface pl-9 pr-3 text-sm text-ink",
            "placeholder:text-muted focus-visible:border-pine focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-pine/25",
          )}
        />
      </div>

      <div className="flex items-center gap-2 sm:w-56 sm:shrink-0">
        <SlidersHorizontal aria-hidden className="hidden size-4 shrink-0 text-muted sm:block" />
        <Select
          ariaLabel="Filter by category"
          value={selectedCategory}
          onValueChange={onCategoryChange}
          options={categories.map((name) => ({ value: name, label: name }))}
          placeholder="Category"
        />
      </div>
    </div>
  );
}