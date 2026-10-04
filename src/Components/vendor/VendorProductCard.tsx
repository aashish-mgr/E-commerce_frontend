import { useState } from "react";
import { ImageOff, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { getImageUrl } from "../../api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/DropdownMenu";
import { Price } from "../ui/Price";
import { cn } from "../../lib/cn";
import { formatCount } from "../../lib/format";
import type { VendorProduct } from "./types";

export default function VendorProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: VendorProduct;
  onEdit: (p: VendorProduct) => void;
  onDelete: (p: VendorProduct) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const src = getImageUrl(product.image);
  const stock = Number(product.stock ?? 0);

  return (
    <article className="flex flex-col overflow-hidden rounded-panel border border-line bg-surface">
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-paper-2">
        {src && !imgError ? (
          <img
            src={src}
            alt={product.productName}
            loading="lazy"
            onError={() => setImgError(true)}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted">
            <ImageOff aria-hidden className="size-8" />
            <span className="text-xs font-medium">No image</span>
          </span>
        )}

        {product.Category?.categoryName && (
          <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-medium text-ink-2 backdrop-blur-sm">
            {product.Category.categoryName}
          </span>
        )}

        <span
          className={cn(
            "absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium",
            stock === 0
              ? "bg-crimson-soft text-crimson"
              : stock <= 5
                ? "bg-marigold-soft text-amber"
                : "bg-surface/90 text-ink-2 backdrop-blur-sm",
          )}
        >
          {stock === 0 ? "Out of stock" : `${formatCount(stock)} in stock`}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1 p-4">
        <h3 className="truncate font-medium text-ink">{product.productName}</h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">
          {product.productDescription}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-line px-4 py-3">
        <Price value={product.productPrice} className="font-semibold text-ink" />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(product)}
            aria-label={`Edit ${product.productName}`}
            title={`Edit ${product.productName}`}
            className="flex size-10 items-center justify-center rounded-control text-ink-2 transition-colors hover:bg-paper-2 hover:text-pine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
          >
            <Pencil aria-hidden className="size-4" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`More actions for ${product.productName}`}
                className="flex size-10 items-center justify-center rounded-control text-ink-2 transition-colors hover:bg-paper-2 hover:text-pine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
              >
                <MoreHorizontal aria-hidden className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => onEdit(product)}>
                <Pencil aria-hidden className="size-4" />
                Edit product
              </DropdownMenuItem>
              <DropdownMenuItem destructive onSelect={() => onDelete(product)}>
                <Trash2 aria-hidden className="size-4" />
                Delete product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </article>
  );
}
