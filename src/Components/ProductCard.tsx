import { useState } from "react";
import type { Product } from "../types";
import { useNavigate } from "react-router-dom";

interface Props {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: Props) {
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();

  // const handleAdd = () => {
  //   if (!product.inStock) return;
  //   onAddToCart(product);
  //   setAdded(true);
  //   setTimeout(() => setAdded(false), 1500);
  // };
  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);

  }

  const handleProduct = (id: number) => {
     navigate(`/product/${id}`);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl cursor-pointer overflow-hidden hover:shadow-md transition-shadow flex flex-col" onClick={() => handleProduct(product.id)}>
 
      {/* Thumbnail */}
      <div className="bg-gray-50 h-36 flex items-center justify-center text-5xl relative">
        <img
          src={`http://localhost:3000/uploads/${product.image}`}
          alt={product.productName}
          className="h-full w-full object-contain"
        />

      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">

        {/* Category badge */}
        <span className="inline-block text-[10px] font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full w-fit mb-2">
          {product.Category.categoryName}
        </span>

        {/* Name */}
        <h3 className="font-semibold text-gray-900 mb-1 hover:text-blue-500">{product.productName}</h3>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed mb-3 flex-1 line-clamp-2">
          {product.productDescription}
        </p>

        

        {/* Price + button */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="font-bold text-gray-900 text-lg">${product.productPrice}</span>
          <button
            onClick= {handleAdd}
            
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${ added
                ? "bg-green-600 text-white"
                : "bg-gray-900 text-white hover:bg-gray-700"
                }` }
          >
            {added ? "Added ✓" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}