import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  ArrowLeft,
  Check,
  Lock,
  PackageX,
  RotateCcw,
  Truck,
} from "lucide-react";
import { authAPI, getImageUrl } from "../api";
import type { Product } from "../types";
import { setCart } from "../store/cartSlice";
import { toast, showErrorToast } from "../lib/toast";
import { Container } from "../Components/ui/Container";
import { Button } from "../Components/ui/Button";
import { Price } from "../Components/ui/Price";
import { QuantityStepper } from "../Components/ui/QuantityStepper";
import { Skeleton } from "../Components/ui/Skeleton";

const MAX_QUANTITY = 15;
const LOW_STOCK = 5;

const REASSURANCE = [
  { icon: Truck, label: "Free delivery", sub: "Orders over Rs. 50" },
  { icon: RotateCcw, label: "Easy returns", sub: "30-day window" },
  { icon: Lock, label: "Secure payment", sub: "Handled by Khalti" },
];

export default function ProductDetail() {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getProduct = async () => {
    if (!id) return;
    try {
      const res = await authAPI.get(`/product/getSingle/${id}`);
      setProduct(res.data?.data ?? null);
    } catch (error) {
      showErrorToast(error, "Failed to load product.");
    }
  };

  const addToCart = async (q: number) => {
    if (!id) return;
    try {
      const res = await authAPI.post("/cart/addToCart", {
        quantity: q,
        productId: id,
      });
      if (res.status === 200) {
        setAdded(true);
        toast.success("Added to cart.");
      }
    } catch (error) {
      showErrorToast(error, "Failed to add to cart.");
    }
  };

  useEffect(() => {
    getProduct();
  }, [id]);

  const placeOrder = async () => {
    if (!product) return;
    await addToCart(quantity);
    dispatch(
      setCart([
        {
          Product: product,
          id: "34398",
          quantity: quantity,
          selected: true,
          productId: product.id,
        },
      ])
    );
    const selectedIds = [product.id];
    navigate(`/placeOrder?items=${selectedIds?.join(",")}`);
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-paper">
        <Container>
          <div className="grid gap-10 py-10 lg:grid-cols-2">
            <Skeleton className="aspect-square w-full rounded-panel" />
            <div className="flex flex-col gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-3/4" />
              <Skeleton className="h-8 w-32" />
              <SkeletonTextLines />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  const stock = product.stock;
  const outOfStock = stock != null && stock <= 0;
  const lowStock = stock != null && stock > 0 && stock <= LOW_STOCK;
  const maxQuantity = Math.min(MAX_QUANTITY, stock ?? MAX_QUANTITY);

  return (
    <div className="min-h-screen bg-paper">
      <Container>
        <div className="py-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-control text-sm font-medium text-ink-2 transition-colors hover:text-pine focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pine"
          >
            <ArrowLeft aria-hidden className="size-4" />
            Continue shopping
          </Link>
        </div>

        <div className="grid gap-10 pb-16 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col gap-4">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-panel border border-line bg-paper-2">
              <img
                src={getImageUrl(product.image)}
                alt={product.productName}
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <p className="text-sm text-muted">{product.Category.categoryName}</p>

            <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight text-ink">
              {product.productName}
            </h1>

            <div className="mt-5 flex items-baseline gap-3">
              <Price value={product.productPrice} className="text-4xl font-semibold text-ink" />
            </div>

            <p className="mt-5 max-w-prose border-b border-line pb-5 text-sm leading-relaxed text-ink-2">
              {product.productDescription}
            </p>

            <div className="mt-5 flex items-center gap-2">
              <span
                aria-hidden
                className={`size-2 rounded-full ${
                  outOfStock ? "bg-muted" : lowStock ? "bg-crimson" : "bg-pine"
                }`}
              />
              <span className={`text-sm ${lowStock ? "font-medium text-crimson" : "text-muted"}`}>
                {outOfStock
                  ? "Out of stock"
                  : lowStock
                    ? `Only ${stock} left`
                    : "In stock"}
              </span>
            </div>

            <div className="mt-7 flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-medium text-ink">Quantity</span>
                <QuantityStepper
                  value={quantity}
                  min={1}
                  max={maxQuantity}
                  onChange={setQuantity}
                />
                <span className="text-sm text-muted">
                  Total{" "}
                  <Price
                    value={product.productPrice * quantity}
                    className="font-semibold text-ink"
                  />
                </span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="primary"
                  className="flex-1"
                  disabled={outOfStock}
                  onClick={placeOrder}
                >
                  Buy now
                </Button>
                <Button
                  variant="solid"
                  className="flex-1"
                  disabled={outOfStock}
                  onClick={() => addToCart(quantity)}
                >
                  {added ? (
                    <>
                      <Check aria-hidden className="size-4" strokeWidth={2.5} />
                      In cart
                    </>
                  ) : (
                    "Add to cart"
                  )}
                </Button>
              </div>

              {outOfStock && (
                <p className="flex items-center gap-2 text-sm text-muted">
                  <PackageX aria-hidden className="size-4" />
                  This seller is out of stock. Check back or browse similar products.
                </p>
              )}

              <div className="grid grid-cols-3 gap-2 border-t border-line pt-5">
                {REASSURANCE.map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex flex-col items-center px-2 text-center">
                    <Icon aria-hidden className="size-5 text-pine" />
                    <p className="mt-2 text-xs font-medium text-ink">{label}</p>
                    <p className="mt-0.5 text-[11px] text-muted">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

function SkeletonTextLines() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-11/12" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="mt-4 h-11 w-40 rounded-control" />
    </div>
  );
}