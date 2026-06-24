import { useState } from "react";

// ── Types (your exact interfaces) ────────────────────────────

export interface Category {
  categoryName: string;
}

export interface Product {
  id: string;
  productName: string;
  productPrice: number;
  productDescription: string;
  image: string;
  Category: Category;
}

export interface User {
  userName: string;
  userEmail: string;
  userRole: string;
}

export interface Cart {
  Product: Product;
  id: string;
  quantity: number;
  selected: boolean;
}

export type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled";

export interface Order {
  id: string;
  shippingAddress: string;
  phoneNumber: number;
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
  OrderDetails: OrderItem[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  orderId: string;
  Product: Product;
}

// ── Seed data ─────────────────────────────────────────────────

const CURRENT_USER: User = {
  userName: "Alex Johnson",
  userEmail: "alex@example.com",
  userRole: "user",
};

// Only selected cart items are passed to the order page
const CART_ITEMS: Cart[] = [
  {
    id: "cart-1",
    quantity: 1,
    selected: true,
    Product: {
      id: "p-1",
      productName: "Wireless Headphones",
      productPrice: 89,
      productDescription: "Premium over-ear headphones with active noise cancellation and 30-hour battery life.",
      image: "🎧",
      Category: { categoryName: "Electronics" },
    },
  },
  {
    id: "cart-2",
    quantity: 2,
    selected: true,
    Product: {
      id: "p-2",
      productName: "Leather Wallet",
      productPrice: 45,
      productDescription: "Slim bi-fold wallet crafted from genuine full-grain leather with 6 card slots.",
      image: "👛",
      Category: { categoryName: "Accessories" },
    },
  },
  {
    id: "cart-3",
    quantity: 1,
    selected: true,
    Product: {
      id: "p-3",
      productName: "Mechanical Keyboard",
      productPrice: 149,
      productDescription: "TKL layout with tactile brown switches, per-key RGB backlighting, and aluminum body.",
      image: "⌨️",
      Category: { categoryName: "Electronics" },
    },
  },
];

const PAYMENT_METHODS = [
  { id: "card",   label: "Credit / Debit Card", icon: "💳" },
  { id: "paypal", label: "PayPal",               icon: "🅿️" },
  { id: "cod",    label: "Cash on Delivery",     icon: "💵" },
];

const TAX_RATE = 0.08;
const SHIPPING_THRESHOLD = 100;
const SHIPPING_FLAT = 9.99;

// ── Helpers ───────────────────────────────────────────────────

function formatPrice(n: number) {
  return `$${n.toFixed(2)}`;
}

function lineTotal(item: Cart) {
  return item.Product.productPrice * item.quantity;
}

// ── Input field component ─────────────────────────────────────

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, required, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full px-4 py-2.5 text-sm border rounded-lg outline-none transition-colors ${
    hasError
      ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100"
      : "border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
  }`;
}

// ── Success screen ────────────────────────────────────────────

function OrderSuccess({ orderId, onBack }: { orderId: string; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg width="30" height="30" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
        <p className="text-gray-500 text-sm mb-1">
          Your order has been placed successfully.
        </p>
        <p className="text-indigo-600 font-semibold text-sm mb-6">{orderId}</p>
        <p className="text-xs text-gray-400 mb-8">
          A confirmation will be sent to <span className="font-medium text-gray-600">{CURRENT_USER.userEmail}</span>
        </p>
        <div className="flex flex-col gap-3">
          <button className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors">
            Track Order
          </button>
          <button
            onClick={onBack}
            className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Place Order Page ──────────────────────────────────────────

export default function PlaceOrder() {
  // Form state
  const [address, setAddress]     = useState("");
  const [phone, setPhone]         = useState("");
  const [note, setNote]           = useState("");
  const [payment, setPayment]     = useState("card");

  // Card fields (shown only when payment === "card")
  const [cardNumber, setCardNumber]   = useState("");
  const [cardExpiry, setCardExpiry]   = useState("");
  const [cardCvc, setCardCvc]         = useState("");

  // UI state
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [loading, setLoading]     = useState(false);
  const [placed, setPlaced]       = useState(false);
  const [orderId, setOrderId]     = useState("");

  // Quantities (per cart item, editable on this page too)
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(CART_ITEMS.map((c) => [c.id, c.quantity]))
  );

  const updateQty = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] ?? 1) + delta),
    }));
  };

  // Pricing
  const subtotal = CART_ITEMS.reduce(
    (sum, item) => sum + item.Product.productPrice * (quantities[item.id] ?? item.quantity),
    0
  );
  const shipping  = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const tax       = subtotal * TAX_RATE;
  const total     = subtotal + shipping + tax;

  // Validation
  const validate = () => {
    const e: Record<string, string> = {};
    if (!address.trim())
      e.address = "Shipping address is required.";
    if (!phone.trim())
      e.phone = "Phone number is required.";
    else if (!/^\+?[\d\s\-]{7,15}$/.test(phone))
      e.phone = "Enter a valid phone number.";
    if (payment === "card") {
      if (!cardNumber.trim()) e.cardNumber = "Card number is required.";
      if (!cardExpiry.trim()) e.cardExpiry = "Expiry date is required.";
      if (!cardCvc.trim())    e.cardCvc    = "CVC is required.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setLoading(true);

    // Simulate API call — replace with your real POST /orders
    setTimeout(() => {
      const id = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      setOrderId(id);
      setLoading(false);
      setPlaced(true);
    }, 1800);
  };

  if (placed) return <OrderSuccess orderId={orderId} onBack={() => setPlaced(false)} />;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-7">
          <a href="#" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-4">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Cart
          </a>
          <h1 className="text-2xl font-bold text-gray-900">Place Order</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Ordering as <span className="font-medium text-gray-700">{CURRENT_USER.userName}</span>{" "}
            · {CURRENT_USER.userEmail}
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8">
          {["Shipping", "Payment", "Review"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                i === 0 ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"
              }`}>
                <span>{i + 1}</span>
                <span>{step}</span>
              </div>
              {i < 2 && <div className="w-6 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Left column — Forms ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Shipping details */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center">1</span>
                <h2 className="text-base font-bold text-gray-900">Shipping Details</h2>
              </div>

              <div className="flex flex-col gap-4">
                {/* Prefilled user info — read only */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Full Name">
                    <input
                      type="text"
                      value={CURRENT_USER.userName}
                      readOnly
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </Field>
                  <Field label="Email Address">
                    <input
                      type="email"
                      value={CURRENT_USER.userEmail}
                      readOnly
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </Field>
                </div>

                {/* Phone */}
                <Field label="Phone Number" required error={errors.phone}>
                  <div className="flex gap-2">
                    <span className="flex items-center px-3 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 whitespace-nowrap">
                      +977
                    </span>
                    <input
                      type="tel"
                      placeholder="98XXXXXXXX"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: "" })); }}
                      className={inputClass(!!errors.phone) + " flex-1"}
                    />
                  </div>
                </Field>

                {/* Shipping address */}
                <Field label="Shipping Address" required error={errors.address}>
                  <textarea
                    rows={3}
                    placeholder="Street address, City, Province, Postal Code"
                    value={address}
                    onChange={(e) => { setAddress(e.target.value); setErrors((p) => ({ ...p, address: "" })); }}
                    className={inputClass(!!errors.address) + " resize-none"}
                  />
                </Field>

                {/* Delivery note */}
                <Field label="Delivery Note (optional)">
                  <input
                    type="text"
                    placeholder="e.g. Leave at the door, call on arrival..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className={inputClass(false)}
                  />
                </Field>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center">2</span>
                <h2 className="text-base font-bold text-gray-900">Payment Method</h2>
              </div>

              {/* Method selector */}
              <div className="grid sm:grid-cols-3 gap-3 mb-5">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPayment(m.id)}
                    className={`flex flex-col items-center gap-2 py-4 px-3 border-2 rounded-xl text-xs font-semibold transition-colors ${
                      payment === m.id
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-2xl">{m.icon}</span>
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Card fields */}
              {payment === "card" && (
                <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <Field label="Card Number" required error={errors.cardNumber}>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                          setCardNumber(val.replace(/(.{4})/g, "$1 ").trim());
                          setErrors((p) => ({ ...p, cardNumber: "" }));
                        }}
                        className={inputClass(!!errors.cardNumber)}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">💳</span>
                    </div>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Expiry Date" required error={errors.cardExpiry}>
                      <input
                        type="text"
                        placeholder="MM / YY"
                        maxLength={7}
                        value={cardExpiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "").slice(0, 4);
                          if (val.length > 2) val = val.slice(0, 2) + " / " + val.slice(2);
                          setCardExpiry(val);
                          setErrors((p) => ({ ...p, cardExpiry: "" }));
                        }}
                        className={inputClass(!!errors.cardExpiry)}
                      />
                    </Field>
                    <Field label="CVC" required error={errors.cardCvc}>
                      <input
                        type="text"
                        placeholder="123"
                        maxLength={3}
                        value={cardCvc}
                        onChange={(e) => {
                          setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 3));
                          setErrors((p) => ({ ...p, cardCvc: "" }));
                        }}
                        className={inputClass(!!errors.cardCvc)}
                      />
                    </Field>
                  </div>
                </div>
              )}

              {payment === "paypal" && (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700 flex items-center gap-2">
                  <span className="text-xl">🅿️</span>
                  You'll be redirected to PayPal to complete your payment after confirming.
                </div>
              )}

              {payment === "cod" && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700 flex items-center gap-2">
                  <span className="text-xl">💵</span>
                  Pay in cash when your order is delivered to your door.
                </div>
              )}
            </div>
          </div>

          {/* ── Right column — Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center">3</span>
                <h2 className="text-base font-bold text-gray-900">Order Summary</h2>
              </div>

              {/* Item list */}
              <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
                {CART_ITEMS.map((item) => {
                  const qty = quantities[item.id] ?? item.quantity;
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      {/* Image */}
                      <div className="w-12 h-12 flex-shrink-0 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-xl">
                        {item.Product.image}
                      </div>

                      {/* Name + qty controls */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {item.Product.productName}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {item.Product.Category.categoryName}
                        </p>

                        {/* Inline quantity control */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            disabled={qty <= 1}
                            className="w-5 h-5 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:text-gray-200 disabled:cursor-not-allowed transition-colors text-xs"
                          >
                            −
                          </button>
                          <span className="text-xs font-semibold text-gray-700 w-4 text-center">{qty}</span>
                          <button
                            onClick={() => updateQty(item.id, 1)}
                            className="w-5 h-5 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Line total */}
                      <p className="text-sm font-semibold text-gray-800 flex-shrink-0">
                        {formatPrice(item.Product.productPrice * qty)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Price breakdown */}
              <div className="border-t border-gray-100 pt-4 flex flex-col gap-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? "text-green-600" : "text-gray-800"}`}>
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax (8%)</span>
                  <span className="font-medium text-gray-500">{formatPrice(tax)}</span>
                </div>
              </div>

              {shipping > 0 && (
                <p className="text-[10px] text-gray-400 bg-gray-50 rounded-lg px-3 py-2 -mt-1">
                  Add{" "}
                  <span className="font-semibold text-gray-600">
                    {formatPrice(SHIPPING_THRESHOLD - subtotal)}
                  </span>{" "}
                  more for free shipping 🚚
                </p>
              )}

              {/* Total */}
              <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">{formatPrice(total)}</span>
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] disabled:bg-indigo-300 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                    </svg>
                    Placing Order...
                  </>
                ) : (
                  <>
                    Proceed to Pay · {formatPrice(total)}
                  </>
                )}
              </button>

              {/* Trust note */}
              <p className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Secured with SSL encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}