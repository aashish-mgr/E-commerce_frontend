import { useState } from "react";
import type { AdminOrder } from "./types";
import { statusStyles, paymentStyles } from "../vendor/types";
import type { PaginationMeta } from "../../types";
import Pagination from "../Pagination";

const ORDER_OPTIONS = ["pending", "shipped", "delivered", "cancelled"];
const PAYMENT_OPTIONS = ["paid", "unpaid"];

export default function AdminOrders({
  orders,
  pagination,
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onPageChange,
  onUpdateStatus,
  onUpdatePayment,
}: {
  orders: AdminOrder[];
  pagination: PaginationMeta | null;
  search: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onUpdateStatus: (orderId: string, status: string) => void;
  onUpdatePayment: (orderId: string, status: string) => void;
}) {
  const total = pagination?.total ?? orders.length;
  const [expanded, setExpanded] = useState<string | null>(null);

  const statusFilterOptions = ["all", ...ORDER_OPTIONS];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">All Orders</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Track, update and manage every order on the platform
        </p>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by order, user or phone..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
            {search && (
              <button onClick={() => onSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {statusFilterOptions.map((s) => (
              <button
                key={s}
                onClick={() => onStatusFilterChange(s)}
                className={`text-xs px-3.5 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap capitalize flex-shrink-0 ${
                  statusFilter === s
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing <span className="font-semibold text-gray-700">{orders.length}</span> of{" "}
            <span className="font-semibold text-gray-700">{total}</span> orders
          </span>
          {(search || statusFilter !== "all") && (
            <button
              onClick={() => {
                onSearchChange("");
                onStatusFilterChange("all");
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {orders.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-400">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-700">
              {total === 0 ? "No orders yet" : "No orders match your search"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {total === 0 ? "Orders placed by customers will appear here" : "Try adjusting your search or filter"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map((order) => {
              const isOpen = expanded === order.id;
              return (
                <div key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <button
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    className="w-full px-5 py-4 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6 text-left"
                  >
                    <div className="min-w-[140px]">
                      <p className="text-xs text-gray-400 font-medium">#{order.id.slice(0, 8)}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">
                        {order.User?.userName ?? "Guest"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.phoneNumber}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium capitalize ${statusStyles[order.orderStatus] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                          {order.orderStatus}
                        </span>
                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium capitalize ${paymentStyles[order.Payment?.paymentStatus ?? ""] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                          {order.Payment?.paymentStatus ?? "-"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate max-w-md">
                        {order.OrderDetails?.map((d) => d.Product?.productName).filter(Boolean).join(", ") || "No items"}
                      </p>
                    </div>
                    <div className="text-left lg:text-right">
                      <p className="text-sm font-bold text-gray-900">
                        Rs. {Number(order.totalAmount).toLocaleString("en-US")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <svg
                      className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                      width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
                      <div className="lg:col-span-2 bg-gray-50 rounded-xl p-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                          Items
                        </h4>
                        <ul className="space-y-3">
                          {order.OrderDetails?.map((detail) => (
                            <li key={detail.id} className="flex items-center gap-3">
                              <span className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
                                x{detail.quantity}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {detail.Product?.productName}
                                </p>
                                <p className="text-xs text-gray-500">Rs. {Number(detail.Product?.productPrice ?? 0).toFixed(2)} each</p>
                              </div>
                              <p className="text-sm font-semibold text-gray-900">
                                Rs. {Number(detail.Product?.productPrice ?? 0) * detail.quantity}
                              </p>
                            </li>
                          ))}
                        </ul>
                        <div className="border-t border-gray-200 mt-3 pt-3 flex items-center justify-between">
                          <span className="text-sm text-gray-600">Shipping</span>
                          <p className="text-sm text-gray-500">{order.shippingAddress}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Order status
                          </h4>
                          <div className="inline-flex rounded-lg overflow-hidden border border-gray-200 bg-white">
                            {ORDER_OPTIONS.map((s) => (
                              <button
                                key={s}
                                onClick={() => onUpdateStatus(order.id, s)}
                                className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                                  order.orderStatus === s
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Payment
                          </h4>
                          <div className="inline-flex rounded-lg overflow-hidden border border-gray-200 bg-white flex-wrap">
                            {PAYMENT_OPTIONS.map((s) => (
                              <button
                                key={s}
                                onClick={() => onUpdatePayment(order.id, s)}
                                className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                                  order.Payment?.paymentStatus === s
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Payment method:{" "}
                          <span className="font-medium text-gray-700 capitalize">
                            {order.Payment?.paymentMethod ?? "-"}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {pagination && <Pagination pagination={pagination} onPageChange={onPageChange} />}
          </div>
        )}
      </div>
    </div>
  );
}