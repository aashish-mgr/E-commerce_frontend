import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { paymentStyles, statusStyles } from "./types";
import type { VendorOrderDetail } from "./types";

function ProductThumb({ image, name }: { image: string; name: string }) {
  const [error, setError] = useState(false);

  if (!image || error) {
    return (
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-300">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={name}
      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
      onError={() => setError(true)}
    />
  );
}

export default function VendorOrders({
  orderDetails,
  onUpdateStatus,
  onUpdatePayment,
  onDelete,
}: {
  orderDetails: VendorOrderDetail[];
  onUpdateStatus: (orderId: string, status: string) => void;
  onUpdatePayment: (orderId: string, status: string) => void;
  onDelete: (orderId: string) => void;
}) {
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const navigate = useNavigate();

  const statuses = ["pending", "shipped", "delivered", "cancelled"];
  const statusFilters = ["all", "pending", "shipped", "delivered", "cancelled"];

  const filteredOrders = useMemo(() => {
    return orderDetails.filter((od) => {
      const q = orderSearch.toLowerCase();
      const matchesSearch =
        !q ||
        od.Product.productName.toLowerCase().includes(q) ||
        od.Order.phoneNumber?.toLowerCase().includes(q) ||
        od.Order.shippingAddress?.toLowerCase().includes(q);
      const matchesStatus =
        orderStatusFilter === "all" || od.Order.orderStatus === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orderSearch, orderStatusFilter, orderDetails]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Store Orders</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Track and manage orders for your products
        </p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
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
              placeholder="Search by product, phone, or address..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
            {orderSearch && (
              <button
                onClick={() => setOrderSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setOrderStatusFilter(s)}
                className={`text-xs px-3.5 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap capitalize flex-shrink-0 ${
                  orderStatusFilter === s
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Showing <span className="font-semibold text-gray-700">{filteredOrders.length}</span> of{" "}
          <span className="font-semibold text-gray-700">{orderDetails.length}</span> orders
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-400">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-700">
              {orderDetails.length === 0 ? "No orders yet" : "No orders match your search"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {orderDetails.length === 0
                ? "Orders for your products will appear here"
                : "Try adjusting your search or filter"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Qty</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((od) => {
                  const order = od.Order;
                  const payment = order.Payment;
                  return (
                    <tr key={od.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => navigate(`/vendor/order/${order.id}`)}
                          className="flex items-center gap-3 text-left group"
                          title="View order details"
                        >
                          <ProductThumb image={od.Product.image} name={od.Product.productName} />
                          <span className="font-medium text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
                            {od.Product.productName}
                          </span>
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 font-medium">{od.quantity}</td>
                      <td className="px-5 py-3.5">
                        <p className="text-gray-900 text-sm">{order.phoneNumber}</p>
                        <p className="text-xs text-gray-500 max-w-[180px] line-clamp-1 mt-0.5">
                          {order.shippingAddress}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-gray-900 font-semibold">
                        Rs. {Number(order.totalAmount).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[order.orderStatus] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${paymentStyles[payment?.paymentStatus ?? "unpaid"] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {payment?.paymentStatus ?? "unpaid"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1.5 items-center">
                          <button
                            onClick={() => navigate(`/vendor/order/${order.id}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="View order details"
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            View
                          </button>
                          <select
                            value={order.orderStatus}
                            onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                            className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 bg-white"
                          >
                            {statuses.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() =>
                              onUpdatePayment(
                                order.id,
                                payment?.paymentStatus === "paid" ? "unpaid" : "paid",
                              )
                            }
                            className={`px-2.5 py-1.5 rounded-lg transition-colors text-xs font-medium ${
                              payment?.paymentStatus === "paid"
                                ? "text-amber-600 hover:bg-amber-50"
                                : "text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            {payment?.paymentStatus === "paid" ? "Unpay" : "Pay"}
                          </button>
                          <button
                            onClick={() => onDelete(order.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}