import { useState } from "react";

// Props:
//   product: { id, name, price, category, emoji }
export default function ProductCard({ product }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group">

      {/* Thumbnail */}
      <div className="bg-gray-50 h-44 flex items-center justify-center text-6xl group-hover:bg-gray-100 transition-colors">
        {product.emoji}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-gray-400 mb-1">{product.category}</p>
        <h3 className="font-semibold text-gray-900 mb-3">{product.name}</h3>

        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-900">{product.price}</span>
          <button
            onClick={handleAdd}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
              added
                ? "bg-green-600 text-white"
                : "bg-gray-900 text-white hover:bg-gray-700"
            }`}
          >
            {added ? "Added ✓" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}