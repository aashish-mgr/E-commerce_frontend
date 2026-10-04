import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Clock,
  IndianRupee,
  Package,
  Plus,
  ShoppingBag,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { Panel } from "../ui/Panel";
import { Price } from "../ui/Price";
import { RevenueChart } from "../ui/RevenueChart";
import { SegmentedControl } from "../ui/SegmentedControl";
import { StatusBadge } from "../ui/StatusBadge";
import { toStatusTone } from "./types";
import type { VendorOrderDetail, VendorProduct } from "./types";
import { cn } from "../../lib/cn";
import { formatCount, formatDayMonth, formatRs, humanize } from "../../lib/format";

const LOW_STOCK_THRESHOLD = 5;

const periodOptions = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
];

function toDayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

interface Metric {
  label: string;
  value: string;
  icon: LucideIcon;
  alert?: boolean;
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
    const days: { key: string; label: string }[] = [];
    for (let i = periodDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);
      days.push({ key: toDayKey(date), label: formatDayMonth(date) });
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

  const metricsRow: Metric[] = [
    { label: "Revenue", value: formatRs(metrics.revenue), icon: IndianRupee },
    { label: "Orders", value: formatCount(metrics.orderCount), icon: ShoppingBag },
    {
      label: "Pending orders",
      value: formatCount(metrics.pending),
      icon: Clock,
      alert: metrics.pending > 0,
    },
    { label: "Avg. order value", value: formatRs(metrics.aov), icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <section aria-label="Business overview">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            Business overview
          </h2>
          <SegmentedControl
            ariaLabel="Reporting period"
            value={String(periodDays)}
            options={periodOptions}
            onChange={(value) => setPeriodDays(Number(value) === 30 ? 30 : 7)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metricsRow.map((metric) => {
            const Icon = metric.icon;
            return (
              <Panel key={metric.label} className="flex items-center gap-4 p-5">
                <span
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-control",
                    metric.alert ? "bg-marigold-soft text-amber" : "bg-pine-soft text-pine",
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
          })}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-base font-semibold text-ink">
              Pending orders
            </h2>
            <Button variant="ghost" size="sm" onClick={onViewAllOrders}>
              View all
            </Button>
          </div>

          {pendingLineItems.length === 0 ? (
            <EmptyState
              className="py-10"
              icon={Clock}
              title="All caught up"
              direction="You have no pending orders right now."
            />
          ) : (
            <ul className="divide-y divide-line">
              {pendingLineItems.map((od) => (
                <li key={od.id}>
                  <Link
                    to={`/vendor/order/${od.Order.id}`}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-paper-2/40"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-marigold-soft text-amber">
                      <Clock aria-hidden className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
                        {od.Product.productName}
                      </p>
                      <p className="text-xs text-muted">
                        Qty {formatCount(od.quantity)} ·{" "}
                        <Price
                          value={Number(od.Product.productPrice) * od.quantity}
                        />
                      </p>
                    </div>
                    <StatusBadge tone={toStatusTone(od.Order.orderStatus)}>
                      {humanize(od.Order.orderStatus)}
                    </StatusBadge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel>
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-base font-semibold text-ink">
              Low stock
            </h2>
            <Button variant="ghost" size="sm" onClick={onViewProducts}>
              Manage
            </Button>
          </div>

          {lowStockProducts.length === 0 ? (
            <EmptyState
              className="py-10"
              icon={Package}
              title={
                products.length === 0
                  ? "No products yet"
                  : "Stock levels are healthy"
              }
              direction={
                products.length === 0
                  ? "Add your first product to start selling."
                  : "Nothing is running low right now."
              }
              action={
                products.length === 0 ? (
                  <Button variant="outline" onClick={onAddProduct}>
                    <Plus aria-hidden className="size-4" />
                    Add your first product
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <ul className="divide-y divide-line">
              {lowStockProducts.map((product) => {
                const stock = Number(product.stock ?? 0);
                const out = stock <= 0;
                return (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={onViewProducts}
                      className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-paper-2/40"
                    >
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-control",
                          out
                            ? "bg-crimson-soft text-crimson"
                            : "bg-marigold-soft text-amber",
                        )}
                      >
                        <TriangleAlert aria-hidden className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">
                          {product.productName}
                        </p>
                        <p className="text-xs text-muted">
                          {out ? "Out of stock" : `${formatCount(stock)} units left`}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          out
                            ? "bg-crimson-soft text-crimson"
                            : "bg-marigold-soft text-amber",
                        )}
                      >
                        {out ? "Out" : `≤ ${LOW_STOCK_THRESHOLD}`}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      <Panel className="p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              Sales trend
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              Daily revenue · last {periodDays} days
            </p>
          </div>
          <div className="text-right">
            <Price
              value={metrics.revenue}
              className="block text-lg font-semibold text-ink"
            />
            <p className="text-sm text-muted">
              {formatCount(metrics.orderCount)}{" "}
              {metrics.orderCount === 1 ? "order" : "orders"}
            </p>
          </div>
        </div>

        <RevenueChart
          data={trend}
          caption="Daily revenue bar chart"
          emptyLabel="No sales in this period"
        />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-base font-semibold text-ink">
              Recent orders
            </h2>
            <Button variant="ghost" size="sm" onClick={onViewAllOrders}>
              View all orders
            </Button>
          </div>

          {recentOrders.length === 0 ? (
            <EmptyState
              className="py-10"
              icon={ShoppingBag}
              title="No orders yet"
              direction="Once customers order from you, they will show up here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-paper-2/60 text-ink-2">
                  <tr>
                    <th scope="col" className="px-5 py-2.5 font-medium">
                      Buyer
                    </th>
                    <th scope="col" className="px-5 py-2.5 font-medium">
                      Items
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
                  {recentOrders.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => navigate(`/vendor/order/${row.id}`)}
                      className="cursor-pointer transition-colors hover:bg-paper-2/40"
                    >
                      <td className="px-5 py-3">
                        <p className="truncate font-medium text-ink">
                          {row.order.User?.userName ?? row.order.phoneNumber}
                        </p>
                        <p className="text-xs text-muted">
                          {formatDayMonth(row.order.createdAt)}
                        </p>
                      </td>
                      <td className="max-w-[12rem] px-5 py-3">
                        <p className="truncate text-ink-2">
                          {row.items.map((item) => item.Product.productName).join(", ")}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge tone={toStatusTone(row.order.orderStatus)}>
                          {humanize(row.order.orderStatus)}
                        </StatusBadge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Price value={row.amount} className="font-semibold text-ink" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel className="flex flex-col gap-3 p-5">
          <h2 className="font-display text-base font-semibold text-ink">
            Quick actions
          </h2>
          <Button variant="primary" className="w-full" onClick={onAddProduct}>
            <Plus aria-hidden className="size-4" />
            Add product
          </Button>
          <Button variant="outline" className="w-full" onClick={onViewAllOrders}>
            <ShoppingBag aria-hidden className="size-4" />
            View all orders
          </Button>
          <Button variant="ghost" className="w-full" onClick={onViewProducts}>
            <Package aria-hidden className="size-4" />
            Manage products
            <ArrowUpRight aria-hidden className="size-4" />
          </Button>
        </Panel>
      </div>
    </div>
  );
}
