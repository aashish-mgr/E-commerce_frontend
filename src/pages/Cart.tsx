import { useState,useEffect } from "react";
import { authAPI } from "../api";
import type { Cart } from "../types";
import { Link,useNavigate} from "react-router-dom";
import { setCart } from "../store/cartSlice";

// ── Types ─────────────────────────────────────────────────────

// interface CartItem {
//   id: number;
//   name: string;
//   brand: string;
//   category: string;
//   price: number;
//   emoji: string;
//   maxQty: number;
//   quantity: number;
//   selected: boolean;
// }

// ── Seed data ─────────────────────────────────────────────────

// const INITIAL_ITEMS: Cart[] = [
//   { id: 1, name: "Wireless Headphones",   brand: "SoundCore",  category: "Electronics", price: 89,  emoji: "🎧", maxQty: 10, quantity: 1, selected: true  },
//   { id: 2, name: "Running Shoes",         brand: "StridePro",  category: "Footwear",    price: 120, emoji: "👟", maxQty: 5,  quantity: 2, selected: true  },
//   { id: 3, name: "Leather Wallet",        brand: "CraftedCo",  category: "Accessories", price: 45,  emoji: "👛", maxQty: 8,  quantity: 1, selected: false },
//   { id: 4, name: "Mechanical Keyboard",   brand: "TypeMaster", category: "Electronics", price: 149, emoji: "⌨️", maxQty: 4,  quantity: 1, selected: true  },
// ];

const SHIPPING_THRESHOLD = 50; // free shipping above this
const TAX_RATE           = 0.08;
const SHIPPING_FLAT      = 9.99;

// ── Helpers ───────────────────────────────────────────────────
 

// ── Sub-components ────────────────────────────────────────────

function QuantityControl({
  value,
  max,
  onDecrement,
  onIncrement,
}: {
  value: number;
  max: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden w-fit">
      <button
        onClick={onDecrement}
        disabled={value <= 1}
        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-base"
      >
        −
      </button>
      <span className="w-9 h-8 flex items-center justify-center text-sm font-semibold text-gray-900 border-x border-gray-200">
        {value}
      </span>
      <button
        onClick={onIncrement}
        disabled={value >= max}
        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-base"
      >
        +
      </button>
    </div>
  );
}

function CartItemRow({
  item,
  onToggleSelect,
  onIncrement,
  onDecrement,
  onRemove,
}: {
  item: Cart;
  onToggleSelect: (id: string) => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      className={`bg-white border rounded-xl p-4 sm:p-5 flex items-start gap-4 transition-all duration-200 ${
        item.selected ? "border-indigo-200 shadow-sm" : "border-gray-200"
      }`}
    >
      {/* Checkbox */}
      <div className="pt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={item.selected}
          onChange={() => onToggleSelect(item.id)}
          className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
        />
      </div>

      {/* Thumbnail */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-3xl sm:text-4xl select-none">
        <img
          src={`http://localhost:3000/uploads/${item.Product.image}`}
          alt={item.Product.productName}
          className="h-full w-full object-contain"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {item.Product.Category?.categoryName}
            </span>
            <h3 className="font-semibold text-gray-900 mt-1 truncate">{item.Product.productName}</h3>
            <p className="text-xs text-gray-400 mt-0.5">brand</p>
          </div>

          {/* Unit price */}
          <p className="text-base font-bold text-gray-900 shrink-0">
           {(item.Product.productPrice)}
          </p>
        </div>

        {/* Bottom row — qty + line total + remove */}
        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <QuantityControl
              value={item.quantity}
              max={15}
              onDecrement={() => onDecrement(item.id)}
              onIncrement={() => onIncrement(item.id)}
            />
            <span className="text-xs text-gray-400">
              Subtotal:{" "}
              <span className="font-semibold text-gray-700">
                {item.Product.productPrice * item.quantity}
              </span>
            </span>
          </div>

          {/* Remove button */}
          <button
            onClick={() => onRemove(item.id)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Cart Page ─────────────────────────────────────────────────

export default function Cart() {
  const [items, setItems] = useState<Cart[]>([]);

  // ── Derived values ────────────────────────────────────────

  const selectedItems  = items.filter((i) => i.selected);
  const allSelected    = items.length > 0 && items.every((i) => i.selected);
  const someSelected   = items.some((i) => i.selected);

  const subtotal       = selectedItems.reduce((sum, i) => sum + i.Product.productPrice * i.quantity, 0);

  const shipping       = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FLAT;
  const tax            = subtotal * TAX_RATE;
  const total          = subtotal + shipping + tax;
  const totalItems     = items.reduce((sum, i) => sum + i.quantity, 0);
  const selectedCount  = selectedItems.reduce((sum, i) => sum + i.quantity, 0);
  const navigate = useNavigate();

  // ── Handlers ─────────────────────────────────────────────

  const toggleSelect   = (id: string) => setItems((prev) => prev.map((i) => i.id === id ? { ...i, selected: !i.selected } : i));
  const toggleAll      = () => setItems((prev) => prev.map((i) => ({ ...i, selected: !allSelected })));
  const increment      = (id: string) => setItems((prev) => prev.map((i) => i.id === id && i.quantity < 15? { ...i, quantity: i.quantity + 1 } : i));
  const decrement      = (id: string) => setItems((prev) => prev.map((i) => i.id === id && i.quantity > 1 ? { ...i, quantity: i.quantity - 1 } : i));


  const getCartItems = async () => {
    try {
      const res = await authAPI.get('/cart/getMyCarts');
      setItems(res.data?.data ?? []);
    } catch (err) {
      setItems([]);
    }
  }

  useEffect(() => {
    getCartItems();
  }, []);

  const placeOrder = () => {
    setCart(selectedItems);
    navigate("/placeOrder");
  }

  const deleteCart = async (id: string) => {
    try {
      if (!id) return;
      await authAPI.delete(`/cart/delete/${id}`);
      await getCartItems();
    } catch (err) {
      alert("Something went wrong");
    }
  }




  // ── Render ────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
            </p>
          </div>
          <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (

          /* ── Empty state ── */
          <div className="bg-white border border-gray-200 rounded-2xl py-24 flex flex-col items-center text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Your cart is empty</h2>
            <p className="text-gray-400 text-sm mb-6">Looks like you haven't added anything yet.</p>
            <Link to="/dashboard" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
              Browse Products
            </Link>
          </div>

        ) : (
          <div className="flex flex-col lg:flex-row gap-6">

            {/* ── Left — Item list ── */}
            <div className="flex-1 flex flex-col gap-4">

              {/* Select-all toolbar */}
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Select All
                    <span className="text-gray-400 font-normal ml-1">({items.length} items)</span>
                  </span>
                </label>

                {someSelected && (
                  <button
                    onClick={() => {
                      selectedItems.map(i => deleteCart(i.id));
                    }}
                    className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                    </svg>
                    Remove selected
                  </button>
                )}
              </div>

              {/* Items */}
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onToggleSelect={toggleSelect}
                  onIncrement={increment}
                  onDecrement={decrement}
                  onRemove={deleteCart}
                />
              ))}

              {/* Free shipping progress bar */}
              {subtotal < SHIPPING_THRESHOLD && subtotal > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">
                      Add{" "}
                      <span className="font-semibold text-gray-900">
                        {SHIPPING_THRESHOLD - subtotal}
                      </span>{" "}
                      more for free shipping
                    </span>
                    <span className="text-xs text-gray-400">🚚 Free over ${SHIPPING_THRESHOLD}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── Right — Order summary ── */}
            <div className="w-full lg:w-85 shrink-0">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-6 flex flex-col gap-4">

                <h2 className="text-base font-bold text-gray-900">Order Summary</h2>

                {/* Selected count notice */}
                {selectedCount > 0 ? (
                  <p className="text-xs text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2">
                    Calculating for{" "}
                    <span className="font-semibold">{selectedCount} selected {selectedCount === 1 ? "item" : "items"}</span>
                  </p>
                ) : (
                  <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                    No items selected. Check the boxes to include items.
                  </p>
                )}

                

                {/* Price breakdown */}
                <div className="flex flex-col gap-2.5 border-t border-gray-100 pt-4">
                  <PriceLine label="Subtotal"  value={subtotal.toFixed(2)} />
                 
                  <PriceLine
                    label="Shipping"
                    value={shipping === 0 ? (subtotal === 0 ? "—" : "Free") : (shipping.toFixed(2))}
                    highlight={shipping === 0 && subtotal > 0 ? "green" : undefined}
                  />
                  <PriceLine label={`Tax (${(TAX_RATE * 100).toFixed(0)}%)`} value={(tax.toFixed(2))} muted />
                </div>

                {/* Total */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">{total.toFixed(2)}</span>
                </div>

                {/* Proceed button */}
                <button
                  disabled={selectedCount === 0}
                  onClick={placeOrder}
                  className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
                >
                  {selectedCount === 0 ? "Select items to checkout" : "Proceed to Payment →"}
                </button>

                {/* Accepted payments */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {["Visa", "Mastercard", "PayPal", "Apple Pay"].map((m) => (
                    <span
                      key={m}
                      className="text-[10px] font-medium text-gray-400 border border-gray-200 rounded px-2 py-0.5"
                    >
                      {m}
                    </span>
                  ))}
                </div>

                {/* Security note */}
                <p className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Secure SSL encrypted checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Price line helper ──────────────────────────────────────────

function PriceLine({
  label,
  value,
  highlight,
  muted,
}: {
  label: string;
  value: string;
  highlight?: "green";
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={muted ? "text-gray-400" : "text-gray-600"}>{label}</span>
      <span
        className={`font-medium ${
          highlight === "green"
            ? "text-green-600"
            : muted
            ? "text-gray-400"
            : "text-gray-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}