import type { VendorProduct } from "./types";
import type { PaginationMeta } from "../../types";
import VendorProductCard from "./VendorProductCard";
import Pagination from "../Pagination";

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

  return (
    <div className="space-y-5">
      {/* Header + Add button */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Products</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage, edit, and list products for your store
          </p>
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-700 active:scale-95 transition-all duration-200 shadow-sm flex-shrink-0"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, description, or category..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
            {search && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Category Filter */}
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

        {/* Results count */}
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

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center">
          {total === 0 ? (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-400">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-gray-700">No products yet</p>
              <p className="text-sm text-gray-500 mt-1 mb-5">Start building your store by adding your first product</p>
              <button
                onClick={onAdd}
                className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Your First Product
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-400">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-gray-700">No products found</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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