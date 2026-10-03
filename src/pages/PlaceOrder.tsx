import { useState, useEffect, useMemo } from "react";
import type { User, Cart } from "../types";
import { useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AlertCircle, ArrowLeft, Banknote, Lock, Wallet } from "lucide-react";
import { authAPI, getImageUrl } from "../api";
import { setCart, deleteCartItem } from "../store/cartSlice";
import OrderSuccess from "../Components/OrderSuccess";
import { toast, getServerMessage, showErrorToast } from "../lib/toast";
import { Container } from "../Components/ui/Container";
import { Button } from "../Components/ui/Button";
import { Field } from "../Components/ui/Field";
import { Input } from "../Components/ui/Input";
import { Textarea } from "../Components/ui/Textarea";
import { RadioGroup, RadioCard } from "../Components/ui/RadioGroup";
import { Price } from "../Components/ui/Price";
import { QuantityStepper } from "../Components/ui/QuantityStepper";

// ── Seed data ─────────────────────────────────────────────────

const PAYMENT_METHODS = [
  { id: "esewa", label: "E-sewa", note: "Pay from your eSewa wallet" },
  { id: "khalti", label: "Khalti", note: "Redirects to Khalti to confirm" },
  { id: "cod", label: "Cash on delivery", note: "Pay the courier on arrival" },
];

const TAX_RATE = 0.08;
const SHIPPING_THRESHOLD = 100;
const SHIPPING_FLAT = 9.99;

// ── Place Order Page ──────────────────────────────────────────

export default function PlaceOrder() {
  // Form state
  const [cartItems, setCartItems] = useState<Cart[]>([]);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState("esewa");
  const cartState = useSelector((state: any) => state.cart);
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const authState = useSelector((state: any) => state.auth);

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  const CURRENT_USER: User | null = authState?.user ?? null;

  // Quantities (per cart item, editable on this page too)
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const selectedIds = useMemo(
    () => searchParams.get("items")?.split(",") ?? [],
    [searchParams]
  );

  useEffect(() => {
    const fetchCart = async () => {
      const res = await authAPI.get("/cart/getMyCarts");
      const cart: Cart[] = res.data?.data;
      const filteredItems = cart.filter((item) => selectedIds.includes(item.productId));
      if (filteredItems.length !== 0) {
        setCartItems(filteredItems);
        dispatch(setCart(filteredItems));
      } else if (cartState.cart) {
        setCartItems(cartState.cart);
      }
    };
    fetchCart();
  }, []);

  useEffect(() => {
    if (cartItems.length === 0) return;
    setQuantities(Object.fromEntries(cartItems.map((c) => [c.id, c.quantity])));
  }, [cartItems]);

  const updateQty = (id: string, next: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, next),
    }));
  };

  // Pricing
  const subtotal = cartItems?.reduce(
    (sum, item) => sum + item.Product.productPrice * (quantities[item.id] ?? item.quantity),
    0
  );
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  // Validation
  const validate = () => {
    const e: Record<string, string> = {};
    if (!address.trim()) e.address = "Shipping address is required.";
    if (!phone.trim()) e.phone = "Phone number is required.";
    else if (!/^\+?[\d\s\-]{7,15}$/.test(phone)) e.phone = "Enter a valid phone number.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const createOrder = async () => {
    try {
      const items = cartItems.map((c) => ({
        productId: c.productId,
        quantity: quantities[c.id] ?? c.quantity,
      }));
      const res = await authAPI.post("/order/create", {
        phoneNumber: phone,
        shippingAddress: address,
        totalAmount: total,
        paymentDetails: {
          paymentMethod: payment,
        },
        items,
      });

      if (res.status === 200) {
        cartItems.map((c) => dispatch(deleteCartItem(c.id) as any));
        if (payment === "khalti") {
          window.location.href = res.data.response;

          const pidx = searchParams.get("pidx");
          if (!pidx) {
            toast.error("Payment failed or cancelled.");
          }

          setLoading(false);
          setOrderId(res.data?.orderId ?? "N/A");

          return;
        }
        setPlaced(true);
        setLoading(false);
        setOrderId(res.data?.orderId ?? "N/A");
      } else {
        setErrors((p) => ({
          ...p,
          form: "Failed to place order. Please try again.",
        }));
        return;
      }
    } catch (error) {
      const msg = getServerMessage(error, "Failed to place order. Please try again.");
      showErrorToast(error, msg);
      setErrors((p) => ({
        ...p,
        form: msg,
      }));
      setLoading(false);
      return;
    }
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setLoading(true);
    createOrder();
  };

  if (placed) return <OrderSuccess orderId={orderId} onBack={() => setPlaced(false)} />;

  return (
    <div className="min-h-screen bg-paper">
      <Container className="max-w-5xl">
        <div className="py-6">
          <Link
            to="/cart"
            className="mb-5 inline-flex items-center gap-1.5 rounded-control text-sm font-medium text-ink-2 transition-colors hover:text-pine focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pine"
          >
            <ArrowLeft aria-hidden className="size-4" />
            Back to cart
          </Link>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
            Place your order
          </h1>
          <p className="mt-1 text-sm text-muted">
            Ordering as{" "}
            <span className="font-medium text-ink-2">{CURRENT_USER?.userName}</span>
            {" · "}
            {CURRENT_USER?.userEmail}
          </p>
        </div>

        <div className="grid gap-8 pb-16 lg:grid-cols-3 lg:gap-10">
          {/* ── Left column — Forms ── */}
          <div className="flex flex-col gap-8 lg:col-span-2">
            {/* Shipping details */}
            <section aria-labelledby="step-shipping">
              <h2
                id="step-shipping"
                className="border-b border-line pb-3 font-display text-base font-semibold text-ink"
              >
                <span className="mr-2 font-display text-sm font-semibold tabular-nums text-pine">
                  1
                </span>
                Shipping details
              </h2>

              <div className="flex flex-col gap-5 pt-5">
                <Field label="Phone number" required error={errors.phone}>
                  <Input
                    type="tel"
                    addon="+977"
                    placeholder="98XXXXXXXX"
                    value={phone}
                    maxLength={10}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                      setErrors((p) => ({ ...p, phone: "" }));
                    }}
                  />
                </Field>

                <Field label="Shipping address" required error={errors.address}>
                  <Textarea
                    rows={3}
                    placeholder="Street address, city, province, postal code"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setErrors((p) => ({ ...p, address: "" }));
                    }}
                    className="resize-none"
                  />
                </Field>

                <Field label="Delivery note" hint="Optional">
                  <Input
                    type="text"
                    placeholder="Leave at the door, call on arrival"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </Field>
              </div>
            </section>

            {/* Payment method */}
            <section aria-labelledby="step-payment">
              <h2
                id="step-payment"
                className="border-b border-line pb-3 font-display text-base font-semibold text-ink"
              >
                <span className="mr-2 font-display text-sm font-semibold tabular-nums text-pine">
                  2
                </span>
                Payment method
              </h2>

              <RadioGroup
                value={payment}
                onValueChange={setPayment}
                aria-label="Payment method"
                className="flex flex-col gap-2 pt-5"
              >
                {PAYMENT_METHODS.map((method) => (
                  <RadioCard key={method.id} value={method.id}>
                    <span className="flex flex-col">
                      <span className="text-sm font-medium text-ink">{method.label}</span>
                      <span className="text-xs text-muted">{method.note}</span>
                    </span>
                  </RadioCard>
                ))}
              </RadioGroup>

              <p className="mt-4 flex items-start gap-2 rounded-control bg-marigold-soft p-3 text-sm text-amber">
                {payment === "cod" ? (
                  <Banknote aria-hidden className="mt-0.5 size-4 shrink-0" />
                ) : (
                  <Wallet aria-hidden className="mt-0.5 size-4 shrink-0" />
                )}
                {payment === "cod"
                  ? "Pay the courier in cash when your order reaches your door."
                  : "You will be redirected to your wallet to complete the payment."}
              </p>
            </section>
          </div>

          {/* ── Right column — Order Summary ── */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-panel bg-pine p-5 text-paper">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold">
                <span className="font-display text-sm font-semibold tabular-nums text-marigold">
                  3
                </span>
                Order summary
              </h2>

              {/* Item list */}
              <div className="mt-4 flex max-h-72 flex-col gap-3 overflow-y-auto pr-1">
                {cartItems?.map((item) => {
                  const qty = quantities[item.id] ?? item.quantity;
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-tile bg-paper-2">
                        <img
                          src={getImageUrl(item.Product.image)}
                          alt={item.Product.productName}
                          loading="lazy"
                          className="h-full w-full object-contain"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-paper">
                          {item.Product.productName}
                        </p>
                        <p className="mt-0.5 text-xs text-paper/70">
                          {item.Product.Category.categoryName}
                        </p>
                        <QuantityStepper
                          size="sm"
                          onPine
                          value={qty}
                          onChange={(next) => updateQty(item.id, next)}
                          label={item.Product.productName}
                          className="mt-1.5"
                        />
                      </div>

                      <Price
                        value={item.Product.productPrice * qty}
                        decimals
                        className="shrink-0 text-sm font-semibold text-paper"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Price breakdown */}
              <div className="mt-5 flex flex-col gap-2.5 border-t border-paper/15 pt-4 text-sm">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-paper/75">Subtotal</span>
                  <Price value={subtotal} decimals className="font-medium text-paper" />
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-paper/75">Delivery</span>
                  {shipping === 0 ? (
                    <span className="font-display font-medium text-marigold">Free</span>
                  ) : (
                    <Price value={shipping} decimals className="font-medium text-paper" />
                  )}
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-paper/75">Tax (8%)</span>
                  <Price value={tax} decimals className="font-medium text-paper/70" />
                </div>
              </div>

              {shipping > 0 && (
                <p className="mt-3 rounded-control bg-paper/10 px-3 py-2 text-xs text-paper/80">
                  Add{" "}
                  <Price
                    value={SHIPPING_THRESHOLD - subtotal}
                    decimals
                    className="font-semibold text-paper"
                  />{" "}
                  more for free delivery
                </p>
              )}

              {/* Total */}
              <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-paper/15 pt-4">
                <span className="font-display text-base font-semibold">Total</span>
                <Price value={total} decimals className="text-xl font-semibold text-paper" />
              </div>

              {errors.form && (
                <p
                  role="alert"
                  className="mt-4 flex items-start gap-2 rounded-control bg-crimson-soft p-3 text-sm text-crimson"
                >
                  <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
                  {errors.form}
                </p>
              )}

              <Button
                variant="primary"
                className="mt-5 w-full"
                onClick={handleSubmit}
                loading={loading}
                loadingLabel="Placing order"
              >
                Pay <Price value={total} decimals />
              </Button>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-paper/65">
                <Lock aria-hidden className="size-3.5" />
                Payments are handled by your wallet provider
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}