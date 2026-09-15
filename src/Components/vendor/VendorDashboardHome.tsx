import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  statusStyles,
  type VendorOrderDetail,
  type VendorProduct,
} from "./types";

const LOW_STOCK_THRESHOLD = 5;
const CHART_WIDTH = 720;
const CHART_HEIGHT = 200;
const CHART_PAD_BOTTOM = 28;
const CHART_PAD_TOP = 16;

const money = (value: number) => {
  const amount = Number.isFinite(value) ? value : 0;
  return `Rs. ${Math.round(amount).toLocaleString("en-US")}`;
};

const toDayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

const dayLabel = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

interface Metric {
  label: string;
  value: string;
  icon: React.ReactNode;
  bgLight: string;
  textColor: string;
}

export default function VendorDashboardHome({
  products,
  orderDetails,
  onAddProduct,
  onViewAllOrders,
  onViewProducts,
}: {
  products: VendorProduct[];
  orderDetails: VendorOrderDetail[];
  onAddProduct: () => void;
  onViewAllOrders: () => void;
  onViewProducts: () => void;
}) {
  const [periodDays, setPeriodDays] = useState<7 | 30>(7);
  const navigate = useNavigate();

  const periodStartMs = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (periodDays - 1));
    return start.getTime();
  }, [periodDays]);

  const periodDetails = useMemo(
    () =>
      orderDetails.filter(
        (od) => new Date(od.Order.createdAt).getTime() >= periodStartMs,
      ),
    [orderDetails, periodStartMs],
  );

  const metrics = useMemo(() => {
    const orderMap = new Map<string, VendorOrderDetail[]>();
    for (const od of periodDetails) {
      const key = od.Order.id;
      const existing = orderMap.get(key);
      if (existing) existing.push(od);
      else orderMap.set(key, [od]);
    }
    const sets = Array.from(orderMap.values());
    const revenue = sets.reduce(
      (sum, items) =>
        sum +
        items.reduce(
          (s, od) => s + Number(od.Product.productPrice) * od.quantity,
          0,
        ),
      0,
    );
    const pending = sets.filter(
      (items) => items[0]?.Order.orderStatus === "pending",
    ).length;
    return {
      revenue,
      orderCount: sets.length,
      pending,
      aov: sets.length > 0 ? revenue / sets.length : 0,
    };
  }, [periodDetails]);

  const pendingLineItems = useMemo(
    () =>
      orderDetails
        .filter((od) => od.Order.orderStatus === "pending")
        .sort(
          (a, b) =>
            new Date(b.Order.createdAt).getTime() -
            new Date(a.Order.createdAt).getTime(),
        )
        .slice(0, 4),
    [orderDetails],
  );

  const lowStockProducts = useMemo(
    () =>
      products
        .filter((p) => Number(p.stock ?? 0) <= LOW_STOCK_THRESHOLD)
        .sort((a, b) => Number(a.stock) - Number(b.stock))
        .slice(0, 4),
    [products],
  );

  const trend = useMemo(() => {
    const today = new Date();
    const days: { key: string; date: Date; value: number }[] = [];
    for (let i = periodDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);
      days.push({ key: toDayKey(date), date, value: 0 });
    }
    const values = new Map(days.map((d) => [d.key, 0]));
    for (const od of periodDetails) {
      const key = toDayKey(new Date(od.Order.createdAt));
      const current = values.get(key) ?? 0;
      values.set(key, current + Number(od.Product.productPrice) * od.quantity);
    }
    return days.map((d) => ({ ...d, value: values.get(d.key) ?? 0 }));
  }, [periodDetails, periodDays]);

  const recentOrders = useMemo(() => {
    const orderMap = new Map<string, VendorOrderDetail[]>();
    for (const od of orderDetails) {
      const key = od.Order.id;
      const existing = orderMap.get(key);
      if (existing) existing.push(od);
      else orderMap.set(key, [od]);
    }
    return Array.from(orderMap.entries())
      .map(([id, items]) => ({
        id,
        order: items[0]!.Order,
        items,
        amount: items.reduce(
          (s, od) => s + Number(od.Product.productPrice) * od.quantity,
          0,
        ),
      }))
      .sort(
        (a, b) =>
          new Date(b.order.createdAt).getTime() -
          new Date(a.order.createdAt).getTime(),
      )
      .slice(0, 6);
  }, [orderDetails]);

  const bestTrendValue = useMemo(
    () => Math.max(...trend.map((t) => t.value), 1),
    [trend],
  );

  const metricsRow: Metric[] = [
    {
      label: "Revenue",
      value: money(metrics.revenue),
      icon: <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />,
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      label: "Orders",
      value: String(metrics.orderCount),
      icon: (
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      ),
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Pending Orders",
      value: String(metrics.pending),
      icon: (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </>
      ),
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      label: "Avg. Order Value",
      value: money(metrics.aov),
      icon: <path d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6" />,
      bgLight: "bg-indigo-50",
      textColor: "text-indigo-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-gray-900 font-semibold">
            Business Overview
          </h2>
          <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
            {([7, 30] as const).map((days) => (
              <button
                key={days}
                onClick={() => setPeriodDays(days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  periodDays === days
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {days} days
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricsRow.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl ${card.bgLight} ${card.textColor} flex items-center justify-center flex-shrink-0`}
                >
                  <svg
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    {card.icon}
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    {card.label}
                  </p>
                  <p className="text-xl font-bold text-gray-900 truncate">
                    {card.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Needs attention */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm text-gray-900 font-semibold">
              Pending Orders
            </h2>
            <button
              onClick={onViewAllOrders}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all
            </button>
          </div>
          {pendingLineItems.length > 0 ? (
            <ul className="space-y-3">
              {pendingLineItems.map((od) => (
                <li key={od.id}>
                  <Link
                    to={`/vendor/order/${od.Order.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                        {od.Product.productName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty {od.quantity} · {money(Number(od.Product.productPrice) * od.quantity)}
                      </p>
                    </div>
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${statusStyles.pending}`}>
                      pending
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">
                All caught up — no pending orders.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm text-gray-900 font-semibold">Low Stock</h2>
            <button
              onClick={onViewProducts}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Manage
            </button>
          </div>
          {lowStockProducts.length > 0 ? (
            <ul className="space-y-3">
              {lowStockProducts.map((product) => {
                const stock = Number(product.stock ?? 0);
                const out = stock <= 0;
                return (
                  <li key={product.id}>
                    <button
                      onClick={onViewProducts}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group text-left"
                    >
                      <span
                        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          out
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                          <line x1="7" y1="7" x2="7.01" y2="7" />
                        </svg>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                          {product.productName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {out ? "Out of stock" : `${stock} units left`}
                        </p>
                      </div>
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-full font-medium border ${
                          out
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {out ? "out" : `≤ ${LOW_STOCK_THRESHOLD}`}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : products.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">
                You haven&apos;t added any products yet.
              </p>
              <button
                onClick={onAddProduct}
                className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Add your first product
              </button>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">Stock levels are healthy.</p>
            </div>
          )}
        </div>
      </section>

      {/* Sales trend */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-sm text-gray-900 font-semibold">Sales Trend</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Daily revenue · last {periodDays} days
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{money(metrics.revenue)}</p>
            <p className="text-xs text-gray-500">{metrics.orderCount} orders</p>
          </div>
        </div>
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="w-full h-auto"
          role="img"
          aria-label="Daily revenue bar chart"
        >
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1="0"
              x2={CHART_WIDTH}
              y1={CHART_PAD_TOP + CHART_HEIGHT * f * 0.5}
              y2={CHART_PAD_TOP + CHART_HEIGHT * f * 0.5}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}
          {trend.map((day, index) => {
            const slot = CHART_WIDTH / trend.length;
            const barWidth = Math.min(28, slot * 0.5);
            const barHeight = Math.max(2, (day.value / bestTrendValue) * (CHART_HEIGHT - CHART_PAD_TOP - CHART_PAD_BOTTOM));
            const x = index * slot + (slot - barWidth) / 2;
            const y = CHART_HEIGHT - CHART_PAD_BOTTOM - barHeight;
            const showLabel = trend.length <= 7 || index % 5 === 0 || index === trend.length - 1;
            return (
              <g key={day.key}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={4}
                  className="fill-gray-900"
                >
                  <title>{`${dayLabel(day.date)}: ${money(day.value)}`}</title>
                </rect>
                {showLabel && (
                  <text
                    x={x + barWidth / 2}
                    y={CHART_HEIGHT - CHART_PAD_BOTTOM + 16}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#9ca3af"
                  >
                    {dayLabel(day.date)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </section>

      {/* Recent orders + quick actions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm text-gray-900 font-semibold">Recent Orders</h2>
            <button
              onClick={onViewAllOrders}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all orders
            </button>
          </div>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    <th className="py-2.5 pr-4 font-medium">Buyer</th>
                    <th className="py-2.5 pr-4 font-medium">Items</th>
                    <th className="py-2.5 pr-4 font-medium">Status</th>
                    <th className="py-2.5 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => navigate(`/vendor/order/${row.id}`)}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 pr-4">
                        <p className="text-sm font-medium text-gray-900">
                          {row.order.User?.userName ?? row.order.phoneNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {dayLabel(new Date(row.order.createdAt))}
                        </p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="text-sm text-gray-600 truncate max-w-[200px]">
                          {row.items.map((i) => i.Product.productName).join(", ")}
                        </p>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${statusStyles[row.order.orderStatus] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}
                        >
                          {row.order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {money(row.amount)}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-500">
                No orders yet — once customers order from you, they&apos;ll show up here.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
          <h2 className="text-sm text-gray-900 font-semibold mb-1">Quick Actions</h2>
          <button
            onClick={onAddProduct}
            className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 text-sm font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Product
          </button>
          <button
            onClick={onViewAllOrders}
            className="w-full bg-white text-gray-700 rounded-xl px-4 py-3 text-sm font-semibold border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View All Orders
          </button>
        </div>
      </section>
    </div>
  );
}