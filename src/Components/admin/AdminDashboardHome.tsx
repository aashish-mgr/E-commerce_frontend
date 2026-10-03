import {
  IndianRupee,
  Package,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  TriangleAlert,
  Truck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { Panel } from "../ui/Panel";
import { Price } from "../ui/Price";
import { RevenueChart } from "../ui/RevenueChart";
import { StatusBadge } from "../ui/StatusBadge";
import { toStatusTone } from "../vendor/types";
import { cn } from "../../lib/cn";
import { formatCount, formatDayMonth, formatRs, humanize } from "../../lib/format";
import type { AdminStats } from "./types";

interface Metric {
  label: string;
  value: string;
  icon: LucideIcon;
  alert?: boolean;
}

function MetricTile({ metric }: { metric: Metric }) {
  const Icon = metric.icon;
  return (
    <Panel className="flex items-center gap-4 p-5">
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-control",
          metric.alert ? "bg-crimson-soft text-crimson" : "bg-pine-soft text-pine",
        )}
      >
        <Icon aria-hidden className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted">{metric.label}</p>
        <p className="font-display text-xl font-semibold tabular-nums text-ink">
          {metric.value}
        </p>
      </div>
    </Panel>
  );
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
  const metrics: Metric[] = [
    {
      label: "Total revenue",
      value: formatRs(stats.totalRevenue),
      icon: IndianRupee,
    },
    { label: "Orders", value: formatCount(stats.totalOrders), icon: ShoppingBag },
    { label: "Users", value: formatCount(stats.totalUsers), icon: Users },
    {
      label: "Products",
      value: formatCount(stats.totalProducts),
      icon: Package,
    },
  ];

  const breakdown: (Metric & { onClick?: () => void })[] = [
    {
      label: "Vendors",
      value: formatCount(stats.totalVendors),
      icon: Store,
      onClick: onViewUsers,
    },
    {
      label: "Customers",
      value: formatCount(stats.totalCustomers),
      icon: Users,
      onClick: onViewUsers,
    },
    {
      label: "Admins",
      value: formatCount(stats.totalAdmins),
      icon: ShieldCheck,
    },
    {
      label: "Low stock",
      value: formatCount(stats.lowStockProducts),
      icon: TriangleAlert,
      alert: true,
      onClick: onViewProducts,
    },
  ];

  const trend = stats.salesTrend;

  return (
    <div className="space-y-6">
      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricTile key={metric.label} metric={metric} />
        ))}
      </section>

      <section aria-label="Platform breakdown" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {breakdown.map((card) => {
          const Icon = card.icon;
          const body = (
            <>
              <div className="min-w-0">
                <p className="text-sm text-muted">{card.label}</p>
                <p className="font-display text-lg font-semibold tabular-nums text-ink">
                  {card.value}
                </p>
              </div>
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-control",
                  card.alert ? "bg-crimson-soft text-crimson" : "bg-paper-2 text-ink-2",
                )}
              >
                <Icon aria-hidden className="size-5" />
              </span>
            </>
          );

          if (!card.onClick) {
            return (
              <Panel key={card.label} className="flex items-center justify-between gap-3 p-4">
                {body}
              </Panel>
            );
          }

          return (
            <button
              key={card.label}
              type="button"
              onClick={card.onClick}
              className="flex items-center justify-between gap-3 rounded-panel border border-line bg-surface p-4 text-left transition-colors hover:border-pine/40 hover:bg-pine-soft/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
            >
              {body}
            </button>
          );
        })}
      </section>

      <Panel className="p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              Revenue trend
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              Daily revenue · last {trend.length} days
            </p>
          </div>
          <div className="text-right">
            <Price
              value={stats.totalRevenue}
              className="block text-lg font-semibold text-ink"
            />
            <p className="text-sm text-muted">
              {formatCount(stats.totalOrders)} total orders
            </p>
          </div>
        </div>

        <RevenueChart
          data={trend.map((day) => ({
            key: day.date,
            label: formatDayMonth(day.date),
            value: day.revenue,
            hint: `${formatCount(day.orders)} ${day.orders === 1 ? "order" : "orders"}`,
          }))}
          caption="Daily revenue bar chart"
          emptyLabel="No revenue recorded yet"
        />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-base font-semibold text-ink">
              Recent orders
            </h2>
            <Button variant="ghost" size="sm" onClick={onViewOrders}>
              View all
            </Button>
          </div>

          {stats.recentOrders.length === 0 ? (
            <EmptyState
              className="py-10"
              icon={ShoppingBag}
              title="No orders yet"
              direction="Orders placed by customers will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-paper-2/60 text-sm text-ink-2">
                  <tr>
                    <th scope="col" className="px-5 py-2.5 font-medium">
                      Buyer
                    </th>
                    <th scope="col" className="px-5 py-2.5 font-medium">
                      Status
                    </th>
                    <th scope="col" className="px-5 py-2.5 text-right font-medium">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-paper-2/40">
                      <td className="px-5 py-3">
                        <p className="truncate font-medium text-ink">
                          {order.User?.userName ?? order.phoneNumber}
                        </p>
                        <p className="text-xs text-muted">
                          {formatDayMonth(order.createdAt)} ·{" "}
                          {formatCount(order.OrderDetails?.length ?? 0)}{" "}
                          {order.OrderDetails?.length === 1 ? "item" : "items"}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge tone={toStatusTone(order.orderStatus)}>
                          {humanize(order.orderStatus)}
                        </StatusBadge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Price
                          value={order.totalAmount}
                          className="font-semibold text-ink"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel className="flex flex-col">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-base font-semibold text-ink">
              Newest users
            </h2>
            <Button variant="ghost" size="sm" onClick={onViewUsers}>
              View all
            </Button>
          </div>

          {stats.recentUsers.length === 0 ? (
            <EmptyState
              className="py-8"
              icon={Users}
              title="No users yet"
              direction="Registered users will appear here."
            />
          ) : (
            <ul className="divide-y divide-line">
              {stats.recentUsers.map((user) => (
                <li key={user.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-pine-soft text-sm font-semibold text-pine">
                    {user.userName?.[0]?.toUpperCase() ?? "?"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {user.userName}
                    </p>
                    <p className="truncate text-xs text-muted">{user.userEmail}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-paper-2 px-2.5 py-1 text-xs font-medium text-ink-2">
                    {humanize(user.userRole)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-auto space-y-2 border-t border-line px-5 py-4">
            <Button variant="outline" className="w-full" onClick={onViewUsers}>
              <Users aria-hidden className="size-4" />
              Manage users
            </Button>
            <Button variant="ghost" className="w-full" onClick={onViewProducts}>
              <Package aria-hidden className="size-4" />
              Manage products
            </Button>
          </div>
        </Panel>
      </div>

      <Panel className="flex flex-wrap items-center gap-4 p-5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-pine-soft text-pine">
            <Truck aria-hidden className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">Fulfilment snapshot</p>
            <p className="text-sm text-muted">
              {formatCount(stats.pendingOrders)} pending ·{" "}
              {formatCount(stats.deliveredOrders)} delivered ·{" "}
              {formatCount(stats.cancelledOrders)} cancelled
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={onViewOrders}>
          <Tag aria-hidden className="size-4" />
          Open orders
        </Button>
      </Panel>
    </div>
  );
}
