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
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import type { PaginationMeta } from "../types";
import { Container } from "../Components/ui/Container";
import { Skeleton } from "../Components/ui/Skeleton";
import { cn } from "../lib/cn";

type Tab = "overview" | "products" | "orders";

const TABS: { value: Tab; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "products", label: "Products" },
  { value: "orders", label: "Orders" },
];


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

  // Overview data (unpaginated, for dashboard metrics)
  const [allProducts, setAllProducts] = useState<VendorProduct[]>([]);
  const [allOrderDetails, setAllOrderDetails] = useState<VendorOrderDetail[]>([]);

  // Product listing state
  const [productPage, setProductPage] = useState(1);
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("All");
  const [productsPagination, setProductsPagination] = useState<PaginationMeta | null>(null);
  const debouncedProductSearch = useDebouncedValue(productSearch);

  // Order listing state
  const [orderPage, setOrderPage] = useState(1);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [ordersPagination, setOrdersPagination] = useState<PaginationMeta | null>(null);
  const debouncedOrderSearch = useDebouncedValue(orderSearch);

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
      const params: Record<string, string | number> = { page: productPage, limit: 8 };
      if (debouncedProductSearch) params.search = debouncedProductSearch;
      const category = categories.find((c) => c.categoryName === productCategory);
      if (category) params.categoryId = category.id;
      const response = await authAPI.get("/product/getMyProducts", { params });
      setProducts(response.data.data);
      setProductsPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching my products:", error);
    }
  }, [productPage, debouncedProductSearch, productCategory, categories]);

  const fetchOverviewProducts = useCallback(async () => {
    try {
      const response = await authAPI.get("/product/getMyProducts", {
        params: { limit: 100 },
      });
      setAllProducts(response.data.data);
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
      const params: Record<string, string | number> = { page: orderPage, limit: 8 };
      if (orderStatusFilter !== "all") params.status = orderStatusFilter;
      if (debouncedOrderSearch) params.search = debouncedOrderSearch;
      const response = await authAPI.get("/order/getVendorOrders", { params });
      setOrderDetails(response.data.data);
      setOrdersPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching vendor orders:", error);
    }
  }, [orderPage, orderStatusFilter, debouncedOrderSearch]);

  const fetchOverviewOrders = useCallback(async () => {
    try {
      const response = await authAPI.get("/order/getVendorOrders", {
        params: { limit: 100 },
      });
      setAllOrderDetails(response.data.data);
    } catch (error) {
      console.error("Error fetching vendor orders:", error);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchCategories(),
      fetchOverviewProducts(),
      fetchOverviewOrders(),
    ]);
    setLoading(false);
  }, [fetchCategories, fetchOverviewProducts, fetchOverviewOrders]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleProductSearchChange = useCallback((value: string) => {
    setProductSearch(value);
    setProductPage(1);
  }, []);

  const handleProductCategoryChange = useCallback((value: string) => {
    setProductCategory(value);
    setProductPage(1);
  }, []);

  const handleOrderSearchChange = useCallback((value: string) => {
    setOrderSearch(value);
    setOrderPage(1);
  }, []);

  const handleOrderStatusChange = useCallback((value: string) => {
    setOrderStatusFilter(value);
    setOrderPage(1);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
      await Promise.all([fetchProducts(), fetchOverviewProducts()]);
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
            await Promise.all([fetchProducts(), fetchOverviewProducts()]);
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
      await Promise.all([fetchOrders(), fetchOverviewOrders()]);
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
      await Promise.all([fetchOrders(), fetchOverviewOrders()]);
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
            await Promise.all([fetchOrders(), fetchOverviewOrders()]);
          } catch (error) {
            console.error("Error deleting order:", error);
          }
    },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <Container width="dashboard" className="py-8">
          <div className="rounded-panel bg-pine px-6 py-8 sm:px-8">
            <Skeleton className="h-7 w-64 bg-pine-soft/40" />
            <Skeleton className="mt-3 h-4 w-80 bg-pine-soft/25" />
          </div>
          <div className="mt-6 flex gap-2">
            {TABS.map((t) => (
              <Skeleton key={t.value} className="h-11 w-24" />
            ))}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-panel" />
            ))}
          </div>
          <Skeleton className="mt-6 h-64 rounded-panel" />
        </Container>
      </div>
    );
  }

return (
    <div className="min-h-screen bg-paper">
      <Container width="dashboard" className="py-8">
        <header className="rounded-panel bg-pine px-6 py-7 text-paper sm:px-8 sm:py-8">
          <span aria-hidden className="mb-4 block h-1 w-12 rounded-full bg-marigold" />
          <h1 className="font-display text-2xl font-semibold sm:text-[28px]">
            Vendor dashboard
          </h1>
          <p className="mt-1 max-w-prose text-sm text-pine-soft">
            Welcome back,{" "}
            <span className="font-medium text-paper">{user?.userName ?? "Vendor"}</span>.
            Manage your store from here.
          </p>
        </header>

        <div
          role="tablist"
          aria-label="Vendor sections"
          className="mt-6 flex gap-2 overflow-x-auto pb-1"
        >
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={tab === t.value}
              onClick={() => changeTab(t.value)}
              className={cn(
                "h-11 shrink-0 rounded-control px-4 text-sm font-medium transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine",
                tab === t.value
                  ? "bg-pine text-paper"
                  : "border border-line bg-surface text-ink-2 hover:border-pine hover:text-pine",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="pb-16 pt-6">
          {tab === "overview" && (
            <VendorDashboardHome
              products={allProducts}
              orderDetails={allOrderDetails}
              onAddProduct={openAddProduct}
              onViewAllOrders={() => changeTab("orders")}
              onViewProducts={() => changeTab("products")}
            />
          )}


        {tab === "products" && (
          <VendorProducts
            products={products}
            pagination={productsPagination}
            categories={["All", ...categories.map((c) => c.categoryName)]}
            search={productSearch}
            selectedCategory={productCategory}
            onSearchChange={handleProductSearchChange}
            onCategoryChange={handleProductCategoryChange}
            onPageChange={setProductPage}
            onAdd={openAddProduct}
            onEdit={openEditProduct}
            onDelete={handleDeleteProduct}
          />
        )}

        {tab === "orders" && (
          <VendorOrders
            orderDetails={orderDetails}
            pagination={ordersPagination}
            orderSearch={orderSearch}
            orderStatusFilter={orderStatusFilter}
            onSearchChange={handleOrderSearchChange}
            onStatusChange={handleOrderStatusChange}
            onPageChange={setOrderPage}
            onUpdateStatus={handleUpdateOrderStatus}
            onUpdatePayment={handleUpdatePaymentStatus}
            onDelete={handleDeleteOrder}
          />
        )}
      </div>
      </Container>

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