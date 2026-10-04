import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Lock, ShoppingBag, Trash2, Truck } from "lucide-react";
import { getImageUrl } from "../api";
import type { Cart as CartItem } from "../types";
import { getCartItems, deleteCartItem } from "../store/cartSlice";
import { showErrorToast } from "../lib/toast";
import { cn } from "../lib/cn";
import { Container } from "../Components/ui/Container";
import { Button } from "../Components/ui/Button";
import { CheckboxControl } from "../Components/ui/Checkbox";
import { EmptyState } from "../Components/ui/EmptyState";
import { PageHeader } from "../Components/ui/PageHeader";
import { Price } from "../Components/ui/Price";
import { QuantityStepper } from "../Components/ui/QuantityStepper";

const SHIPPING_THRESHOLD = 50; // free shipping above this
const TAX_RATE = 0.08;
const SHIPPING_FLAT = 9.99;

// ── Sub-components ────────────────────────────────────────────

function CartRow({
  item,
  onToggleSelect,
  onIncrement,
  onDecrement,
  onRemove,
}: {
  item: CartItem;
  onToggleSelect: (id: string) => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 border-b border-line py-5 transition-colors",
        !item.selected && "opacity-60",
      )}
    >
      <CheckboxControl
        checked={item.selected}
        onCheckedChange={() => onToggleSelect(item.id)}
        aria-label={`Select ${item.Product.productName}`}
        className="mt-1"
      />

      <Link
        to={`/product/${item.Product.id}`}
        className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-tile bg-paper-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
      >
        <img
          src={getImageUrl(item.Product.image)}
          alt={item.Product.productName}
          loading="lazy"
          className="h-full w-full object-contain"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted">{item.Product.Category?.categoryName}</p>
            <h3 className="mt-0.5 truncate font-sans text-[15px] font-medium text-ink">
              {item.Product.productName}
            </h3>
          </div>
          <Price
            value={item.Product.productPrice}
            className="shrink-0 text-base font-semibold text-ink"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <QuantityStepper
              size="sm"
              value={item.quantity}
              max={15}
              onChange={(next) =>
                next > item.quantity ? onIncrement(item.id) : onDecrement(item.id)
              }
              label={item.Product.productName}
            />
            <span className="text-xs text-muted">
              Subtotal{" "}
              <Price
                value={item.Product.productPrice * item.quantity}
                className="font-semibold text-ink-2"
              />
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-muted hover:text-crimson"
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.Product.productName} from cart`}
          >
            <Trash2 aria-hidden className="size-4" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}

function SummaryLine({
  label,
  children,
  muted = false,
  onPine = false,
}: {
  label: string;
  children: React.ReactNode;
  muted?: boolean;
  onPine?: boolean;
}) {
  // On pine the light scale is mandatory: ink/muted are darker than the surface.
  const labelTone = onPine
    ? muted
      ? "text-paper/70"
      : "text-paper/75"
    : muted
      ? "text-muted"
      : "text-ink-2";
  const valueTone = onPine
    ? muted
      ? "text-paper/70"
      : "text-paper"
    : muted
      ? "text-muted"
      : "text-ink";

  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className={labelTone}>{label}</span>
      <span className={cn("font-display font-medium tabular-nums", valueTone)}>
        {children}
      </span>
    </div>
  );
}

// ── Cart Page ─────────────────────────────────────────────────

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const dispatch = useDispatch();
  const cartState = useSelector((state: any) => state.cart);

  // ── Derived values ────────────────────────────────────────

  const selectedItems = items?.filter((i) => i.selected);
  const allSelected = items?.length > 0 && items.every((i) => i.selected);
  const someSelected = items?.some((i) => i.selected);

  const subtotal = selectedItems?.reduce(
    (sum, i) => sum + i.Product.productPrice * i.quantity,
    0
  );

  const shipping = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FLAT;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;
  const totalItems = items?.reduce((sum, i) => sum + i.quantity, 0);
  const selectedCount = selectedItems?.reduce((sum, i) => sum + i.quantity, 0);
  const navigate = useNavigate();

  // ── Handlers ─────────────────────────────────────────────

  const toggleSelect = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i)));
  const toggleAll = () =>
    setItems((prev) => prev.map((i) => ({ ...i, selected: !allSelected })));
  const increment = (id: string) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id && i.quantity < 15 ? { ...i, quantity: i.quantity + 1 } : i))
    );
  const decrement = (id: string) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id && i.quantity > 1 ? { ...i, quantity: i.quantity - 1 } : i))
    );

  useEffect(() => {
    dispatch(getCartItems() as any);
  }, []);
  useEffect(() => {
    // cart is null until the request resolves, and stays null on failure.
    // Assigning it straight through would leave items null and every later
    // read of it undefined.
    setItems(cartState.cart ?? []);
  }, [cartState.cart]);

  const placeOrder = () => {
    const selectedIds = selectedItems?.map((i) => i.productId);
    navigate(`/placeOrder?items=${selectedIds?.join(",")}`);
  };

  const deleteCart = async (id: string) => {
    try {
      if (!id) return;
      await dispatch(deleteCartItem(id) as any);
      await dispatch(getCartItems() as any);
    } catch (err) {
      showErrorToast(err, "Something went wrong");
    }
  };

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-paper">
      <Container>
        <PageHeader
          className="mt-8"
          title="Your cart"
          description={
            totalItems
              ? `${totalItems} ${totalItems === 1 ? "item" : "items"} from sellers across Nepal`
              : "Nothing here yet."
          }
          action={
            <Link
              to="/dashboard"
              className="inline-flex h-11 items-center gap-1.5 rounded-control px-3 text-sm font-medium text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
            >
              <ArrowLeft aria-hidden className="size-4" />
              Keep shopping
            </Link>
          }
        />

        {items?.length === 0 ? (
          <EmptyState
            className="py-10"
            icon={ShoppingBag}
            title="Your cart is empty"
            direction="Products you add from any seller collect here before checkout."
            action={
              <Link
                to="/dashboard"
                className="inline-flex h-11 items-center rounded-control bg-marigold px-5 text-sm font-semibold text-ink transition-colors hover:bg-marigold-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                Browse products
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-10 py-8 lg:flex-row lg:gap-12">
            {/* ── Left — Item list ── */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-4 py-3">
                <label className="flex cursor-pointer select-none items-center gap-3">
                  <CheckboxControl
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select every item"
                  />
                  <span className="text-sm font-medium text-ink">
                    Select all
                    <span className="ml-1 font-normal text-muted">
                      ({items?.length} {items?.length === 1 ? "line" : "lines"})
                    </span>
                  </span>
                </label>

                {someSelected && (
                  <button
                    type="button"
                    onClick={() => {
                      selectedItems?.map((i) => deleteCart(i.id));
                    }}
                    className="inline-flex h-10 items-center gap-1.5 rounded-control px-3 text-sm font-medium text-muted transition-colors hover:bg-crimson-soft hover:text-crimson focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
                  >
                    <Trash2 aria-hidden className="size-4" />
                    Remove selected
                  </button>
                )}
              </div>

              <div>
                {items?.map((item) => (
                  <CartRow
                    key={item.id}
                    item={item}
                    onToggleSelect={toggleSelect}
                    onIncrement={increment}
                    onDecrement={decrement}
                    onRemove={deleteCart}
                  />
                ))}
              </div>

              {subtotal < SHIPPING_THRESHOLD && subtotal > 0 && (
                <div className="mt-6 rounded-panel border border-line bg-surface p-4">
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                    <span className="text-ink-2">
                      Add{" "}
                      <Price
                        value={SHIPPING_THRESHOLD - subtotal}
                        className="font-semibold text-ink"
                      />{" "}
                      more for free delivery
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-muted">
                      <Truck aria-hidden className="size-4" />
                      Free over <Price value={SHIPPING_THRESHOLD} />
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={SHIPPING_THRESHOLD}
                    aria-valuenow={Math.min(subtotal, SHIPPING_THRESHOLD)}
                    aria-label="Progress toward free delivery"
                    className="h-1.5 w-full overflow-hidden rounded-full bg-paper-2"
                  >
                    <div
                      className="h-full rounded-full bg-pine transition-[width] duration-500"
                      style={{ width: `${Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── Right — Order summary ── */}
            <aside className="w-full shrink-0 lg:w-80">
              <div className="sticky top-24 rounded-panel bg-pine p-5 text-paper">
                <h2 className="font-display text-base font-semibold">Order summary</h2>

                <p className="mt-2 text-xs text-paper/70">
                  {selectedCount > 0
                    ? `Calculating for ${selectedCount} selected ${selectedCount === 1 ? "item" : "items"}`
                    : "Nothing selected yet."}
                </p>

                <div className="mt-5 flex flex-col gap-2.5 border-t border-paper/15 pt-4">
                  <SummaryLine label="Subtotal" onPine>
                    <Price value={subtotal} decimals />
                  </SummaryLine>
                  <SummaryLine label="Delivery" onPine>
                    {shipping === 0 ? (
                      <span className="text-marigold">
                        {subtotal === 0 ? "—" : "Free"}
                      </span>
                    ) : (
                      <Price value={shipping} decimals />
                    )}
                  </SummaryLine>
                  <SummaryLine label={`Tax (${(TAX_RATE * 100).toFixed(0)}%)`} muted onPine>
                    <Price value={tax} decimals />
                  </SummaryLine>
                </div>

                <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-paper/15 pt-4">
                  <span className="font-display text-base font-semibold">Total</span>
                  <Price value={total} decimals className="text-xl font-semibold text-paper" />
                </div>

                <Button
                  variant="primary"
                  className="mt-5 w-full"
                  disabled={selectedCount === 0}
                  onClick={placeOrder}
                >
                  {selectedCount === 0 ? "Select items to check out" : "Proceed to payment"}
                </Button>

                <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-paper/65">
                  <Lock aria-hidden className="size-3.5" />
                  Payments are handled by Khalti
                </p>
              </div>
            </aside>
          </div>
        )}
      </Container>
    </div>
  );
}