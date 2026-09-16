import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { authAPI } from "../api";
import VendorDashboardHome from "../Components/vendor/VendorDashboardHome";
import VendorProducts from "../Components/vendor/VendorProducts";
import VendorOrders from "../Components/vendor/VendorOrders";
import VendorProductModal from "../Components/vendor/VendorProductModal";
import { emptyProductForm } from "../Components/vendor/types";
import type { Category, VendorOrderDetail, VendorProduct, ProductForm } from "../Components/vendor/types";
import { toast } from "../lib/toast";

type Tab = "overview" | "products" | "orders";

export default function VendorDashboard() {
  const user = useSelector((state: any) => state.auth.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab: Tab =
    searchParams.get("tab") === "products" || searchParams.get("tab") === "orders"
      ? (searchParams.get("tab") as Tab)
      : "overview";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orderDetails, setOrderDetails] = useState<VendorOrderDetail[]>([]);
  const [loading, setLoading] = useState(true);

  // Product modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<VendorProduct | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyProductForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const changeTab = (next: Tab) => {
    setTab(next);
    setSearchParams(next === "overview" ? {} : { tab: next }, { replace: true });
  };

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
      stock: product.stock ?? 0,
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
      !form.categoryId ||
      form.stock < 0
    ) {
      toast.info("Please fill all the fields");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("productName", form.productName);
      formData.append("productDescription", form.productDescription);
      formData.append("productPrice", form.productPrice);
      formData.append("categoryId", form.categoryId);
      formData.append("stock", String(form.stock));
      if (imageFile) formData.append("image", imageFile);

      await toast.promise(
        editingProduct
          ? authAPI.patch(`/product/update/${editingProduct.id}`, formData)
          : authAPI.post("/product/create", formData),
        {
          loading: editingProduct ? "Updating product..." : "Adding product...",
          success: editingProduct ? "Product updated successfully" : "Product added successfully",
          error: "Failed to save product",
        }
      ).unwrap();
      closeProductModal();
      await fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = (product: VendorProduct) => {
    toast.confirm(`Delete "${product.productName}"?`, {
      label: "Delete",
      onClick: async () => {
          try {
            await toast.promise(
              authAPI.delete(`/product/delete/${product.id}`),
              {
                loading: "Deleting product...",
                success: "Product deleted successfully",
                error: "Failed to delete product",
              }
            ).unwrap();
            await fetchProducts();
          } catch (error) {
            console.error("Error deleting product:", error);
          }
    },
    });
  };

  const handleUpdateOrderStatus = async (orderId: string, orderStatus: string) => {
    try {
      await toast.promise(
        authAPI.patch(`/order/updateOrderStatus/${orderId}`, { orderStatus }),
        {
          loading: "Updating order status...",
          success: "Order status updated",
          error: "Failed to update order status",
        }
      ).unwrap();
      await fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    try {
      await toast.promise(
        authAPI.patch(`/order/updatePaymentStatus/${orderId}`, { paymentStatus }),
        {
          loading: "Updating payment status...",
          success: "Payment status updated",
          error: "Failed to update payment status",
        }
      ).unwrap();
      await fetchOrders();
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    toast.confirm("Delete this order?", {
      label: "Delete",
      onClick: async () => {
          try {
            await toast.promise(
              authAPI.delete(`/order/deleteOrder/${orderId}`),
              {
                loading: "Deleting order...",
                success: "Order deleted",
                error: "Failed to delete order",
              }
            ).unwrap();
            await fetchOrders();
          } catch (error) {
            console.error("Error deleting order:", error);
          }
    },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white rounded-2xl px-6 sm:px-8 py-6 sm:py-8 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                Vendor Dashboard
              </h1>
              <p className="text-gray-300 text-sm sm:text-base">
                Welcome back, <span className="text-white font-medium">{user?.userName ?? "Vendor"}</span>! Manage your store from here.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm w-fit">
            {(["overview", "products", "orders"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => changeTab(t)}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
                  tab === t
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {tab === "overview" && (
        <VendorDashboardHome
          products={products}
          orderDetails={orderDetails}
          onAddProduct={openAddProduct}
          onViewAllOrders={() => changeTab("orders")}
          onViewProducts={() => changeTab("products")}
        />
      )}

        {tab === "products" && (
          <VendorProducts
            products={products}
            onAdd={openAddProduct}
            onEdit={openEditProduct}
            onDelete={handleDeleteProduct}
          />
        )}

        {tab === "orders" && (
          <VendorOrders
            orderDetails={orderDetails}
            onUpdateStatus={handleUpdateOrderStatus}
            onUpdatePayment={handleUpdatePaymentStatus}
            onDelete={handleDeleteOrder}
          />
        )}
      </main>

      {/* Product modal */}
      {showProductModal && (
        <VendorProductModal
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
    </div>
  );
}