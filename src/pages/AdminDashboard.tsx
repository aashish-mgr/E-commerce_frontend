import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { authAPI } from "../api";
import AdminDashboardHome from "../Components/admin/AdminDashboardHome";
import AdminUsers from "../Components/admin/AdminUsers";
import AdminProducts from "../Components/admin/AdminProducts";
import AdminOrders from "../Components/admin/AdminOrders";
import AdminCategories from "../Components/admin/AdminCategories";
import type { AdminStats, AdminUser, AdminProduct, AdminOrder } from "../Components/admin/types";
import type { Category } from "../types";
import { toast } from "../lib/toast";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import type { PaginationMeta } from "../types";

type Tab = "overview" | "users" | "products" | "orders" | "categories";

export default function AdminDashboard() {
  const user = useSelector((state: any) => state.auth.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("tab");
  const initialTab: Tab = ["users", "products", "orders", "categories"].includes(requested ?? "")
    ? (requested as Tab)
    : "overview";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<AdminStats | null>(null);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [usersPagination, setUsersPagination] = useState<PaginationMeta | null>(null);
  const debouncedUserSearch = useDebouncedValue(userSearch);

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [productPage, setProductPage] = useState(1);
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [productsPagination, setProductsPagination] = useState<PaginationMeta | null>(null);
  const debouncedProductSearch = useDebouncedValue(productSearch);

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [orderPage, setOrderPage] = useState(1);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [ordersPagination, setOrdersPagination] = useState<PaginationMeta | null>(null);
  const debouncedOrderSearch = useDebouncedValue(orderSearch);

  const [categories, setCategories] = useState<Category[]>([]);

  const changeTab = (next: Tab) => {
    setTab(next);
    setSearchParams(next === "overview" ? {} : { tab: next }, { replace: true });
  };

  const fetchStats = useCallback(async () => {
    try {
      const response = await authAPI.get("/admin/stats");
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await authAPI.get("/category/getAll");
      setCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const params: Record<string, string | number> = { page: userPage, limit: 8 };
      if (userRoleFilter !== "all") params.role = userRoleFilter;
      if (debouncedUserSearch) params.search = debouncedUserSearch;
      const response = await authAPI.get("/admin/users", { params });
      setUsers(response.data.data);
      setUsersPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [userPage, userRoleFilter, debouncedUserSearch]);

  const fetchProducts = useCallback(async () => {
    try {
      const params: Record<string, string | number> = { page: productPage, limit: 8 };
      if (debouncedProductSearch) params.search = debouncedProductSearch;
      const category = categories.find((c) => c.categoryName === selectedCategory);
      if (category) params.categoryId = category.id;
      const response = await authAPI.get("/admin/products", { params });
      setProducts(response.data.data);
      setProductsPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, [productPage, debouncedProductSearch, selectedCategory, categories]);

  const fetchOrders = useCallback(async () => {
    try {
      const params: Record<string, string | number> = { page: orderPage, limit: 8 };
      if (orderStatusFilter !== "all") params.status = orderStatusFilter;
      if (debouncedOrderSearch) params.search = debouncedOrderSearch;
      const response = await authAPI.get("/admin/orders", { params });
      setOrders(response.data.data);
      setOrdersPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }, [orderPage, orderStatusFilter, debouncedOrderSearch]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchCategories()]);
      setLoading(false);
    };
    init();
  }, [fetchStats, fetchCategories]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUserSearchChange = useCallback((value: string) => {
    setUserSearch(value);
    setUserPage(1);
  }, []);

  const handleUserRoleFilterChange = useCallback((value: string) => {
    setUserRoleFilter(value);
    setUserPage(1);
  }, []);

  const handleProductSearchChange = useCallback((value: string) => {
    setProductSearch(value);
    setProductPage(1);
  }, []);

  const handleProductCategoryChange = useCallback((value: string) => {
    setSelectedCategory(value);
    setProductPage(1);
  }, []);

  const handleOrderSearchChange = useCallback((value: string) => {
    setOrderSearch(value);
    setOrderPage(1);
  }, []);

  const handleOrderStatusFilterChange = useCallback((value: string) => {
    setOrderStatusFilter(value);
    setOrderPage(1);
  }, []);

  const handleUpdateUserRole = async (userId: string, userRole: string) => {
    try {
      await toast.promise(
        authAPI.patch(`/admin/users/${userId}/role`, { userRole }),
        {
          loading: "Updating role...",
          success: "Role updated",
          error: "Failed to update role",
        }
      ).unwrap();
      await Promise.all([fetchUsers(), fetchStats()]);
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    toast.confirm(`Delete user "${userName}"? This removes their cart and account.`, {
      label: "Delete",
      onClick: async () => {
        try {
          await toast.promise(
            authAPI.delete(`/admin/users/${userId}`),
            {
              loading: "Deleting user...",
              success: "User deleted",
              error: "Failed to delete user",
            }
          ).unwrap();
          await Promise.all([fetchUsers(), fetchStats()]);
        } catch (error) {
          console.error("Error deleting user:", error);
        }
      },
    });
  };

  const handleUpdateProductStock = async (productId: string, stock: number) => {
    try {
      await toast.promise(
        authAPI.patch(`/admin/products/${productId}`, { stock }),
        {
          loading: "Updating stock...",
          success: "Stock updated successfully",
          error: "Failed to update stock",
        }
      ).unwrap();
      await Promise.all([fetchProducts(), fetchStats()]);
    } catch (error) {
      console.error("Error updating product stock:", error);
    }
  };

  const handleDeleteProduct = (product: AdminProduct) => {
    toast.confirm(`Delete "${product.productName}"?`, {
      label: "Delete",
      onClick: async () => {
        try {
          await toast.promise(
            authAPI.delete(`/admin/products/${product.id}`),
            {
              loading: "Deleting product...",
              success: "Product deleted",
              error: "Failed to delete product",
            }
          ).unwrap();
          await Promise.all([fetchProducts(), fetchStats()]);
        } catch (error) {
          console.error("Error deleting product:", error);
        }
      },
    });
  };

  const handleUpdateOrderStatus = async (orderId: string, orderStatus: string) => {
    try {
      await toast.promise(
        authAPI.patch(`/admin/orders/${orderId}/status`, { orderStatus }),
        {
          loading: "Updating order status...",
          success: "Order status updated",
          error: "Failed to update order status",
        }
      ).unwrap();
      await Promise.all([fetchOrders(), fetchStats()]);
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    try {
      await toast.promise(
        authAPI.patch(`/admin/orders/${orderId}/payment`, { paymentStatus }),
        {
          loading: "Updating payment status...",
          success: "Payment status updated",
          error: "Failed to update payment status",
        }
      ).unwrap();
      await Promise.all([fetchOrders(), fetchStats()]);
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  const handleCreateCategory = async (categoryName: string) => {
    await toast.promise(
      authAPI.post("/admin/categories", { categoryName }),
      {
        loading: "Creating category...",
        success: "Category created successfully",
        error: "Failed to create category",
      }
    ).unwrap();
    await Promise.all([fetchCategories(), fetchStats()]);
  };

  const handleRenameCategory = async (categoryId: string, categoryName: string) => {
    await toast.promise(
      authAPI.patch(`/admin/categories/${categoryId}`, { categoryName }),
      {
        loading: "Renaming category...",
        success: "Category updated successfully",
        error: "Failed to update category",
      }
    ).unwrap();
    await Promise.all([fetchCategories(), fetchStats()]);
  };

  const handleDeleteCategory = (category: Category) => {
    toast.confirm(`Delete category "${category.categoryName}"?`, {
      label: "Delete",
      onClick: async () => {
        try {
          await toast.promise(
            authAPI.delete(`/admin/categories/${category.id}`),
            {
              loading: "Deleting category...",
              success: "Category deleted",
              error: "Failed to delete category",
            }
          ).unwrap();
          await Promise.all([fetchCategories(), fetchStats()]);
          if (selectedCategory === category.categoryName) setSelectedCategory("All");
        } catch (error) {
          console.error("Error deleting category:", error);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950 text-white rounded-2xl px-6 sm:px-8 py-6 sm:py-8 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">Admin Dashboard</h1>
              <p className="text-indigo-200 text-sm sm:text-base">
                Welcome back, <span className="text-white font-medium">{user?.userName ?? "Admin"}</span>! Manage the platform from here.
              </p>
            </div>
          </div>

          <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm w-fit max-w-full overflow-x-auto">
            {(["overview", "users", "products", "orders", "categories"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => changeTab(t)}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all duration-200 whitespace-nowrap ${
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

        {tab === "overview" && stats && (
          <AdminDashboardHome
            stats={stats}
            onViewUsers={() => changeTab("users")}
            onViewProducts={() => changeTab("products")}
            onViewOrders={() => changeTab("orders")}
          />
        )}

        {tab === "users" && (
          <AdminUsers
            users={users}
            pagination={usersPagination}
            search={userSearch}
            roleFilter={userRoleFilter}
            currentAdminId={user?.id}
            onSearchChange={handleUserSearchChange}
            onRoleFilterChange={handleUserRoleFilterChange}
            onPageChange={setUserPage}
            onRoleChange={handleUpdateUserRole}
            onDelete={handleDeleteUser}
          />
        )}

        {tab === "products" && (
          <AdminProducts
            products={products}
            categories={["All", ...categories.map((c) => c.categoryName)]}
            pagination={productsPagination}
            search={productSearch}
            selectedCategory={selectedCategory}
            onSearchChange={handleProductSearchChange}
            onCategoryChange={handleProductCategoryChange}
            onPageChange={setProductPage}
            onUpdateStock={handleUpdateProductStock}
            onDelete={handleDeleteProduct}
          />
        )}

        {tab === "orders" && (
          <AdminOrders
            orders={orders}
            pagination={ordersPagination}
            search={orderSearch}
            statusFilter={orderStatusFilter}
            onSearchChange={handleOrderSearchChange}
            onStatusFilterChange={handleOrderStatusFilterChange}
            onPageChange={setOrderPage}
            onUpdateStatus={handleUpdateOrderStatus}
            onUpdatePayment={handleUpdatePaymentStatus}
          />
        )}

        {tab === "categories" && (
          <AdminCategories
            categories={categories}
            statsCategoryCount={String(stats?.totalCategories ?? categories.length)}
            onChangeCategory={handleCreateCategory}
            onRenameCategory={handleRenameCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}
      </main>
    </div>
  );
}