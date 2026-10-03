import { useState, useEffect } from "react";
import { PackageSearch, Search, X } from "lucide-react";
import { authAPI, getImageUrl } from "../api";
import { useNavigate } from "react-router-dom";
import { showErrorToast } from "../lib/toast";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import Pagination from "../Components/Pagination";
import type { Order, OrderStatus, PaginationMeta } from "../types";
import { cn } from "../lib/cn";
import { formatDate } from "../lib/format";
import { Container } from "../Components/ui/Container";
import { Button } from "../Components/ui/Button";
import { EmptyState } from "../Components/ui/EmptyState";
import { PageHeader } from "../Components/ui/PageHeader";
import { Price } from "../Components/ui/Price";
import { StatusBadge } from "../Components/ui/StatusBadge";

// ── Types ─────────────────────────────────────────────────────

const STATUS_TABS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// ── Helpers ───────────────────────────────────────────────────

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

// ── Order Card ────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded
    ? order.OrderDetails
    : order.OrderDetails.slice(0, 2);
  const hiddenCount = order.OrderDetails.length - visibleItems.length;
  const navigate = useNavigate();
  const viewDetail = (id: string) => {
    if (!id) return;
    navigate(`/orderDetail/${id}`);
  };

  const status = order.orderStatus as OrderStatus;

  return (
    <article className="overflow-hidden rounded-panel border border-line bg-surface">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper-2/60 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-muted">Order</p>
            <p className="font-display text-sm font-semibold text-ink">{order.id}</p>
          </div>
          <span aria-hidden className="h-8 w-px bg-line" />
          <div>
            <p className="text-xs text-muted">Placed</p>
            <p className="text-sm text-ink-2">{formatDate(order.createdAt)}</p>
          </div>
        </div>
        <StatusBadge tone={status}>{STATUS_LABELS[status]}</StatusBadge>
      </header>

      <div className="flex flex-col gap-3 px-4 py-4 sm:px-5">
        {visibleItems.map((item) => {
          const price =
            typeof item.Product.productPrice === "number"
              ? item.Product.productPrice
              : Number(item.Product.productPrice);

          return (
            <div key={item.id} className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-tile bg-paper-2">
                <img
                  src={getImageUrl(item.Product.image)}
                  alt={item.Product.productName}
                  loading="lazy"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {item.Product.productName}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {item.quantity} × <Price value={price} />
                </p>
              </div>

              <Price
                value={price * item.quantity}
                className="shrink-0 text-sm font-semibold text-ink"
              />
            </div>
          );
        })}

        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="self-start rounded-control text-xs font-medium text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
          >
            Show {hiddenCount} more {hiddenCount > 1 ? "items" : "item"}
          </button>
        )}
        {expanded && order.OrderDetails.length > 2 && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="self-start rounded-control text-xs font-medium text-muted underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
          >
            Show less
          </button>
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 sm:px-5">
        <p className="text-sm text-muted">
          {orderItemCount(order)} {orderItemCount(order) > 1 ? "items" : "item"} ·{" "}
          <Price value={orderTotal(order)} className="font-semibold text-ink" />
        </p>

        <div className="flex items-center gap-2">
          {order.orderStatus === "delivered" && (
            <Button variant="ghost" size="sm" disabled title="Not wired up yet">
              Buy again
            </Button>
          )}
          {(order.orderStatus === "pending" || order.orderStatus === "shipped") && (
            <Button variant="ghost" size="sm" disabled title="Not wired up yet">
              Track order
            </Button>
          )}
          {order.orderStatus === "pending" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-crimson hover:bg-crimson-soft"
              disabled
              title="Not wired up yet"
            >
              Cancel
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => viewDetail(order.id)}>
            View details
          </Button>
        </div>
      </footer>
    </article>
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
    <div className="min-h-screen bg-paper">
      <Container className="max-w-4xl">
        <PageHeader
          className="mt-8"
          title="My orders"
          description="Track, review and manage your order history."
        />

        <div className="relative py-6">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 mt-1 size-4 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            aria-label="Search orders"
            placeholder="Search by order ID or product name"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-11 w-full rounded-control border border-line bg-surface pl-9 pr-9 text-sm text-ink placeholder:text-muted focus-visible:border-pine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/25"
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 mt-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-control text-muted transition-colors hover:bg-paper-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
            >
              <X aria-hidden className="size-4" />
            </button>
          )}
        </div>

        <div
          role="tablist"
          aria-label="Filter orders by status"
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={activeStatus === tab.value}
              onClick={() => handleStatusChange(tab.value)}
              className={cn(
                "h-11 shrink-0 rounded-control px-4 text-sm font-medium transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine",
                activeStatus === tab.value
                  ? "bg-pine text-paper"
                  : "border border-line bg-surface text-ink-2 hover:border-pine hover:text-pine",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="pb-16">
          {filteredOrders.length > 0 ? (
            <>
              <div className="flex flex-col gap-4 py-6">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
              {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
            </>
          ) : (
            <EmptyState
              className="py-10"
              icon={PackageSearch}
              title="No orders found"
              direction={
                search
                  ? `No results for "${search}". Try a different search term.`
                  : "You have no orders with this status yet."
              }
              action={
                search || activeStatus !== "all" ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleSearchChange("");
                      handleStatusChange("all");
                    }}
                  >
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          )}
        </div>
      </Container>
    </div>
  );
}