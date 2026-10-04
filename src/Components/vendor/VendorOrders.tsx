import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, ImageOff, PackageSearch, Trash2 } from "lucide-react";
import { getImageUrl } from "../../api";
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
import { toPaymentTone, toStatusTone } from "./types";
import { humanize } from "../../lib/format";
import type { VendorOrderDetail } from "./types";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const statusFilters = [
  { value: "all", label: "All" },
  ...statusOptions,
];

function ProductThumb({ image, name }: { image: string; name: string }) {
  const [error, setError] = useState(false);
  const src = getImageUrl(image);

  if (!src || error) {
    return (
      <span className="flex size-11 shrink-0 items-center justify-center rounded-tile bg-paper-2 text-muted">
        <ImageOff aria-hidden className="size-4" />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setError(true)}
      className="size-11 shrink-0 rounded-tile object-cover"
    />
  );
}

export default function VendorOrders({
  orderDetails,
  pagination,
  orderSearch,
  orderStatusFilter,
  onSearchChange,
  onStatusChange,
  onPageChange,
  onUpdateStatus,
  onUpdatePayment,
  onDelete,
}: {
  orderDetails: VendorOrderDetail[];
  pagination: PaginationMeta | null;
  orderSearch: string;
  orderStatusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onUpdateStatus: (orderId: string, status: string) => void;
  onUpdatePayment: (orderId: string, status: string) => void;
  onDelete: (orderId: string) => void;
}) {
  const navigate = useNavigate();
  const total = pagination?.total ?? orderDetails.length;
  const filtered = Boolean(orderSearch) || orderStatusFilter !== "all";

  const clearFilters = () => {
    onSearchChange("");
    onStatusChange("all");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        titleAs="h2"
        title="Store orders"
        description="Track and manage orders placed for your products."
      />

      <Panel className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
          <SearchField
            value={orderSearch}
            onChange={onSearchChange}
            ariaLabel="Search store orders"
            placeholder="Search by product, phone or address"
          />
          <ChipGroup
            className="pb-0"
            ariaLabel="Filter orders by status"
            options={statusFilters}
            value={orderStatusFilter}
            onChange={onStatusChange}
          />
        </div>
        <ResultMeta
          className="mt-4 border-t border-line pt-3"
          shown={orderDetails.length}
          total={total}
          noun="orders"
          onClear={filtered ? clearFilters : undefined}
        />
      </Panel>

      <Panel>
        {orderDetails.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title={total === 0 ? "No orders yet" : "No orders match your search"}
            direction={
              total === 0
                ? "Orders for your products will appear here."
                : "Try adjusting your search or status filter."
            }
            action={
              filtered ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-paper-2/60 text-ink-2">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Product
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Qty
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Customer
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Order total
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Status
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Payment
                    </th>
                    <th scope="col" className="px-5 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {orderDetails.map((od) => {
                    const order = od.Order;
                    const paymentStatus = order.Payment?.paymentStatus ?? "";
                    const detailUrl = `/vendor/order/${order.id}`;

                    return (
                      <tr
                        key={od.id}
                        className="transition-colors hover:bg-paper-2/40"
                      >
                        <td className="px-5 py-3">
                          <button
                            type="button"
                            onClick={() => navigate(detailUrl)}
                            className="flex items-center gap-3 rounded-control text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
                          >
                            <ProductThumb
                              image={od.Product.image}
                              name={od.Product.productName}
                            />
                            <span className="truncate font-medium text-ink">
                              {od.Product.productName}
                            </span>
                          </button>
                        </td>
                        <td className="px-5 py-3 tabular-nums text-ink-2">
                          {od.quantity}
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-ink">{order.phoneNumber}</p>
                          <p className="mt-0.5 max-w-[12rem] truncate text-xs text-muted">
                            {order.shippingAddress}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <Price
                            value={order.totalAmount}
                            className="font-semibold text-ink"
                          />
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge tone={toStatusTone(order.orderStatus)}>
                            {humanize(order.orderStatus)}
                          </StatusBadge>
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge tone={toPaymentTone(paymentStatus)}>
                            {paymentStatus ? humanize(paymentStatus) : "No payment"}
                          </StatusBadge>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(detailUrl)}
                            >
                              <Eye aria-hidden className="size-4" />
                              View
                            </Button>
                            <SegmentedControl
                              ariaLabel={`Order status for ${order.id}`}
                              className="w-full justify-end sm:w-auto"
                              value={order.orderStatus}
                              options={statusOptions}
                              onChange={(status) => onUpdateStatus(order.id, status)}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                onUpdatePayment(
                                  order.id,
                                  paymentStatus === "paid" ? "unpaid" : "paid",
                                )
                              }
                            >
                              {paymentStatus === "paid" ? "Mark unpaid" : "Mark paid"}
                            </Button>
                            <Button
                              size="icon"
                              variant="danger"
                              title="Delete order"
                              aria-label={`Delete order ${order.id}`}
                              onClick={() => onDelete(order.id)}
                            >
                              <Trash2 aria-hidden className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {pagination && <Pagination pagination={pagination} onPageChange={onPageChange} />}
          </>
        )}
      </Panel>
    </div>
  );
}
