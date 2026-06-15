import { useState } from "react";

const product = {
  name: "Wireless Noise-Cancelling Headphones",
  brand: "SoundCore",
  category: "Electronics",
  price: 89,
  originalPrice: 129,
  rating: 4.5,
  reviewCount: 248,
  emoji: "🎧",
  inStock: true,
  stockCount: 12,
  sku: "SC-WH-1000XM4",
  tags: ["Wireless", "Noise Cancelling", "Bluetooth 5.0", "30hr Battery"],
  description: `Experience music the way it was meant to be heard. The SoundCore WH-1000XM4 
  delivers industry-leading noise cancellation powered by our proprietary HD Noise Cancelling 
  Processor, letting you focus on what matters most.`,
  features: [
    "Industry-leading noise cancellation with Dual Noise Sensor technology",
    "Up to 30 hours of battery life with quick charging (10 min = 5 hrs playback)",
    "Premium sound quality with 40mm drivers and LDAC codec support",
    "Multipoint connection — seamlessly switch between two Bluetooth devices",
    "Speak-to-chat automatically pauses music when you start a conversation",
    "Foldable design with carry case for travel convenience",
  ],
  specs: [
    { label: "Driver Size",        value: "40mm" },
    { label: "Frequency Response", value: "4Hz – 40,000Hz" },
    { label: "Battery Life",       value: "Up to 30 hours" },
    { label: "Charging",           value: "USB-C, 3.5 hrs full charge" },
    { label: "Bluetooth",          value: "Version 5.0" },
    { label: "Weight",             value: "254g" },
    { label: "Colors",             value: "Midnight Black, Silver" },
    { label: "Warranty",           value: "1 Year Manufacturer" },
  ],
};

export default function ProductDetail() {
  const [quantity, setQuantity] = useState(1);

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => Math.min(product.stockCount, q + 1));

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <a href="#" className="hover:text-gray-600 transition-colors">Home</a>
          <span>/</span>
          <a href="#" className="hover:text-gray-600 transition-colors">{product.category}</a>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate">{product.name}</span>
        </nav>

        {/* ── Top Section: Image + Info ── */}
        <div className="grid lg:grid-cols-2 gap-10 mb-12">

          {/* ── Product Image ── */}
          <div className="flex flex-col gap-4">

            {/* Main image */}
            <div className="bg-white border border-gray-200 rounded-2xl flex items-center justify-center h-[380px] text-[130px] select-none">
              {product.emoji}
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-3">
              {["🎧", "🎧", "🎧", "🎧"].map((e, i) => (
                <button
                  key={i}
                  className={`flex-1 bg-white border rounded-xl h-20 flex items-center justify-center text-3xl transition-colors ${
                    i === 0
                      ? "border-indigo-500 ring-2 ring-indigo-100"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* ── Product Info ── */}
          <div className="flex flex-col">

            {/* Brand + category */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                {product.category}
              </span>
              <span className="text-xs text-gray-400">{product.brand}</span>
            </div>

            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-3">
              {product.name}
            </h1>

            {/* Rating row */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i} width="15" height="15" viewBox="0 0 24 24"
                    fill={i < Math.floor(product.rating) ? "#f59e0b" : i < product.rating ? "#fcd34d" : "#e5e7eb"}
                    stroke="none"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
              <span className="text-sm text-gray-400">({product.reviewCount} reviews)</span>
              <span className="text-sm text-green-600 font-medium">· {product.reviewCount}+ sold</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-5">
              <span className="text-4xl font-bold text-gray-900">${product.price}</span>
              <span className="text-xl text-gray-400 line-through mb-0.5">${product.originalPrice}</span>
              <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg mb-1">
                {discount}% off
              </span>
            </div>

            {/* Short description */}
            <p className="text-gray-500 text-sm leading-relaxed mb-5 border-b border-gray-100 pb-5">
              {product.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors cursor-default"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">
                In stock —{" "}
                <span className="font-medium text-gray-800">{product.stockCount} units</span> left
              </span>
            </div>

            {/* SKU */}
            <p className="text-xs text-gray-400 mb-6">SKU: {product.sku}</p>

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
                    disabled={quantity === product.stockCount}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors text-lg font-medium"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-400">
                  Total:{" "}
                  <span className="font-semibold text-gray-700">${product.price * quantity}</span>
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-1">
                <button className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all">
                  Buy Now
                </button>
                <button className="flex-1 border-2 border-gray-900 text-gray-900 py-3 rounded-xl font-semibold text-sm hover:bg-gray-900 hover:text-white active:scale-[0.98] transition-all">
                  Add to Cart
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

        {/* ── Bottom Section: Features + Specs ── */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* Features */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Key Features</h2>
            <ul className="flex flex-col gap-3">
              {product.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Specs */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Specifications</h2>
            <div className="flex flex-col divide-y divide-gray-100">
              {product.specs.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-800 text-right max-w-[55%]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}