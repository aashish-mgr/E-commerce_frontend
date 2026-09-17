import { useState, useEffect } from "react";
import { authAPI, getImageUrl } from "../api";
import { useNavigate } from "react-router-dom";
import { showErrorToast } from "../lib/toast";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import Pagination from "../Components/Pagination";
// ── Types ─────────────────────────────────────────────────────
import type { Order, OrderStatus, PaginationMeta } from "../types";

const STATUS_TABS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

// ── Status badge config ───────────────────────────────────────

const STATUS_STYLES: Record<
  OrderStatus,
  { bg: string; text: string; dot: string; label: string }
> = {
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    label: "Pending",
  },
  shipped: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    label: "Shipped",
  },
  delivered: {
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-500",
    label: "Delivered",
  },
  cancelled: {
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
    label: "Cancelled",
  },
};

// ── Helpers ───────────────────────────────────────────────────

function formatPrice(n: number | string) {
  const value = typeof n === "number" ? n : Number(n);
  return isNaN(value) ? "Rs. 0.00" : `Rs. ${value.toFixed(2)}`;
}

function orderTotal(order: Order) {
  return order.OrderDetails.reduce((sum, i) => {
    const price =
      typeof i.Product.productPrice === "number"
        ? i.Product.productPrice
        : Number(i.Product.productPrice);
    return sum + (isNaN(price) ? 0 : price * i.quantity);
  }, 0);
}

function orderItemCount(order: Order) {
  return order.OrderDetails.reduce((sum, i) => sum + i.quantity, 0);
}

// ── Status Badge ──────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ── Order Card ────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded
    ? order.OrderDetails
    : order.OrderDetails.slice(0, 2);
  const hiddenCount = order.OrderDetails.length - visibleItems.length;
const navigate = useNavigate();
  const viewDetail = (id: string) => {
     if(!id) return;
     navigate(`/orderDetail/${id}`);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-gray-400">Order ID</p>
            <p className="text-sm font-semibold text-gray-800">{order.id}</p>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div>
            <p className="text-xs text-gray-400">Placed on</p>
            <p className="text-sm font-medium text-gray-700">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <StatusBadge status={order.orderStatus as OrderStatus} />
      </div>

      {/* Items */}
      <div className="px-5 py-4 flex flex-col gap-3">
        {visibleItems.map((item) => {
          const price =
            typeof item.Product.productPrice === "number"
              ? item.Product.productPrice
              : Number(item.Product.productPrice);

          return (
            <div key={item.id} className="flex items-center gap-4">
              {/* Image */}
              <div className="w-14 h-14 shrink-0 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-2xl">
                <img
                  src={getImageUrl(item.Product.image)}
                  alt={item.Product.productName}
                  className="h-full w-full object-contain"
                />
              </div>

              {/* Name + qty */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.Product.productName}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Qty: {item.quantity} × {formatPrice(price)}
                </p>
              </div>

              {/* Line total */}
              <p className="text-sm font-semibold text-gray-800 shrink-0">
                {formatPrice(price * item.quantity)}
              </p>
            </div>
          );
        })}

        {hiddenCount > 0 && (
          <button
            onClick={() => setExpanded(true)}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium text-left"
          >
            + {hiddenCount} more item{hiddenCount > 1 ? "s" : ""}
          </button>
        )}
        {expanded && order.OrderDetails.length > 2 && (
          <button
            onClick={() => setExpanded(false)}
            className="text-xs text-gray-400 hover:text-gray-600 font-medium text-left"
          >
            Show less
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          {orderItemCount(order)} item{orderItemCount(order) > 1 ? "s" : ""} ·{" "}
          <span className="font-semibold text-gray-900">
            {formatPrice(orderTotal(order))}
          </span>
        </p>

        <div className="flex items-center gap-2">
          {order.orderStatus === "delivered" && (
            <button className="text-xs font-medium border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              Buy Again
            </button>
          )}
          {(order.orderStatus === "pending" ||
            order.orderStatus === "shipped") && (
            <button className="text-xs font-medium border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              Track Order
            </button>
          )}
          {order.orderStatus === "pending" && (
            <button className="text-xs font-medium border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
              Cancel
            </button>
          )}
          <button
            className="text-xs font-medium bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
            onClick={() => viewDetail(order.id)}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Orders Page ───────────────────────────────────────────────

export default function Orders() {
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState<OrderStatus | "all">("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const fetchOrders = async () => {
    try {
      const params: Record<string, string | number> = {
        page,
        limit: 5,
        status: activeStatus,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await authAPI.get("/order/getMyOrders", { params });
      setOrders(res.data?.data);
      setPagination(res.data?.pagination);
    } catch (err) {
      showErrorToast(err, "Failed to load orders.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, activeStatus, debouncedSearch]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: OrderStatus | "all") => {
    setActiveStatus(value);
    setPage(1);
  };

  const filteredOrders = orders;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track, review and manage your order history
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mb-5">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            width="17"
            height="17"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by order ID or product name..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleStatusChange(tab.value)}
              className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeStatus === tab.value
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {filteredOrders.length > 0 ? (
          <>
            <div className="flex flex-col gap-4">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
            {pagination && (
              <Pagination pagination={pagination} onPageChange={setPage} />
            )}
          </>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl py-20 flex flex-col items-center text-center">
            <div className="text-5xl mb-4">📦</div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              No orders found
            </h2>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              {search
                ? `No results for "${search}". Try a different search term.`
                : "You don't have any orders with this status yet."}
            </p>
            {(search || activeStatus !== "all") && (
              <button
                onClick={() => {
                  handleSearchChange("");
                  handleStatusChange("all");
                }}
                className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
