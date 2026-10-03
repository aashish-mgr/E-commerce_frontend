import { useState } from "react";
import { ChevronDown, PackageSearch, Truck } from "lucide-react";
import type { PaginationMeta } from "../../types";
import Pagination from "../Pagination";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { ChipGroup, ResultMeta, SearchField } from "../ui/FilterBar";
import { PageHeader } from "../ui/PageHeader";
import { Panel } from "../ui/Panel";
import { Price } from "../ui/Price";
import { SegmentedControl } from "../ui/SegmentedControl";
import { StatusBadge } from "../ui/StatusBadge";
import { toPaymentTone, toStatusTone } from "../vendor/types";
import { cn } from "../../lib/cn";
import { formatDate, humanize } from "../../lib/format";
import type { AdminOrder } from "./types";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const paymentOptions = [
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
];

const statusFilters = [
  { value: "all", label: "All" },
  ...statusOptions,
];

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
  const filtered = Boolean(search) || statusFilter !== "all";

  return (
    <div className="space-y-5">
      <PageHeader
        titleAs="h2"
        title="All orders"
        description="Track, update and manage every order placed on the platform."
      />

      <Panel className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
          <SearchField
            value={search}
            onChange={onSearchChange}
            ariaLabel="Search orders"
            placeholder="Search by order, user or phone"
          />
          <ChipGroup
            className="pb-0"
            ariaLabel="Filter orders by status"
            options={statusFilters}
            value={statusFilter}
            onChange={onStatusFilterChange}
          />
        </div>
        <ResultMeta
          className="mt-4 border-t border-line pt-3"
          shown={orders.length}
          total={total}
          noun="orders"
          onClear={
            filtered
              ? () => {
                  onSearchChange("");
                  onStatusFilterChange("all");
                }
              : undefined
          }
        />
      </Panel>

      <Panel>
        {orders.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title={total === 0 ? "No orders yet" : "No orders match your search"}
            direction={
              total === 0
                ? "Orders placed by customers will appear here."
                : "Try adjusting your search or status filter."
            }
            action={
              filtered ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    onSearchChange("");
                    onStatusFilterChange("all");
                  }}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="divide-y divide-line">
              {orders.map((order) => {
                const isOpen = expanded === order.id;
                const paymentStatus = order.Payment?.paymentStatus ?? "";
                const items = order.OrderDetails ?? [];

                return (
                  <article key={order.id}>
                    <h3>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`order-panel-${order.id}`}
                        onClick={() => setExpanded(isOpen ? null : order.id)}
                        className="flex w-full flex-wrap items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-paper-2/40 lg:flex-row lg:gap-6 lg:px-5"
                      >
                        <div className="min-w-[9rem]">
                          <p className="text-xs text-muted">
                            #{order.id.slice(0, 8)}
                          </p>
                          <p className="mt-0.5 font-medium text-ink">
                            {order.User?.userName ?? "Guest"}
                          </p>
                          <p className="text-xs text-muted">{order.phoneNumber}</p>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <StatusBadge tone={toStatusTone(order.orderStatus)}>
                              {humanize(order.orderStatus)}
                            </StatusBadge>
                            <StatusBadge tone={toPaymentTone(paymentStatus)}>
                              {paymentStatus ? humanize(paymentStatus) : "No payment"}
                            </StatusBadge>
                          </div>
                          <p className="truncate text-xs text-muted">
                            {items
                              .map((item) => item.Product?.productName)
                              .filter(Boolean)
                              .join(", ") || "No items"}
                          </p>
                        </div>

                        <div className="lg:text-right">
                          <Price
                            value={order.totalAmount}
                            className="block font-semibold text-ink"
                          />
                          <p className="text-xs text-muted">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>

                        <ChevronDown
                          aria-hidden
                          className={cn(
                            "ml-auto size-4 shrink-0 text-muted transition-transform",
                            isOpen && "rotate-180",
                          )}
                        />
                      </button>
                    </h3>

                    {isOpen && (
                      <div
                        id={`order-panel-${order.id}`}
                        className="grid gap-4 border-t border-line bg-paper-2/40 px-4 py-5 lg:grid-cols-3 lg:px-5"
                      >
                        <div className="lg:col-span-2">
                          <h4 className="mb-3 text-sm font-medium text-ink">
                            Items
                          </h4>
                          <ul className="divide-y divide-line rounded-panel border border-line bg-surface">
                            {items.map((item) => (
                              <li
                                key={item.id}
                                className="flex items-center gap-3 px-4 py-3"
                              >
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-paper-2 text-xs font-semibold text-ink-2">
                                  ×{item.quantity}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-ink">
                                    {item.Product?.productName}
                                  </p>
                                  <p className="text-xs text-muted">
                                    <Price value={item.Product?.productPrice ?? 0} /> each
                                  </p>
                                </div>
                                <Price
                                  value={
                                    Number(item.Product?.productPrice ?? 0) * item.quantity
                                  }
                                  className="text-sm font-semibold text-ink"
                                />
                              </li>
                            ))}
                          </ul>
                          <p className="mt-3 flex items-start gap-2 text-sm text-muted">
                            <Truck aria-hidden className="mt-0.5 size-4 shrink-0" />
                            <span>{order.shippingAddress}</span>
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="mb-2 text-sm font-medium text-ink">
                              Order status
                            </h4>
                            <SegmentedControl
                              ariaLabel="Order status"
                              value={order.orderStatus}
                              options={statusOptions}
                              onChange={(status) => onUpdateStatus(order.id, status)}
                            />
                          </div>
                          <div>
                            <h4 className="mb-2 text-sm font-medium text-ink">
                              Payment
                            </h4>
                            <SegmentedControl
                              ariaLabel="Payment status"
                              value={paymentStatus}
                              options={paymentOptions}
                              onChange={(status) => onUpdatePayment(order.id, status)}
                            />
                            <p className="mt-2 text-sm text-muted">
                              Method:{" "}
                              <span className="text-ink-2">
                                {order.Payment?.paymentMethod
                                  ? humanize(order.Payment.paymentMethod)
                                  : "—"}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
            {pagination && <Pagination pagination={pagination} onPageChange={onPageChange} />}
          </>
        )}
      </Panel>
    </div>
  );
}
