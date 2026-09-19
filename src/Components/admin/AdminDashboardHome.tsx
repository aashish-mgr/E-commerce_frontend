import { Link } from "react-router-dom";
import { statusStyles } from "../vendor/types";
import type { AdminStats } from "./types";

const CHART_WIDTH = 720;
const CHART_HEIGHT = 200;
const CHART_PAD_BOTTOM = 28;
const CHART_PAD_TOP = 16;

const money = (value: number) => {
  const amount = Number.isFinite(value) ? value : 0;
  return `Rs. ${Math.round(amount).toLocaleString("en-US")}`;
};

const dayLabel = (date: string) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

interface Metric {
  label: string;
  value: string;
  icon: React.ReactNode;
  bgLight: string;
  textColor: string;
}

export default function AdminDashboardHome({
  stats,
  onViewUsers,
  onViewProducts,
  onViewOrders,
}: {
  stats: AdminStats;
  onViewUsers: () => void;
  onViewProducts: () => void;
  onViewOrders: () => void;
}) {
  const metricsRow: Metric[] = [
    {
      label: "Total Revenue",
      value: money(stats.totalRevenue),
      icon: <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />,
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      label: "Orders",
      value: String(stats.totalOrders),
      icon: (
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      ),
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Users",
      value: String(stats.totalUsers),
      icon: (
        <>
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </>
      ),
      bgLight: "bg-indigo-50",
      textColor: "text-indigo-600",
    },
    {
      label: "Products",
      value: String(stats.totalProducts),
      icon: <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />,
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
    },
  ];

  const breakdownRow: Metric[] = [
    {
      label: "Vendors",
      value: String(stats.totalVendors),
      icon: <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />,
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Customers",
      value: String(stats.totalCustomers),
      icon: (
        <>
          <circle cx="12" cy="7" r="4" />
          <path d="M5.5 21v-2a4 4 0 014-4h5a4 4 0 014 4v2" />
        </>
      ),
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      label: "Admins",
      value: String(stats.totalAdmins),
      icon: <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />,
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      label: "Low Stock",
      value: String(stats.lowStockProducts),
      icon: <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />,
      bgLight: "bg-red-50",
      textColor: "text-red-600",
    },
  ];

  const trend = stats.salesTrend;
  const bestTrendValue = Math.max(...trend.map((t) => t.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Primary metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </section>

      {/* Breakdown */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {breakdownRow.map((card) => (
          <button
            key={card.label}
            onClick={
              card.label === "Vendors" || card.label === "Customers"
                ? onViewUsers
                : card.label === "Low Stock"
                  ? onViewProducts
                  : undefined
            }
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 flex items-center justify-between gap-3 text-left"
          >
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                {card.label}
              </p>
              <p className="text-lg font-bold text-gray-900 truncate">
                {card.value}
              </p>
            </div>
            <div
              className={`w-10 h-10 rounded-xl ${card.bgLight} ${card.textColor} flex items-center justify-center flex-shrink-0`}
            >
              <svg
                width="18"
                height="18"
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
          </button>
        ))}
      </section>

      {/* Sales Trend */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-sm text-gray-900 font-semibold">Revenue Trend</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Daily revenue · last {trend.length} days
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{money(stats.totalRevenue)}</p>
            <p className="text-xs text-gray-500">{stats.totalOrders} total orders</p>
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
            const barHeight = Math.max(
              2,
              (day.revenue / bestTrendValue) * (CHART_HEIGHT - CHART_PAD_TOP - CHART_PAD_BOTTOM),
            );
            const x = index * slot + (slot - barWidth) / 2;
            const y = CHART_HEIGHT - CHART_PAD_BOTTOM - barHeight;
            const showLabel = trend.length <= 7 || index % 5 === 0 || index === trend.length - 1;
            return (
              <g key={day.date}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={4}
                  className="fill-gray-900"
                >
                  <title>{`${dayLabel(day.date)}: ${money(day.revenue)} (${day.orders} orders)`}</title>
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

      {/* Recent orders + recent users */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm text-gray-900 font-semibold">Recent Orders</h2>
            <button
              onClick={onViewOrders}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all
            </button>
          </div>
          {stats.recentOrders.length > 0 ? (
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    <th className="py-2.5 pr-4 font-medium">Buyer</th>
                    <th className="py-2.5 pr-4 font-medium">Status</th>
                    <th className="py-2.5 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <p className="text-sm font-medium text-gray-900">
                          {order.User?.userName ?? order.phoneNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {dayLabel(order.createdAt)} · {order.OrderDetails?.length ?? 0} item(s)
                        </p>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${statusStyles[order.orderStatus] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {money(order.totalAmount)}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-500">No orders yet.</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm text-gray-900 font-semibold">Newest Users</h2>
            <button
              onClick={onViewUsers}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all
            </button>
          </div>
          {stats.recentUsers.length > 0 ? (
            <ul className="space-y-3">
              {stats.recentUsers.map((user) => (
                <li key={user.id} className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {user.userName?.[0]?.toUpperCase() ?? "?"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.userName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.userEmail}</p>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full font-medium capitalize bg-gray-100 text-gray-600 border border-gray-200">
                    {user.userRole}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">No users yet.</p>
            </div>
          )}

          <div className="border-t border-gray-100 mt-4 pt-4 flex flex-col gap-2">
            <Link
              to="/admin?tab=users"
              className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 text-sm font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Manage Users
            </Link>
            <button
              onClick={onViewProducts}
              className="w-full bg-white text-gray-700 rounded-xl px-4 py-3 text-sm font-semibold border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              </svg>
              Manage Products
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}