import { useState } from "react";
import type { Category, ProductForm, VendorProduct } from "./types";

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    }
  };

  const existingImageUrl = editingProduct?.image ?? null;
  const showImage = previewUrl || existingImageUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {editingProduct ? "Update your product details" : "Fill in the details to list a new product"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="14" y1="4" x2="4" y2="14" />
              <line x1="4" y1="4" x2="14" y2="14" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Image
            </label>
            {showImage && !imageFile ? (
              <div className="relative rounded-xl overflow-hidden bg-gray-50 border border-gray-200">
                <img
                  src={showImage}
                  alt="Product"
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={uploadFile}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                >
                  <span className="bg-white text-gray-900 text-sm font-semibold px-4 py-2 rounded-lg">
                    Change Image
                  </span>
                </button>
              </div>
            ) : imageFile && previewUrl ? (
              <div className="relative rounded-xl overflow-hidden bg-gray-50 border border-gray-200">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => {
                    onImageChange(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-lg flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={uploadFile}
                className={`border-2 border-dashed rounded-xl py-8 text-center cursor-pointer transition-all duration-200 ${
                  dragOver
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-400">
                      <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 5MB</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Product Name
            </label>
            <input
              type="text"
              placeholder="e.g. Organic Green Tea"
              value={form.productName}
              onChange={(e) => onFormChange({ ...form, productName: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              placeholder="Describe your product..."
              value={form.productDescription}
              onChange={(e) =>
                onFormChange({ ...form, productDescription: e.target.value })
              }
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
            />
          </div>

          {/* Price, Stock & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Price (NPR)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                  Rs.
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={form.productPrice}
                  onChange={(e) => onFormChange({ ...form, productPrice: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Stock (units)
              </label>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={form.stock}
                onChange={(e) => onFormChange({ ...form, stock: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Category
              </label>
              <select
                value={form.categoryId}
                onChange={(e) => onFormChange({ ...form, categoryId: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 bg-gray-900 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : editingProduct ? (
              "Save Changes"
            ) : (
              "Add Product"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}