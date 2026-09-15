import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authAPI } from "../api";
import { paymentStyles, statusStyles } from "../Components/vendor/types";
import type { VendorOrderDetail } from "../Components/vendor/types";

export default function VendorOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<VendorOrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchDetail = useCallback(async () => {
    try {
      const response = await authAPI.get(`/order/getVendorOrderDetail/${orderId}`);
      setItems(response.data.data);
    } catch (error) {
      console.error("Error fetching order detail:", error);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) fetchDetail();
  }, [orderId, fetchDetail]);

  const order = items[0]?.Order;
  const payment = order?.Payment;

  const handleStatusChange = async (status: string) => {
    if (!orderId) return;
    setSaving(true);
    try {
      await authAPI.patch(`/order/updateOrderStatus/${orderId}`, { orderStatus: status });
      showToast("Order status updated");
      await fetchDetail();
    } catch (error) {
      console.error("Error updating order status:", error);
      showToast("Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentToggle = async () => {
    if (!orderId || !payment) return;
    setSaving(true);
    try {
      await authAPI.patch(`/order/updatePaymentStatus/${orderId}`, {
        paymentStatus: payment.paymentStatus === "paid" ? "unpaid" : "paid",
      });
      showToast("Payment status updated");
      await fetchDetail();
    } catch (error) {
      console.error("Error updating payment status:", error);
      showToast("Failed to update payment status");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!orderId) return;
    if (!window.confirm("Delete this order?")) return;
    try {
      await authAPI.delete(`/order/deleteOrder/${orderId}`);
      showToast("Order deleted");
      navigate("/vendor/dashboard", { replace: true });
    } catch (error) {
      console.error("Error deleting order:", error);
      showToast("Failed to delete order");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-lg font-semibold text-gray-700">Order not found</p>
          <button
            onClick={() => navigate("/vendor/dashboard")}
            className="mt-4 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const statuses = ["pending", "shipped", "delivered", "cancelled"];
  const orderDate = new Date(order.createdAt).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/vendor/dashboard")}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
              <p className="text-sm text-gray-500 mt-1">
                Order <span className="font-mono font-medium text-gray-700">{order.id}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${statusStyles[order.orderStatus] ?? "bg-gray-100 text-gray-600"}`}
              >
                {order.orderStatus}
              </span>
              <button
                onClick={() => navigate("/vendor/dashboard")}
                className="bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Customer / Shipping / Payment cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Customer */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h2 className="font-semibold text-gray-900 text-sm">Customer</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Name</p>
                <p className="text-gray-800 font-medium">{order.User?.userName ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
                <p className="text-gray-800 break-all">{order.User?.userEmail ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Phone</p>
                <p className="text-gray-800">{order.phoneNumber}</p>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h2 className="font-semibold text-gray-900 text-sm">Shipping</h2>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {order.shippingAddress}
            </p>
            <p className="text-xs text-gray-400 mt-3">Ordered on {orderDate}</p>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <h2 className="font-semibold text-gray-900 text-sm">Payment</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Method</p>
                <p className="text-gray-800 font-medium capitalize">
                  {payment?.paymentMethod ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Status</p>
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium mt-0.5 ${paymentStyles[payment?.paymentStatus ?? "unpaid"] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {payment?.paymentStatus ?? "unpaid"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Items + Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Items */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-sm">Order Items</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {items.map((od) => (
                <div key={od.id} className="flex items-center gap-4 px-5 py-4">
                  <img
                    src={od.Product.image}
                    alt={od.Product.productName}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {od.Product.productName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Qty: {od.quantity} × Rs. {Number(od.Product.productPrice).toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                    Rs. {(Number(od.Product.productPrice) * od.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary + Actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 text-sm mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Items Subtotal</span>
                  <span>Rs. {Number(order.totalAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-medium">Free</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between text-gray-900 font-bold">
                  <span>Total</span>
                  <span>Rs. {Number(order.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Status management */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 text-sm mb-4">Manage Order</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1.5">
                    Order Status
                  </label>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={saving}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-white disabled:opacity-50"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handlePaymentToggle}
                  disabled={saving}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
                    payment?.paymentStatus === "paid"
                      ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {payment?.paymentStatus === "paid" ? "Mark as Unpaid" : "Mark as Paid"}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-[slideUp_0.3s_ease]">
          <div className="bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}