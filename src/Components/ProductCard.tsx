import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import type { Product } from "../types";
import { getImageUrl } from "../api";
import { cn } from "../lib/cn";
import { formatCount } from "../lib/format";
import { Price } from "./ui/Price";

interface Props {
  product: Product;
  /** Resolves `true` once the item is actually in the cart, `false` otherwise. */
  onAddToCart: (product: Product) => Promise<boolean>;
}

const LOW_STOCK = 5;

export default function ProductCard({ product, onAddToCart }: Props) {
  const [added, setAdded] = useState(false);
  const [pending, setPending] = useState(false);

  const stock = product.stock;
  const outOfStock = stock != null && stock <= 0;
  const lowStock = stock != null && stock > 0 && stock <= LOW_STOCK;

  /**
   * The card used to wrap the whole tile in a click handler, so the add button
   * also navigated away. The button is now a sibling of the link and stops
   * propagation defensively.
   *
   * The "In cart" state waits for the request instead of flipping optimistically,
   * so a failed add (or a signed-out visitor) never claims the item was added.
   */
  const handleAdd = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (pending || outOfStock) return;
    setPending(true);
    try {
      setAdded(await onAddToCart(product));
    } finally {
      setPending(false);
    }
  };

  return (
    <article className="group flex flex-col">
      <Link
        to={`/product/${product.id}`}
        className="block rounded-tile focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pine"
      >
        <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-tile bg-paper-2">
          <img
            src={getImageUrl(product.image)}
            alt={product.productName}
            loading="lazy"
            className="h-full w-full object-contain"
          />
        </div>
        <p className="mt-3 text-xs text-muted">{product.Category.categoryName}</p>
        <h3 className="mt-0.5 line-clamp-2 font-sans text-[15px] font-medium leading-snug text-ink group-hover:text-pine">
          {product.productName}
        </h3>
      </Link>

      <p className="mt-1 line-clamp-2 text-sm text-muted">
        {product.productDescription}
      </p>

      <div className="mt-auto pt-3">
        <div className="flex items-baseline justify-between gap-3">
          <Price value={product.productPrice} className="text-lg font-semibold text-ink" />
          <p
            className={cn(
              "text-xs",
              outOfStock
                ? "text-muted"
                : lowStock
                  ? "font-medium text-crimson"
                  : "text-muted",
            )}
          >
            {outOfStock
              ? "Out of stock"
              : `${formatCount(stock ?? 0)} available`}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock || pending}
          aria-busy={pending}
          aria-label={
            outOfStock
              ? `${product.productName} is out of stock`
              : pending
                ? `Adding ${product.productName} to cart`
                : `Add ${product.productName} to cart`
          }
          className={cn(
            "mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-control px-4",
            "text-sm font-semibold transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine",
            "disabled:cursor-not-allowed",
            added
              ? "bg-pine-soft text-pine"
              : outOfStock
                ? "bg-paper-2 text-muted"
                : "border border-line bg-surface text-ink hover:border-pine hover:text-pine",
          )}
        >
          {added ? (
            <>
              <Check aria-hidden className="size-4" strokeWidth={2.5} />
              In cart
            </>
          ) : pending ? (
            <>
              <Loader2 aria-hidden className="size-4 animate-spin" />
              Adding…
            </>
          ) : outOfStock ? (
            "Out of stock"
          ) : (
            "Add to cart"
          )}
        </button>
      </div>
    </article>
  );
}