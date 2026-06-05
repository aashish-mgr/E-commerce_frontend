import { useState } from "react";
import type { Product } from "../types";

interface Props {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: Props) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!product.inStock) return;
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">

      {/* Thumbnail */}
      <div className="bg-gray-50 h-36 flex items-center justify-center text-5xl relative">
        {product.emoji}
        {!product.inStock && (
          <span className="absolute top-2 right-2 text-[10px] font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
            Out of stock
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">

        {/* Category badge */}
        <span className="inline-block text-[10px] font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full w-fit mb-2">
          {product.category}
        </span>

        {/* Name */}
        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed mb-3 flex-1 line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i} width="12" height="12" viewBox="0 0 24 24"
              fill={i < Math.floor(product.rating) ? "#f59e0b" : "#e5e7eb"}
              stroke={i < Math.floor(product.rating) ? "#f59e0b" : "#e5e7eb"}
              strokeWidth="1"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          ))}
          <span className="text-xs text-gray-400 ml-1">{product.rating}</span>
        </div>

        {/* Price + button */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="font-bold text-gray-900 text-lg">${product.price}</span>
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              !product.inStock
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : added
                ? "bg-green-600 text-white"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {added ? "Added ✓" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}