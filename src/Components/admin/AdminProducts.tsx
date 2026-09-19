import { useState } from "react";
import type { AdminProduct } from "./types";
import type { PaginationMeta } from "../../types";
import Pagination from "../Pagination";
import { getImageUrl } from "../../api";

function ProductThumb({ image, name }: { image: string; name: string }) {
  const [error, setError] = useState(false);
  const src = getImageUrl(image);
  if (!src || error) {
    return (
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-300">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }
  return (
    <img src={src} alt={name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" onError={() => setError(true)} />
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

  const setStock = (productId: string, value: string) =>
    setStockDrafts((d) => ({ ...d, [productId]: value }));

  const commitStock = (product: AdminProduct) => {
    const raw = stockDrafts[product.id] ?? String(product.stock);
    const next = Math.max(0, Math.floor(Number(raw) || 0));
    setStock(product.id, String(next));
    if (next !== Number(product.stock)) onUpdateStock(product.id, next);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">All Products</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Review every product listed by vendors across the store
        </p>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by product name or description..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
            {search && (
              <button onClick={() => onSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`text-xs px-3.5 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === cat
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing <span className="font-semibold text-gray-700">{products.length}</span> of{" "}
            <span className="font-semibold text-gray-700">{total}</span> products
          </span>
          {(search || selectedCategory !== "All") && (
            <button
              onClick={() => {
                onSearchChange("");
                onCategoryChange("All");
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {products.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-400">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-700">
              {total === 0 ? "No products yet" : "No products match your search"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {total === 0 ? "Products added by vendors will appear here" : "Try adjusting your search or filter"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50/50">
                    <th className="px-5 py-3 font-medium">Product</th>
                    <th className="px-5 py-3 font-medium">Vendor</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium">Price</th>
                    <th className="px-5 py-3 font-medium">Stock</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <ProductThumb image={product.image} name={product.productName} />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate max-w-[180px]">
                              {product.productName}
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-[180px]">
                              {product.productDescription}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-gray-900 text-sm">{product.User?.userName ?? "-"}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[160px]">
                          {product.User?.userEmail ?? ""}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {product.Category?.categoryName ?? "-"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-900 font-semibold">
                        Rs. {Number(product.productPrice).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            value={stockDrafts[product.id] ?? String(product.stock)}
                            onChange={(e) => setStock(product.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitStock(product);
                            }}
                            onBlur={() => commitStock(product)}
                            className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                          />
                          <button
                            onClick={() => commitStock(product)}
                            title="Save stock"
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                              <polyline points="17 21 17 13 7 13 7 21" />
                              <polyline points="7 3 7 8 15 8" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => onDelete(product)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete product"
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination && <Pagination pagination={pagination} onPageChange={onPageChange} />}
          </>
        )}
      </div>
    </div>
  );
}