import { useState } from "react";
import { ImageOff, Package, Save, Trash2 } from "lucide-react";
import { getImageUrl } from "../../api";
import type { PaginationMeta } from "../../types";
import Pagination from "../Pagination";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { ChipGroup, ResultMeta, SearchField } from "../ui/FilterBar";
import { Input } from "../ui/Input";
import { PageHeader } from "../ui/PageHeader";
import { Panel } from "../ui/Panel";
import { Price } from "../ui/Price";
import { cn } from "../../lib/cn";
import { humanize } from "../../lib/format";
import type { AdminProduct } from "./types";

function ProductThumb({ image, name }: { image: string; name: string }) {
  const [error, setError] = useState(false);
  const src = getImageUrl(image);

  if (!src || error) {
    return (
      <span className="flex size-11 shrink-0 items-center justify-center rounded-tile bg-paper-2 text-muted">
        <ImageOff aria-hidden className="size-4" />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setError(true)}
      className="size-11 shrink-0 rounded-tile object-cover"
    />
  );
}

export default function AdminProducts({
  products,
  categories,
  pagination,
  search,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
  onPageChange,
  onUpdateStock,
  onDelete,
}: {
  products: AdminProduct[];
  categories: string[];
  pagination: PaginationMeta | null;
  search: string;
  selectedCategory: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onUpdateStock: (productId: string, stock: number) => void;
  onDelete: (product: AdminProduct) => void;
}) {
  const total = pagination?.total ?? products.length;
  const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({});
  const filtered = Boolean(search) || selectedCategory !== "All";

  const setStock = (productId: string, value: string) =>
    setStockDrafts((drafts) => ({ ...drafts, [productId]: value }));

  const commitStock = (product: AdminProduct) => {
    const raw = stockDrafts[product.id] ?? String(product.stock);
    const next = Math.max(0, Math.floor(Number(raw) || 0));
    setStock(product.id, String(next));
    if (next !== Number(product.stock)) onUpdateStock(product.id, next);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        titleAs="h2"
        title="All products"
        description="Review every product vendors have listed, adjust stock and remove listings."
      />

      <Panel className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
          <SearchField
            value={search}
            onChange={onSearchChange}
            ariaLabel="Search products"
            placeholder="Search by name or description"
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
          onClear={
            filtered
              ? () => {
                  onSearchChange("");
                  onCategoryChange("All");
                }
              : undefined
          }
        />
      </Panel>

      <Panel>
        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title={total === 0 ? "No products yet" : "No products match your search"}
            direction={
              total === 0
                ? "Products added by vendors will appear here."
                : "Try adjusting your search or category filter."
            }
            action={
              filtered ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    onSearchChange("");
                    onCategoryChange("All");
                  }}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-paper-2/60 text-ink-2">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Product
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Vendor
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Category
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Price
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Stock
                    </th>
                    <th scope="col" className="px-5 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {products.map((product) => {
                    const stock = Number(product.stock) || 0;
                    return (
                      <tr
                        key={product.id}
                        className="transition-colors hover:bg-paper-2/40"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <ProductThumb
                              image={product.image}
                              name={product.productName}
                            />
                            <div className="min-w-0 max-w-[16rem]">
                              <p className="truncate font-medium text-ink">
                                {product.productName}
                              </p>
                              <p className="truncate text-xs text-muted">
                                {product.productDescription}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <p className="truncate text-ink">
                            {product.User?.userName ?? "—"}
                          </p>
                          <p className="truncate text-xs text-muted">
                            {product.User?.userEmail ?? ""}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-block rounded-full bg-paper-2 px-2.5 py-1 text-xs font-medium text-ink-2">
                            {product.Category?.categoryName ?? "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <Price
                            value={product.productPrice}
                            className="font-semibold text-ink"
                          />
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={0}
                              aria-label={`Stock for ${product.productName}`}
                              className="h-9 w-24 text-sm tabular-nums"
                              value={stockDrafts[product.id] ?? String(stock)}
                              onChange={(event) => setStock(product.id, event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") commitStock(product);
                              }}
                              onBlur={() => commitStock(product)}
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Save stock"
                              aria-label={`Save stock for ${product.productName}`}
                              onClick={() => commitStock(product)}
                            >
                              <Save aria-hidden className="size-4" />
                            </Button>
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-xs font-medium",
                                stock === 0
                                  ? "bg-crimson-soft text-crimson"
                                  : stock <= 5
                                    ? "bg-marigold-soft text-amber"
                                    : "bg-paper-2 text-muted",
                              )}
                            >
                              {stock === 0 ? "Out" : `${stock} left`}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Button
                            size="icon"
                            variant="danger"
                            title={`Delete ${product.productName}`}
                            aria-label={`Delete ${product.productName}`}
                            onClick={() => onDelete(product)}
                          >
                            <Trash2 aria-hidden className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {pagination && <Pagination pagination={pagination} onPageChange={onPageChange} />}
          </>
        )}
      </Panel>
    </div>
  );
}
