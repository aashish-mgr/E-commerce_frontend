import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CreditCard, ImageOff, MapPin, PackageSearch, Trash2, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { authAPI, getImageUrl } from "../api";
import { toPaymentTone, toStatusTone } from "../Components/vendor/types";
import type { VendorOrderDetail } from "../Components/vendor/types";
import { toast } from "../lib/toast";
import { Button } from "../Components/ui/Button";
import { Container } from "../Components/ui/Container";
import { EmptyState } from "../Components/ui/EmptyState";
import { PageHeader } from "../Components/ui/PageHeader";
import { Panel } from "../Components/ui/Panel";
import { Price } from "../Components/ui/Price";
import { SegmentedControl } from "../Components/ui/SegmentedControl";
import { Skeleton } from "../Components/ui/Skeleton";
import { StatusBadge } from "../Components/ui/StatusBadge";
import { formatDateTime, humanize } from "../lib/format";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Panel className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-control bg-pine-soft text-pine">
          <Icon aria-hidden className="size-4" />
        </span>
        <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
      </div>
      {children}
    </Panel>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted">{label}</p>
      <p className="break-words text-sm text-ink">{value}</p>
    </div>
  );
}

export default function VendorOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<VendorOrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      await toast.promise(
        authAPI.patch(`/order/updateOrderStatus/${orderId}`, { orderStatus: status }),
        {
          loading: "Updating order status...",
          success: "Order status updated",
          error: "Failed to update status",
        }
      ).unwrap();
      await fetchDetail();
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentToggle = async () => {
    if (!orderId || !payment) return;
    setSaving(true);
    try {
      await toast.promise(
        authAPI.patch(`/order/updatePaymentStatus/${orderId}`, {
          paymentStatus: payment.paymentStatus === "paid" ? "unpaid" : "paid",
        }),
        {
          loading: "Updating payment status...",
          success: "Payment status updated",
          error: "Failed to update payment status",
        }
      ).unwrap();
      await fetchDetail();
    } catch (error) {
      console.error("Error updating payment status:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!orderId) return;
    toast.confirm("Delete this order?", {
      label: "Delete",
      onClick: async () => {
        try {
          await toast.promise(authAPI.delete(`/order/deleteOrder/${orderId}`), {
            loading: "Deleting order...",
            success: "Order deleted",
            error: "Failed to delete order",
          }).unwrap();
          navigate("/vendor/dashboard", { replace: true });
        } catch (error) {
          console.error("Error deleting order:", error);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <Container width="dashboard" className="py-8">
          <Skeleton className="h-24 rounded-panel" />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-panel" />
            ))}
          </div>
          <Skeleton className="mt-6 h-72 rounded-panel" />
        </Container>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-4">
        <Panel className="w-full max-w-md">
          <EmptyState
            icon={PackageSearch}
            title="Order not found"
            direction="This order may have been removed or does not belong to your store."
            action={
              <Button variant="outline" onClick={() => navigate("/vendor/dashboard")}>
                Back to dashboard
              </Button>
            }
          />
        </Panel>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Container width="dashboard" className="py-8">
        <PageHeader
          className="mb-6"
          title="Order details"
          description={
            <>
              Order <span className="text-ink">{order.id}</span> ·{" "}
              {formatDateTime(order.createdAt)}
            </>
          }
          action={
            <StatusBadge tone={toStatusTone(order.orderStatus)}>
              {humanize(order.orderStatus)}
            </StatusBadge>
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard icon={User} title="Customer">
            <div className="space-y-3">
              <Detail label="Name" value={order.User?.userName ?? "—"} />
              <Detail label="Email" value={order.User?.userEmail ?? "—"} />
              <Detail label="Phone" value={order.phoneNumber || "—"} />
            </div>
          </InfoCard>

          <InfoCard icon={MapPin} title="Shipping">
            <p className="text-sm leading-relaxed text-ink">{order.shippingAddress}</p>
            <p className="mt-3 text-sm text-muted">
              Ordered on {formatDateTime(order.createdAt)}
            </p>
          </InfoCard>

          <InfoCard icon={CreditCard} title="Payment">
            <div className="space-y-3">
              <Detail
                label="Method"
                value={payment?.paymentMethod ? humanize(payment.paymentMethod) : "—"}
              />
              <div>
                <p className="mb-1.5 text-sm text-muted">Status</p>
                <StatusBadge tone={toPaymentTone(payment?.paymentStatus)}>
                  {payment?.paymentStatus
                    ? humanize(payment.paymentStatus)
                    : "No payment"}
                </StatusBadge>
              </div>
            </div>
          </InfoCard>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Panel className="lg:col-span-2">
            <h2 className="border-b border-line px-5 py-4 font-display text-base font-semibold text-ink">
              Order items
            </h2>
            <ul className="divide-y divide-line">
              {items.map((od) => {
                const src = getImageUrl(od.Product.image);
                return (
                  <li key={od.id} className="flex items-center gap-4 px-5 py-4">
                    <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-tile bg-paper-2">
                      {src ? (
                        <img
                          src={src}
                          alt={od.Product.productName}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      ) : (
                        <ImageOff aria-hidden className="size-5 text-muted" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
                        {od.Product.productName}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        Qty {od.quantity} × <Price value={od.Product.productPrice} />
                      </p>
                    </div>
                    <Price
                      value={Number(od.Product.productPrice) * od.quantity}
                      className="shrink-0 text-sm font-semibold text-ink"
                    />
                  </li>
                );
              })}
            </ul>
          </Panel>

          <div className="space-y-4">
            <Panel className="bg-pine p-5 text-paper">
              <h2 className="font-display text-base font-semibold">Order summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-pine-soft">Items subtotal</dt>
                  <dd>
                    <Price value={order.totalAmount} />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-pine-soft">Shipping</dt>
                  <dd>Free</dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-paper/20 pt-3 font-display text-base font-semibold">
                  <dt>Total</dt>
                  <dd>
                    <Price value={order.totalAmount} />
                  </dd>
                </div>
              </dl>
            </Panel>

            <Panel className="p-5">
              <h2 className="font-display text-base font-semibold text-ink">
                Manage order
              </h2>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="mb-2 text-sm font-medium text-ink-2">Order status</p>
                  <SegmentedControl
                    ariaLabel="Order status"
                    className="w-full"
                    value={order.orderStatus}
                    options={statusOptions}
                    disabled={saving}
                    onChange={handleStatusChange}
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  loading={saving}
                  loadingLabel="Saving…"
                  disabled={saving || !payment}
                  onClick={handlePaymentToggle}
                >
                  {payment?.paymentStatus === "paid" ? "Mark as unpaid" : "Mark as paid"}
                </Button>
                <Button
                  variant="danger"
                  className="w-full"
                  disabled={saving}
                  onClick={handleDelete}
                >
                  <Trash2 aria-hidden className="size-4" />
                  Delete order
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate("/vendor/dashboard")}
                >
                  Back to dashboard
                </Button>
              </div>
            </Panel>
          </div>
        </div>
      </Container>
    </div>
  );
}
