import { PackagePlus, PackageSearch, Plus } from "lucide-react";
import type { PaginationMeta } from "../../types";
import Pagination from "../Pagination";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { ChipGroup, ResultMeta, SearchField } from "../ui/FilterBar";
import { PageHeader } from "../ui/PageHeader";
import { Panel } from "../ui/Panel";
import { Skeleton } from "../ui/Skeleton";
import { cn } from "../../lib/cn";
import { humanize } from "../../lib/format";
import VendorProductCard from "./VendorProductCard";
import type { VendorProduct } from "./types";

const GRID = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

/** Mirrors <VendorProductCard> so the grid does not resize when real cards land. */
function ProductCardPlaceholder() {
  return (
    <div className="flex flex-col overflow-hidden rounded-panel border border-line bg-surface">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="flex items-center justify-between border-t border-line px-4 py-3">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="size-10" />
      </div>
    </div>
  );
}

export default function VendorProducts({
  products,
  categories,
  search,
  selectedCategory,
  pagination,
  loading = false,
  onSearchChange,
  onCategoryChange,
  onPageChange,
  onAdd,
  onEdit,
  onDelete,
}: {
  products: VendorProduct[];
  categories: string[];
  search: string;
  selectedCategory: string;
  pagination: PaginationMeta | null;
  /** True while a list request is in flight. */
  loading?: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onAdd: () => void;
  onEdit: (p: VendorProduct) => void;
  onDelete: (p: VendorProduct) => void;
}) {
  const total = pagination?.total ?? products.length;
  const filtered = Boolean(search) || selectedCategory !== "All";

  const clearFilters = () => {
    onSearchChange("");
    onCategoryChange("All");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        titleAs="h2"
        title="My products"
        description="Manage, edit and list the products in your store."
        action={
          <Button variant="primary" onClick={onAdd}>
            <Plus aria-hidden className="size-4" />
            Add product
          </Button>
        }
      />

      <Panel className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
          <SearchField
            value={search}
            onChange={onSearchChange}
            ariaLabel="Search your products"
            placeholder="Search by name, description or category"
          />
          <ChipGroup
            className="pb-0"
            ariaLabel="Filter products by category"
            options={categories.map((name) => ({
              value: name,
              label: humanize(name) || name,
            }))}
            value={selectedCategory}
            onChange={onCategoryChange}
          />
        </div>
        <ResultMeta
          className="mt-4 border-t border-line pt-3"
          shown={products.length}
          total={total}
          noun="products"
          onClear={filtered ? clearFilters : undefined}
        />
      </Panel>

      {/* Nothing to show yet and a request is in flight: hold the grid shape with
          placeholders rather than flashing the "no products" empty state. */}
      {loading && products.length === 0 ? (
        <div className={GRID} aria-busy="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardPlaceholder key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Panel>
          <EmptyState
            icon={total === 0 ? PackagePlus : PackageSearch}
            title={total === 0 ? "No products yet" : "No products found"}
            direction={
              total === 0
                ? "Start building your store by adding your first product."
                : "Try adjusting your search or category filter."
            }
            action={
              total === 0 ? (
                <Button variant="outline" onClick={onAdd}>
                  <Plus aria-hidden className="size-4" />
                  Add your first product
                </Button>
              ) : (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              )
            }
          />
        </Panel>
      ) : (
        <>
          {/* Keep the existing cards mounted while refetching so search and paging
              do not collapse the grid and shove the layout around. */}
          <div
            className={cn(GRID, loading && "opacity-60 transition-opacity")}
            aria-busy={loading || undefined}
          >
            {products.map((product) => (
              <VendorProductCard
                key={product.id}
                product={product}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
          {pagination && <Pagination pagination={pagination} onPageChange={onPageChange} />}
        </>
      )}
    </div>
  );
}
