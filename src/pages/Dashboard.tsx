import { useCallback, useEffect, useMemo, useState } from "react";
import { PackageSearch, ReceiptText, ShoppingBag } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import { useNavigate } from "react-router-dom";
import ProductCard from "../Components/ProductCard";
import FilterBar from "../Components/FilterBar";
import Footer from "../Components/Footer";
import AuthModal from "../Components/AuthModal";
import Pagination from "../Components/Pagination";
import type { Cart, Product, User, Category, PaginationMeta } from "../types";
import { API, authAPI } from "../api/index";
import { getCartItems } from "../store/cartSlice";
import { useNavbar } from "../context/NavbarContext";
import { toast, showErrorToast } from "../lib/toast";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { Container } from "../Components/ui/Container";
import { Button } from "../Components/ui/Button";
import { EmptyState } from "../Components/ui/EmptyState";
import { ProductCardSkeleton } from "../Components/ui/Skeleton";

type RootState = {
  auth: { isAuthenticated: boolean; user: User | null };
  cart: { cart: Cart[] | null };
};

type AppDispatch = ThunkDispatch<RootState, unknown, UnknownAction>;

// ── Dashboard ─────────────────────────────────────────────────
export default function Dashboard() {
  const [authMode, setAuthMode] = useState(""); // "login" | "register" | null
  const [search, setSearch] = useState("");
  const [selectedCategory, setCategory] = useState("All");
  const authState = useSelector(
    (state: { auth: { isAuthenticated: boolean; user: User | null } }) => state.auth
  );
  const cartItems = useSelector((state: { cart: { cart: Cart[] | null } }) => state.cart.cart);
  const dispatch = useDispatch<AppDispatch>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebouncedValue(search);
  const { setNavbarData } = useNavbar();
  const navigate = useNavigate();

  const getProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      const category = categories.find((c) => c.categoryName === selectedCategory);
      if (category) params.categoryId = category.id;

      const response = await API.get("/product/getAll", { params });
      setProducts(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, selectedCategory, categories]);

  const getCategories = useCallback(async () => {
    try {
      const response = await API.get("/category/getAll");
      setCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  const CURRENT_USER: User | null = authState.user ?? null;

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  // Signed-in visitors should see the real cart badge before they add anything.
  useEffect(() => {
    if (authState.isAuthenticated) {
      dispatch(getCartItems());
    }
  }, [authState.isAuthenticated, dispatch]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value);
    setPage(1);
  }, []);

  const CATEGORIES = useMemo(
    () => ["All", ...categories.map((c) => c.categoryName)],
    [categories]
  );

  const openLogin = useCallback(() => setAuthMode("login"), []);
  const openRegister = useCallback(() => setAuthMode("register"), []);
  const closeModal = useCallback(() => setAuthMode(""), []);
  const switchMode = useCallback(
    () => setAuthMode((m) => (m === "login" ? "register" : "login")),
    []
  );

  const cartCount = useMemo(
    () =>
      Array.isArray(cartItems)
        ? cartItems.reduce((sum: number, item: Cart) => sum + item.quantity, 0)
        : 0,
    [cartItems]
  );

  /**
   * Adding a card used to bump a local counter and fire a toast without ever
   * touching the API, so the item never reached the cart page. It now posts the
   * real request, refreshes the shared cart slice for the Navbar badge, and only
   * reports success once the server has accepted it.
   */
  const handleAddToCart = useCallback(
    async (product: Product): Promise<boolean> => {
      if (!authState.isAuthenticated) {
        openLogin();
        return false;
      }
      try {
        await authAPI.post("/cart/addToCart", {
          quantity: 1,
          productId: product.id,
        });
        await dispatch(getCartItems());
        toast.success(`"${product.productName}" added to cart`);
        return true;
      } catch (error) {
        showErrorToast(error, "Failed to add to cart.");
        return false;
      }
    },
    [authState.isAuthenticated, dispatch, openLogin]
  );

  const handleCartClick = useCallback(() => {
    navigate("/cart");
  }, []);

  const handleOrderHistoryClick = useCallback(() => {
    navigate("/orders");
  }, []);

  const navbarData = useMemo(
    () => ({
      user: CURRENT_USER,
      onLogin: openLogin,
      onRegister: openRegister,
    }),
    [CURRENT_USER, openLogin, openRegister]
  );

  useEffect(() => {
    setNavbarData(navbarData);
    return () => setNavbarData({});
  }, [navbarData, setNavbarData]);

  const firstName = CURRENT_USER?.userName?.split(" ")[0];

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Container>
        <div className="sticky top-[var(--nav-h)] z-20 -mx-4 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <FilterBar
            search={search}
            selectedCategory={selectedCategory}
            categories={CATEGORIES}
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        <main className="py-8">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-line pb-6">
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
                {firstName ? `Welcome back, ${firstName}` : "Browse the market"}
              </h1>
              <p className="mt-1 text-sm text-muted">
                {pagination
                  ? `${pagination.total} products from independent sellers`
                  : "Products from independent sellers across Nepal"}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button variant="ghost" onClick={handleOrderHistoryClick}>
                <ReceiptText aria-hidden className="size-4" />
                Orders
              </Button>
              <Button variant="outline" onClick={handleCartClick}>
                <ShoppingBag aria-hidden className="size-4" />
                Cart
                {cartCount > 0 && (
                  <span className="rounded-full bg-pine-soft px-1.5 py-0.5 font-display text-xs font-semibold tabular-nums text-pine">
                    {cartCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-8 pt-8 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-x-5 gap-y-8 pt-8 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product: Product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
              {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
            </>
          ) : (
            <EmptyState
              className="pt-10"
              icon={PackageSearch}
              title="No products found"
              direction="Try a different search term or pick another category."
              action={
                selectedCategory !== "All" || search ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleSearchChange("");
                      handleCategoryChange("All");
                    }}
                  >
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          )}
        </main>
      </Container>

      <div className="mt-auto">
        <Footer />
      </div>

      {authMode && (
        <AuthModal mode={authMode} onClose={closeModal} onSwitch={switchMode} />
      )}
    </div>
  );
}