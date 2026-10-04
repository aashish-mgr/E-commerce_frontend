import { useState, useEffect } from "react";
import { ArrowLeft, ChevronDown, MapPin, Phone, X, Check, ShieldQuestion } from "lucide-react";
import { authAPI, getImageUrl } from "../api";
import { Link, useParams } from "react-router-dom";
import type { Order, OrderItem, OrderStatus } from "../types";
import { toast, showErrorToast } from "../lib/toast";
import { cn } from "../lib/cn";
import { formatDate, formatPhone, humanize } from "../lib/format";
import { Container } from "../Components/ui/Container";
import { Button } from "../Components/ui/Button";
import { Price } from "../Components/ui/Price";
import { StatusBadge } from "../Components/ui/StatusBadge";

// ── Status tracking ───────────────────────────────────────────

const STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "Placed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

// ── Helpers ───────────────────────────────────────────────────

function lineTotal(item: OrderItem) {
  return item.Product.productPrice * item.quantity;
}

function totalItems(order: Order) {
  return order?.OrderDetails?.reduce((sum, i) => sum + i.quantity, 0);
}

// ── Status Progress Tracker ───────────────────────────────────

function StatusTracker({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  if (normalized === "cancelled") {
    return (
      <div className="flex items-start gap-3 rounded-panel bg-crimson-soft p-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface text-crimson">
          <X aria-hidden className="size-4" strokeWidth={2.5} />
        </span>
        <div>
          <p className="text-sm font-semibold text-crimson">Order cancelled</p>
          <p className="mt-0.5 text-sm text-crimson/90">
            This order was cancelled and will not be processed.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === normalized);

  return (
    <ol className="rounded-panel border border-line bg-surface p-5">
      <li className="sr-only">Order progress</li>
      <div className="flex items-center">
        {STATUS_STEPS.map((step, index) => {
          const isComplete = index <= currentIndex;
          const isLast = index === STATUS_STEPS.length - 1;
          return (
            <li
              key={step.key}
              aria-current={index === currentIndex ? "step" : undefined}
              className={cn("flex items-center", isLast ? "" : "flex-1")}
            >
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
                    isComplete ? "bg-pine text-paper" : "bg-paper-2 text-muted",
                  )}
                >
                  {isComplete && currentIndex > index ? (
                    <Check aria-hidden className="size-4" strokeWidth={3} />
                  ) : (
                    <span className="font-display text-xs font-semibold tabular-nums">
                      {index + 1}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium",
                    isComplete ? "text-ink" : "text-muted",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <span
                  aria-hidden
                  className={cn(
                    "-mt-5 mx-2 h-0.5 flex-1 rounded-full transition-colors",
                    index < currentIndex ? "bg-pine" : "bg-line",
                  )}
                />
              )}
            </li>
          );
        })}
      </div>
    </ol>
  );
}

// ── Order Item Row ────────────────────────────────────────────

function OrderItemRow({ item }: { item: OrderItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-line py-4 last:border-b-0">
      <div className="flex items-start gap-4">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-tile bg-paper-2">
          <img
            src={getImageUrl(item.Product.image)}
            alt={item.Product.productName}
            loading="lazy"
            className="h-full w-full object-contain"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted">{item.Product.Category?.categoryName}</p>
          <h3 className="mt-0.5 font-sans text-[15px] font-medium text-ink">
            {item.Product.productName}
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            {item.quantity} × <Price value={item.Product.productPrice} />
          </p>

          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            aria-expanded={expanded}
            className="mt-2 inline-flex items-center gap-1 rounded-control text-xs font-medium text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
          >
            {expanded ? "Hide description" : "View description"}
            <ChevronDown
              aria-hidden
              className={cn("size-3.5 transition-transform", expanded && "rotate-180")}
            />
          </button>

          {expanded && (
            <p className="mt-2 rounded-control bg-paper-2 p-3 text-xs leading-relaxed text-ink-2">
              {item.Product.productDescription}
            </p>
          )}
        </div>

        <Price
          value={lineTotal(item)}
          className="shrink-0 text-sm font-semibold text-ink"
        />
      </div>
    </div>
  );
}

// ── Order Detail Page ─────────────────────────────────────────

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order>();
  const subtotal = order?.OrderDetails?.reduce((sum, i) => sum + lineTotal(i), 0) ?? 0;
  const shipping = (order?.totalAmount ?? 0) - subtotal;

  const getOrderDetail = async () => {
    try {
      const res = await authAPI.get(`/order/getOrderDetail/${id}`);
      setOrder(res.data?.data[0]);
    } catch (err) {
      showErrorToast(err, "Failed to load order details.");
    }
  };

  useEffect(() => {
    getOrderDetail();
  }, []);

  const cancelOrder = async () => {
    try {
      const res = await authAPI.patch(`/order/cancelOrder/${id}`);
      if (res.status === 200) {
        toast.success("Order cancelled successfully.");
        getOrderDetail();
      }
    } catch (err) {
      showErrorToast(err, "Failed to cancel order.");
    }
  };

  const status = order?.orderStatus ?? "pending";

  return (
    <div className="min-h-screen bg-paper">
      <Container className="max-w-4xl">
        <div className="py-6">
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 rounded-control text-sm font-medium text-ink-2 transition-colors hover:text-pine focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pine"
          >
            <ArrowLeft aria-hidden className="size-4" />
            Back to orders
          </Link>        </div>

        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
              Order {order?.id}
            </h1>
            <p className="mt-1 text-sm text-muted">
              Placed on {order?.createdAt ? formatDate(order.createdAt) : "an unknown date"}
            </p>
          </div>
          <StatusBadge tone={(status.toLowerCase() as OrderStatus) ?? "pending"}>
            {humanize(status)}
          </StatusBadge>
        </div>

        <div className="py-6">
          <StatusTracker status={status} />
        </div>

        <div className="grid gap-8 pb-16 lg:grid-cols-3 lg:gap-10">
          {/* ── Left — Items + Shipping ── */}
          <div className="flex flex-col gap-8 lg:col-span-2">
            <section aria-labelledby="items-heading">
              <h2
                id="items-heading"
                className="border-b border-line pb-3 font-display text-base font-semibold text-ink"
              >
                Items ({order ? totalItems(order) : 0})
              </h2>
              <div>
                {order?.OrderDetails?.map((item) => (
                  <OrderItemRow key={item.id} item={item} />
                ))}
              </div>
            </section>

            <section aria-labelledby="shipping-heading">
              <h2
                id="shipping-heading"
                className="border-b border-line pb-3 font-display text-base font-semibold text-ink"
              >
                Shipping information
              </h2>
              <dl className="flex flex-col gap-4 pt-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-pine-soft text-pine">
                    <MapPin aria-hidden className="size-4" />
                  </span>
                  <div>
                    <dt className="text-xs text-muted">Delivery address</dt>
                    <dd className="mt-0.5 text-sm text-ink-2">{order?.shippingAddress}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-pine-soft text-pine">
                    <Phone aria-hidden className="size-4" />
                  </span>
                  <div>
                    <dt className="text-xs text-muted">Contact number</dt>
                    <dd className="mt-0.5 text-sm text-ink-2">
                      {formatPhone(order?.phoneNumber ?? "")}
                    </dd>
                  </div>
                </div>
              </dl>
            </section>
          </div>

          {/* ── Right — Order Summary ── */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 flex flex-col gap-4 rounded-panel bg-pine p-5 text-paper">
              <h2 className="font-display text-base font-semibold">Order summary</h2>

              <div className="flex flex-col gap-2.5 border-t border-paper/15 pt-4 text-sm">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-paper/75">Subtotal</span>
                  <Price value={subtotal} decimals className="font-medium text-paper" />
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-paper/75">Shipping and tax</span>
                  {shipping > 0 ? (
                    <Price value={shipping} decimals className="font-medium text-paper" />
                  ) : (
                    <span className="font-display font-medium text-marigold">Free</span>
                  )}
                </div>
              </div>

              <div className="flex items-baseline justify-between gap-4 border-t border-paper/15 pt-4">
                <span className="font-display text-base font-semibold">Total</span>
                <Price
                  value={order?.totalAmount ? order.totalAmount : 0}
                  decimals
                  className="text-xl font-semibold text-paper"
                />
              </div>

              <div className="mt-1 flex flex-col gap-2">
                {order?.orderStatus?.toLowerCase() === "delivered" && (
                  <Button variant="primary" className="w-full" disabled title="Not wired up yet">
                    Buy again
                  </Button>
                )}
                {(order?.orderStatus?.toLowerCase() === "pending" ||
                  order?.orderStatus?.toLowerCase() === "shipped") && (
                  <Button variant="primary" className="w-full" disabled title="Not wired up yet">
                    Track shipment
                  </Button>
                )}
                <Button variant="ghost" className="w-full text-paper hover:bg-paper/10 hover:text-paper" disabled title="Not wired up yet">
                  Download invoice
                </Button>
                {order?.orderStatus?.toLowerCase() === "pending" && (
                  <Button
                    variant="ghost"
                    className="w-full text-crimson-bright hover:bg-crimson-bright/10 hover:text-crimson-bright"
                    onClick={cancelOrder}
                  >
                    Cancel order
                  </Button>
                )}
              </div>

              <p className="mt-1 flex items-center justify-center gap-1.5 text-[11px] text-paper/65">
                <ShieldQuestion aria-hidden className="size-3.5" />
                Need help? Contact support
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}