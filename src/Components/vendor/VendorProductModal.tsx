import { useState } from "react";
import { ImageUp, X } from "lucide-react";
import type { Category, ProductForm, VendorProduct } from "./types";
import { Button } from "../ui/Button";
import { Dialog, DialogContent } from "../ui/Dialog";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { cn } from "../../lib/cn";

export default function VendorProductModal({
  categories,
  form,
  editingProduct,
  imageFile,
  saving,
  onFormChange,
  onImageChange,
  onSave,
  onClose,
}: {
  categories: Category[];
  form: ProductForm;
  editingProduct: VendorProduct | null;
  imageFile: File | null;
  saving: boolean;
  onFormChange: (f: ProductForm) => void;
  onImageChange: (f: File | null) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFile = (file: File) => {
    onImageChange(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const uploadFile = () => {
    const element = document.createElement("input");
    element.type = "file";
    element.accept = "image/jpeg,image/png,image/webp";
    element.onchange = () => {
      if (element.files && element.files[0]) {
        handleFile(element.files[0]);
      }
    };
    element.click();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    }
  };

  const existingImageUrl = editingProduct?.image ?? null;
  const showImage = previewUrl || existingImageUrl;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        title={editingProduct ? "Edit product" : "Add new product"}
        description={
          editingProduct
            ? "Update the details for this listing."
            : "Fill in the details to list a new product."
        }
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
          className="space-y-4 p-5"
        >
          <div>
            <p className="mb-1.5 text-sm font-medium text-ink-2">Product image</p>
            {showImage && !imageFile ? (
              <div className="relative overflow-hidden rounded-control border border-line bg-paper-2">
                <img
                  src={showImage}
                  alt="Product"
                  className="h-48 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={uploadFile}
                  className="absolute inset-0 flex items-center justify-center bg-ink/40 text-sm font-semibold text-paper transition-colors hover:bg-ink/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marigold"
                >
                  Change image
                </button>
              </div>
            ) : imageFile && previewUrl ? (
              <div className="relative overflow-hidden rounded-control border border-line bg-paper-2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-48 w-full object-cover"
                />
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => {
                    onImageChange(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-control bg-ink/60 text-paper transition-colors hover:bg-ink/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marigold"
                >
                  <X aria-hidden className="size-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={uploadFile}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={cn(
                  "flex w-full flex-col items-center gap-2 rounded-control border-2 border-dashed py-8 text-center transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine",
                  dragOver
                    ? "border-pine bg-pine-soft"
                    : "border-line bg-paper-2/40 hover:border-pine/50",
                )}
              >
                <span className="flex size-10 items-center justify-center rounded-control bg-surface text-pine">
                  <ImageUp aria-hidden className="size-5" />
                </span>
                <span className="text-sm text-ink-2">
                  <span className="font-medium text-pine">Click to upload</span> or drag
                  and drop
                </span>
                <span className="text-xs text-muted">PNG, JPG or WebP</span>
              </button>
            )}
          </div>

          <Field label="Product name" required>
            <Input
              value={form.productName}
              placeholder="For example Organic Green Tea"
              onChange={(event) =>
                onFormChange({ ...form, productName: event.target.value })
              }
            />
          </Field>

          <Field label="Description" required>
            <Textarea
              rows={3}
              value={form.productDescription}
              placeholder="Describe your product"
              onChange={(event) =>
                onFormChange({ ...form, productDescription: event.target.value })
              }
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Price" required>
              <Input
                type="number"
                addon="Rs."
                placeholder="0.00"
                value={form.productPrice}
                onChange={(event) =>
                  onFormChange({ ...form, productPrice: event.target.value })
                }
              />
            </Field>

            <Field label="Stock" hint="Whole units on hand" required>
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={form.stock}
                onChange={(event) =>
                  onFormChange({
                    ...form,
                    stock: Math.max(0, Math.floor(Number(event.target.value) || 0)),
                  })
                }
              />
            </Field>
          </div>

          <Field label="Category" required>
            <Select
              value={form.categoryId}
              placeholder="Select a category"
              ariaLabel="Category"
              onValueChange={(value) => onFormChange({ ...form, categoryId: value })}
              options={categories.map((category) => ({
                value: category.id,
                label: category.categoryName,
              }))}
            />
          </Field>

          <div className="flex gap-3 border-t border-line pt-4">
            <Button variant="ghost" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              loading={saving}
              loadingLabel="Saving…"
              disabled={saving}
            >
              {editingProduct ? "Save changes" : "Add product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
