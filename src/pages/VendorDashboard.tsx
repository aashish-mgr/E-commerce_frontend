import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { authAPI, getImageUrl } from "../api";

interface Category {
  id: string;
  categoryName: string;
}

interface VendorProduct {
  id: string;
  productName: string;
  productDescription: string;
  productPrice: string;
  image: string;
  categoryId: string;
  Category?: Category;
}

interface VendorOrderDetail {
  id: string;
  quantity: number;
  Product: {
    id: string;
    productName: string;
    productPrice: string;
    image: string;
  };
  Order: {
    id: string;
    shippingAddress: string;
    phoneNumber: string;
    totalAmount: number;
    orderStatus: string;
    userId: string;
    Payment?: {
      id: string;
      paymentMethod: string;
      paymentStatus: string;
    };
  };
}

type Tab = "overview" | "products" | "orders";

const emptyProductForm = {
  productName: "",
  productDescription: "",
  productPrice: "",
  categoryId: "",
};

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const paymentStyles: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  unpaid: "bg-gray-100 text-gray-600",
};

export default function VendorDashboard() {
  const userRole = useSelector((state: any) => state.auth.user?.userRole);
  const [tab, setTab] = useState<Tab>("overview");
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orderDetails, setOrderDetails] = useState<VendorOrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Product modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<VendorProduct | null>(null);
  const [form, setForm] = useState(emptyProductForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await authAPI.get("/product/getMyProducts");
      setProducts(response.data.data);
    } catch (error) {
      console.error("Error fetching my products:", error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await authAPI.get("/category/findAll");
      setCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await authAPI.get("/order/getVendorOrders");
      setOrderDetails(response.data.data);
    } catch (error) {
      console.error("Error fetching vendor orders:", error);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchProducts(), fetchCategories(), fetchOrders()]);
    setLoading(false);
  }, [fetchProducts, fetchCategories, fetchOrders]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const stats = useMemo(() => {
    const uniqueOrders = new Set(orderDetails.map((od) => od.Order.id));
    const revenue = orderDetails.reduce(
      (sum, od) => sum + Number(od.Product.productPrice) * od.quantity,
      0,
    );
    const pending = orderDetails.filter(
      (od) => od.Order.orderStatus === "pending",
    ).length;
    return {
      productCount: products.length,
      orderCount: uniqueOrders.size,
      revenue,
      pendingCount: pending,
    };
  }, [products, orderDetails]);

  const openAddProduct = () => {
    setEditingProduct(null);
    setForm(emptyProductForm);
    setImageFile(null);
    setShowProductModal(true);
  };

  const openEditProduct = (product: VendorProduct) => {
    setEditingProduct(product);
    setForm({
      productName: product.productName,
      productDescription: product.productDescription,
      productPrice: product.productPrice,
      categoryId: product.categoryId,
    });
    setImageFile(null);
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    setImageFile(null);
    setForm(emptyProductForm);
  };

  const handleSaveProduct = async () => {
    if (
      !form.productName ||
      !form.productDescription ||
      !form.productPrice ||
      !form.categoryId
    ) {
      showToast("Please fill all the fields");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("productName", form.productName);
      formData.append("productDescription", form.productDescription);
      formData.append("productPrice", form.productPrice);
      formData.append("categoryId", form.categoryId);
      if (imageFile) formData.append("image", imageFile);

      if (editingProduct) {
        await authAPI.patch(`/product/update/${editingProduct.id}`, formData);
        showToast("Product updated successfully");
      } else {
        await authAPI.post("/product/create", formData);
        showToast("Product added successfully");
      }
      closeProductModal();
      await fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      showToast("Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (product: VendorProduct) => {
    if (!window.confirm(`Delete "${product.productName}"?`)) return;
    try {
      await authAPI.delete(`/product/delete/${product.id}`);
      showToast("Product deleted successfully");
      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      showToast("Failed to delete product");
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, orderStatus: string) => {
    try {
      await authAPI.patch(`/order/updateOrderStatus/${orderId}`, { orderStatus });
      showToast("Order status updated");
      await fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      showToast("Failed to update order status");
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    try {
      await authAPI.patch(`/order/updatePaymentStatus/${orderId}`, { paymentStatus });
      showToast("Payment status updated");
      await fetchOrders();
    } catch (error) {
      console.error("Error updating payment status:", error);
      showToast("Failed to update payment status");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await authAPI.delete(`/order/deleteOrder/${orderId}`);
      showToast("Order deleted");
      await fetchOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
      showToast("Failed to delete order");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gray-900 text-white rounded-2xl px-6 py-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold mb-0.5">Vendor Dashboard</h1>
            <p className="text-sm text-gray-300 capitalize">
              Welcome back, {userRole ?? "vendor"}! Manage your store from here.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-xl shadow-sm w-fit">
          {(["overview", "products", "orders"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
                tab === t
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <Overview
            stats={stats}
            productCount={products.length}
            recentCount={orderDetails.length}
          />
        )}

        {tab === "products" && (
          <ProductsTab
            products={products}
            onAdd={openAddProduct}
            onEdit={openEditProduct}
            onDelete={handleDeleteProduct}
          />
        )}

        {tab === "orders" && (
          <OrdersTab
            orderDetails={orderDetails}
            onUpdateStatus={handleUpdateOrderStatus}
            onUpdatePayment={handleUpdatePaymentStatus}
            onDelete={handleDeleteOrder}
          />
        )}
      </main>

      {/* Product modal */}
      {showProductModal && (
        <ProductModal
          categories={categories}
          form={form}
          editingProduct={editingProduct}
          imageFile={imageFile}
          saving={saving}
          onFormChange={setForm}
          onImageChange={setImageFile}
          onSave={handleSaveProduct}
          onClose={closeProductModal}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}

// ── Overview ─────────────────────────────────────────────────
function Overview({
  stats,
  productCount,
  recentCount,
}: {
  stats: { productCount: number; orderCount: number; revenue: number; pendingCount: number };
  productCount: number;
  recentCount: number;
}) {
  const cards = [
    {
      label: "My Products",
      value: stats.productCount,
      icon: (
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      ),
    },
    {
      label: "Orders",
      value: stats.orderCount,
      icon: (
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      ),
    },
    {
      label: "Revenue (NPR)",
      value: stats.revenue.toFixed(2),
      icon: (
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      ),
    },
    {
      label: "Pending Orders",
      value: stats.pendingCount,
      icon: (
        <path d="M12 6v6h4" />
      ),
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  {card.icon}
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className="text-xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm text-sm text-gray-600">
        <p>
          You currently have <strong>{productCount}</strong> products listed and{" "}
          <strong>{recentCount}</strong> order item(s) across your store. Keep an
          eye on the Orders tab to fulfill pending orders.
        </p>
      </div>
    </div>
  );
}

// ── Products tab ─────────────────────────────────────────────
function ProductsTab({
  products,
  onAdd,
  onEdit,
  onDelete,
}: {
  products: VendorProduct[];
  onAdd: () => void;
  onEdit: (p: VendorProduct) => void;
  onDelete: (p: VendorProduct) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">My Products</h2>
        <button
          onClick={onAdd}
          className="bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          + Add Product
        </button>
      </div>
      {products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium text-gray-500">No products yet</p>
          <p className="text-sm mt-1">Click "Add Product" to list your first item</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.productName}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{product.productName}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {product.productDescription}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {product.Category?.categoryName ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-gray-900 font-medium">
                    Rs. {Number(product.productPrice).toFixed(2)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(product)}
                        className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(product)}
                        className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Orders tab ───────────────────────────────────────────────
function OrdersTab({
  orderDetails,
  onUpdateStatus,
  onUpdatePayment,
  onDelete,
}: {
  orderDetails: VendorOrderDetail[];
  onUpdateStatus: (orderId: string, status: string) => void;
  onUpdatePayment: (orderId: string, status: string) => void;
  onDelete: (orderId: string) => void;
}) {
  const statuses = ["pending", "shipped", "delivered", "cancelled"];

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Store Orders</h2>
      </div>
      {orderDetails.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium text-gray-500">No orders yet</p>
          <p className="text-sm mt-1">Orders for your products will show up here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Qty</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.map((od) => {
                const order = od.Order;
                const payment = order.Payment;
                return (
                  <tr key={od.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {od.Product.image ? (
                          <img
                            src={getImageUrl(od.Product.image)}
                            alt={od.Product.productName}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100" />
                        )}
                        <p className="font-medium text-gray-900">
                          {od.Product.productName}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{od.quantity}</td>
                    <td className="px-5 py-3">
                      <p className="text-gray-900">{order.phoneNumber}</p>
                      <p className="text-xs text-gray-500 max-w-[180px] line-clamp-1">
                        {order.shippingAddress}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-gray-900 font-medium">
                      Rs. {Number(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[order.orderStatus] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${paymentStyles[payment?.paymentStatus ?? "unpaid"] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {payment?.paymentStatus ?? "unpaid"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2 items-center">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-indigo-500"
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() =>
                            onUpdatePayment(
                              order.id,
                              payment?.paymentStatus === "paid" ? "unpaid" : "paid",
                            )
                          }
                          className="text-indigo-600 hover:bg-indigo-50 px-2 py-1.5 rounded-lg transition-colors text-xs"
                        >
                          {payment?.paymentStatus === "paid" ? "Mark unpaid" : "Mark paid"}
                        </button>
                        <button
                          onClick={() => onDelete(order.id)}
                          className="text-red-500 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-colors text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Product modal ────────────────────────────────────────────
function ProductModal({
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
  form: typeof emptyProductForm;
  editingProduct: VendorProduct | null;
  imageFile: File | null;
  saving: boolean;
  onFormChange: (f: typeof emptyProductForm) => void;
  onImageChange: (f: File | null) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const uploadFile = () => {
    const element = document.createElement("input");
    element.type = "file";
    element.accept = "image/*";
    element.onchange = () => {
      if (element.files && element.files[0]) {
        onImageChange(element.files[0]);
      }
    };
    element.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md p-7 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            {editingProduct ? "Edit Product" : "Add Product"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Product name"
            value={form.productName}
            onChange={(e) => onFormChange({ ...form, productName: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
          />
          <textarea
            placeholder="Description"
            value={form.productDescription}
            onChange={(e) =>
              onFormChange({ ...form, productDescription: e.target.value })
            }
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 resize-none"
          />
          <input
            type="number"
            placeholder="Price (NPR)"
            value={form.productPrice}
            onChange={(e) => onFormChange({ ...form, productPrice: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
          />
          <select
            value={form.categoryId}
            onChange={(e) => onFormChange({ ...form, categoryId: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.categoryName}
              </option>
            ))}
          </select>

          {!editingProduct && (
            <div>
              <button
                type="button"
                onClick={uploadFile}
                className="w-full border border-dashed border-gray-300 rounded-lg py-3 text-sm text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
              >
                {imageFile ? `Selected: ${imageFile.name}` : "Upload product image"}
              </button>
              {editingProduct && imageFile && (
                <p className="text-xs text-gray-500 mt-1">
                  Image changes are not supported on edit.
                </p>
              )}
            </div>
          )}

          <button
            onClick={onSave}
            disabled={saving}
            className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-700 transition-colors mt-2 disabled:opacity-50"
          >
            {saving ? "Saving..." : editingProduct ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}