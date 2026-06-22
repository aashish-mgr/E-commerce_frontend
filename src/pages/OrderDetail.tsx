import { useState,useEffect } from "react";
import { authAPI } from "../api";
import { useParams } from "react-router-dom";
import type { Order,OrderItem } from "../types";
// ── Types ─────────────────────────────────────────────────────



// ── Seed data ─────────────────────────────────────────────────

// const ORDER: Order = {
//   id: "ORD-7821",
//   shippingAddress: "221B Baker Street, Kathmandu, Bagmati Province, Nepal",
//   phoneNumber: 9812345678,
//   totalAmount: 178,
//   orderStatus: "shipped",
//   createdAt: "2026-06-14T10:32:00Z",
//   OrderDetails: [
//     {
//       id: "od-1",
//       quantity: 1,
//       orderId: "ORD-7821",
//       Product: {
//         id: "p-1",
//         productName: "Wireless Headphones",
//         price: 89,
//         description: "Premium over-ear headphones with active noise cancellation and 30-hour battery life.",
//         category: "Electronics",
//         image: "🎧",
//       },
//     },
//     {
//       id: "od-2",
//       quantity: 2,
//       orderId: "ORD-7821",
//       Product: {
//         id: "p-2",
//         name: "Leather Wallet",
//         price: 45,
//         description: "Slim bi-fold wallet crafted from genuine full-grain leather with 6 card slots.",
//         category: "Accessories",
//         image: "👛",
//       },
//     },
//   ],
// };

// ── Status styling ───────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  pending:   { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  shipped:   { bg: "bg-blue-50",  text: "text-blue-700",  dot: "bg-blue-500" },
  delivered: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  cancelled: { bg: "bg-red-50",   text: "text-red-700",   dot: "bg-red-500" },
};

const STATUS_STEPS = ["pending", "shipped", "delivered"];

// ── Helpers ───────────────────────────────────────────────────

function formatPrice(n: number | string) {
  const value = typeof n === "number" ? n : Number(n);
  return isNaN(value) ? "$0.00" : `$${value.toFixed(2)}`;
}

function formatDate(iso: string ) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatPhone(phone: number) {
  const str = phone.toString();
  if (str.length === 10) {
    return `${str.slice(0, 3)}-${str.slice(3, 6)}-${str.slice(6)}`;
  }
  return str;
}

function lineTotal(item: OrderItem) {
  return item.Product.productPrice * item.quantity;
}

function totalItems(order: Order) {
  return order.OrderDetails?.reduce((sum, i) => sum + i.quantity, 0);
}

// ── Status Badge ──────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status.toLowerCase()] ?? STATUS_STYLES.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${s.bg} ${s.text} capitalize`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

// ── Status Progress Tracker ───────────────────────────────────

function StatusTracker({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  if (normalized === "cancelled") {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 flex items-center gap-3">
        <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 flex-shrink-0">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-red-700">Order Cancelled</p>
          <p className="text-xs text-red-500 mt-0.5">This order has been cancelled and will not be processed.</p>
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_STEPS.indexOf(normalized);

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-6">
      <div className="flex items-center">
        {STATUS_STEPS.map((step, i) => {
          const isComplete = i <= currentIndex;
          const isLast = i === STATUS_STEPS.length - 1;
          return (
            <div key={step} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                    isComplete ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isComplete ? (
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <p className={`text-xs font-medium mt-2 capitalize ${isComplete ? "text-gray-800" : "text-gray-400"}`}>
                  {step}
                </p>
              </div>
              {!isLast && (
                <div className={`flex-1 h-0.5 mx-2 -mt-5 transition-colors ${i < currentIndex ? "bg-indigo-600" : "bg-gray-100"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Order Item Row ────────────────────────────────────────────

function OrderItemRow({ item }: { item: OrderItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-100 rounded-xl p-4">
      <div className="flex items-start gap-4">

        {/* Image */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-3xl sm:text-4xl">
          {item.Product.image}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            {item.Product.Category?.categoryName}
          </span>
          <h3 className="font-semibold text-gray-900 mt-1.5">{item.Product.productName}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Qty: {item.quantity} × {formatPrice(item.Product.productPrice)}
          </p>

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-2 flex items-center gap-1"
          >
            {expanded ? "Hide description" : "View description"}
            <svg
              width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
              className={`transition-transform ${expanded ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {expanded && (
            <p className="text-xs text-gray-500 leading-relaxed mt-2 bg-gray-50 rounded-lg p-3">
              {item.Product.productDescription}
            </p>
          )}
        </div>

        {/* Line total */}
        <p className="text-sm font-bold text-gray-900 flex-shrink-0">
          {formatPrice(lineTotal(item))}
        </p>
      </div>
    </div>
  );
}

// ── Order Detail Page ─────────────────────────────────────────

export default function OrderDetail() {
  // const order = ORDER;

  const {id} = useParams();
  const [order, setOrder] = useState<Order>();
  const subtotal = order?.OrderDetails?.reduce((sum, i) => sum + lineTotal(i), 0) ?? 0;
  const shipping = (order?.totalAmount ?? 0) - subtotal;
 
  const getOrderDetail = async () => {
    try{
      const res = await authAPI.get(`/order/getOrderDetail/${id}`);
      console.log(res);
      setOrder(res.data?.data[0]);
    }
    catch(err) {
      console.log(err);
    }
  }

  useEffect(() => {
    getOrderDetail();

  }, [])
  

  
  

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Back link */}
        <a href="#" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-5">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Orders
        </a>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order {order?.id}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Placed on {order?.createdAt ? formatDate(order.createdAt) : 'N/A'}</p>
          </div>
          <StatusBadge status={order?.orderStatus ? order.orderStatus : 'N/A'} />
        </div>

        {/* Status tracker */}
        <div className="mb-6">
          <StatusTracker status={order?.orderStatus ? order.orderStatus : 'N/A'} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Left — Items + Shipping ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Items */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-base font-bold text-gray-900 mb-4">
                Items ({order ? totalItems(order) : 0})
              </h2>
              <div className="flex flex-col gap-3">
                {order?.OrderDetails?.map((item) => (
                  <OrderItemRow key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Shipping info */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-base font-bold text-gray-900 mb-4">Shipping Information</h2>
              <div className="flex flex-col gap-4">

                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs text-gray-400">Delivery Address</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{order?.shippingAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs text-gray-400">Contact Number</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{formatPhone(order?.phoneNumber? order.phoneNumber : 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right — Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-6 flex flex-col gap-4">
              <h2 className="text-base font-bold text-gray-900">Order Summary</h2>

              <div className="flex flex-col gap-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Shipping & Tax</span>
                  <span className="font-medium text-gray-800">
                    {shipping > 0 ? formatPrice(shipping) : "Free"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">{formatPrice(order?.totalAmount? order.totalAmount : 0)}</span>
              </div>

              <div className="flex flex-col gap-2 mt-1">
                {order?.orderStatus?.toLowerCase() === "delivered" && (
                  <button className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
                    Buy Again
                  </button>
                )}
                {(order?.orderStatus?.toLowerCase() === "pending" || order?.orderStatus?.toLowerCase() === "shipped") && (
                  <button className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors">
                    Track Shipment
                  </button>
                )}
                <button className="w-full border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Download Invoice
                </button>
                {order?.orderStatus?.toLowerCase() === "pending" && (
                  <button className="w-full border border-red-200 text-red-500 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                    Cancel Order
                  </button>
                )}
              </div>

              <p className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1 mt-1">
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Need help? Contact support
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}