import { PackagePlus, PackageSearch, Plus } from "lucide-react";
import type { PaginationMeta } from "../../types";
import Pagination from "../Pagination";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { ChipGroup, ResultMeta, SearchField } from "../ui/FilterBar";
import { PageHeader } from "../ui/PageHeader";
import { Panel } from "../ui/Panel";
import { humanize } from "../../lib/format";
import VendorProductCard from "./VendorProductCard";
import type { VendorProduct } from "./types";

export default function VendorProducts({
  products,
  categories,
  search,
  selectedCategory,
  pagination,
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

      {products.length === 0 ? (
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
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
