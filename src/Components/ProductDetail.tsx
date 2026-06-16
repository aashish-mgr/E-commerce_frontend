import { useState,useEffect } from "react";
import { useParams } from "react-router-dom";
import { authAPI } from "../api";
import type { Product } from "../types";

// const product = {
//   name: "Wireless Noise-Cancelling Headphones",
//   brand: "SoundCore",
//   category: "Electronics",
//   price: 89,
//   originalPrice: 129,
//   rating: 4.5,
//   reviewCount: 248,
//   emoji: "🎧",
//   inStock: true,
//   stockCount: 12,
//   sku: "SC-WH-1000XM4",
//   tags: ["Wireless", "Noise Cancelling", "Bluetooth 5.0", "30hr Battery"],
//   description: `Experience music the way it was meant to be heard. The SoundCore WH-1000XM4 
//   delivers industry-leading noise cancellation powered by our proprietary HD Noise Cancelling 
//   Processor, letting you focus on what matters most.`,
  
// };

export default function ProductDetail() {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => Math.min(50, q + 1));


  const getProduct = async () => {
    if (!id) return;
    const res = await authAPI.get(`/product/getSingle/${id}`);
    setProduct(res.data?.data ?? null);
  };

  const addToCart = async (q: number) => {
    if (!id) return;
    const res = await authAPI.post('cart/addToCart', {
      quantity: q,
      productId: id
    })
    if(res.status === 200) {
      setAdded(true);
    }
    
  }

  useEffect(() => {
    getProduct();
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <p className="text-center text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-6xl mx-auto px-4 py-10">


        {/* ── Top Section: Image + Info ── */}
        <div className="grid lg:grid-cols-2 gap-10 mb-12">

          {/* ── Product Image ── */}
          <div className="flex flex-col gap-4">

            {/* Main image */}
            <div className="bg-white border border-gray-200 rounded-2xl flex items-center justify-center h-[380px] text-[130px] select-none">
              <img
          src={`http://localhost:3000/uploads/${product.image}`}
          alt={product.productName}
          className="h-full w-full object-contain"
        />
            </div>

           
          </div>

          {/* ── Product Info ── */}
          <div className="flex flex-col">

            {/* Brand + category */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                {product.Category.categoryName}
              </span>
              <span className="text-xs text-gray-400">brand</span>
            </div>

            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-3">
              {product.productName}
            </h1>

           

            {/* Price */}
            <div className="flex items-end gap-3 mb-5">
              <span className="text-4xl font-bold text-gray-900">${product.productPrice}</span>
              <span className="text-xl text-gray-400 line-through mb-0.5">${Math.floor(110/100 * product.productPrice)}</span>
              <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg mb-1">
                10% off
              </span>
            </div>

            {/* Short description */}
            <p className="text-gray-500 text-sm leading-relaxed mb-5 border-b border-gray-100 pb-5">
              {product.productDescription}
            </p>

            {/* Tags */}
           

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">
                In stock —{" "}
                <span className="font-medium text-gray-800">10 units</span> left
              </span>
            </div>

          

            {/* ── Quantity + Buttons ── */}
            <div className="flex flex-col gap-3">

              {/* Quantity counter */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 w-16">Quantity</span>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={decrement}
                    disabled={quantity === 1}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors text-lg font-medium"
                  >
                    −
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center text-sm font-semibold text-gray-900 border-x border-gray-200">
                    {quantity}
                  </span>
                  <button
                    onClick={increment}
                    // disabled={quantity === product.stockCount}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors text-lg font-medium"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-400">
                  Total:{" "}
                  <span className="font-semibold text-gray-700">${product.productPrice * quantity}</span>
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-1">
                <button className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all">
                  Buy Now
                </button>
                <button className={`flex-1 border-2 border-gray-900 text-gray-900 py-3 rounded-xl font-semibold text-sm hover:bg-gray-900 hover:text-white active:scale-[0.98] transition-all  ${added? "bg-green-600 text-white"
                : "bg-gray-900 text-white hover:bg-gray-700"}` }
                onClick={() => addToCart(quantity)}>
                  {added ? "Added ✓" : "Add to Cart"}
                </button>
                <button className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors flex-shrink-0">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                  </svg>
                </button>
              </div>

              {/* Reassurance strip */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { icon: "🚚", label: "Free Delivery",   sub: "Orders over $50" },
                  { icon: "↩️", label: "Easy Returns",    sub: "30-day window" },
                  { icon: "🔒", label: "Secure Payment",  sub: "SSL encrypted" },
                ].map(({ icon, label, sub }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center text-center bg-gray-50 border border-gray-100 rounded-xl py-3 px-2"
                  >
                    <span className="text-xl mb-1">{icon}</span>
                    <p className="text-xs font-medium text-gray-700">{label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

     

      </div>
    </div>
  );
}