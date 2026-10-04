import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { PackageSearch } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import type { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import { useNavigate } from "react-router-dom";
import Footer from "../Components/Footer";
import ProductCard from "../Components/ProductCard";
import AuthModal from "../Components/AuthModal";
import Pagination from "../Components/Pagination";
import type { Cart, Product, PaginationMeta, User } from "../types";
import { API, authAPI } from "../api/index";
import { getImageUrl } from "../api";
import { getCartItems } from "../store/cartSlice";
import { useNavbar } from "../context/NavbarContext";
import { toast, showErrorToast } from "../lib/toast";
import { Container } from "../Components/ui/Container";
import { Button } from "../Components/ui/Button";
import { PageHeader } from "../Components/ui/PageHeader";
import { EmptyState } from "../Components/ui/EmptyState";
import { ProductCardSkeleton } from "../Components/ui/Skeleton";

type RootState = {
  auth: { isAuthenticated: boolean; user: User | null };
  cart: { cart: Cart[] | null };
};

type AppDispatch = ThunkDispatch<RootState, unknown, UnknownAction>;

const STATS = [
  { value: "50k+", label: "Happy customers" },
  { value: "10k+", label: "Products" },
  { value: "Free", label: "Shipping over Rs. 50" },
  { value: "24/7", label: "Support" },
];

const PROMISES = [
  {
    title: "Sellers you can name",
    body: "Every listing belongs to an independent Nepali seller, shown on the product page.",
  },
  {
    title: "One checkout, one payment",
    body: "Pay the whole basket with Khalti. We pass your order to each seller for you.",
  },
  {
    title: "Order status you can follow",
    body: "From placed to delivered, each step shows up in your orders as it happens.",
  },
];

// ── Landing Page ──────────────────────────────────────────────
export default function LandingPage() {
  const [authMode, setAuthMode] = useState(""); // "login" | "register" | null
  const authState = useSelector(
    (state: { auth: { isAuthenticated: boolean; user: User | null } }) => state.auth
  );
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { setNavbarData } = useNavbar();
  const reduce = useReducedMotion();
  const dispatch = useDispatch<AppDispatch>();

  const openLogin = useCallback(() => setAuthMode("login"), []);
  const openRegister = useCallback(() => setAuthMode("register"), []);
  const closeModal = useCallback(() => setAuthMode(""), []);
  const switchMode = useCallback(
    () => setAuthMode((m) => (m === "login" ? "register" : "login")),
    []
  );
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
        // Keep the Navbar badge in step with the server instead of guessing.
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

  const navbarData = useMemo(
    () => ({
      onLogin: openLogin,
      onRegister: openRegister,
    }),
    [openLogin, openRegister]
  );

  const getProducts = async () => {
    setLoading(true);
    try {
      const response = await API.get("/product/getAll", { params: { page, limit: 8 } });
      setProducts(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, [page]);

  useEffect(() => {
    setNavbarData(navbarData);
    return () => setNavbarData({});
  }, [navbarData, setNavbarData]);

  useEffect(() => {
    if (authState.isAuthenticated) {
      closeModal();
      navigate(
        authState.user?.userRole === "admin"
          ? "/admin"
          : authState.user?.userRole === "vendor"
            ? "/vendor/dashboard"
            : "/dashboard"
      );
    }
  }, [authState.isAuthenticated]);

  const mosaic = products.slice(0, 4);
  const reveal = (index: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4, delay: index * 0.06, ease: "easeOut" as const },
        };

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────── */}
        <section className="border-b border-line">
          <Container>
            <div className="grid items-center gap-10 py-14 lg:grid-cols-[1.05fr_1fr] lg:py-20">
              <motion.div {...reveal(0)}>
                <p className="text-sm font-medium text-pine">
                  A marketplace built in Nepal
                </p>
                <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
                  Buy from Nepali sellers, all in one basket
                </h1>
                <p className="mt-4 max-w-prose text-base leading-relaxed text-ink-2">
                  Kinau brings independent vendors together in one place. Fill your
                  basket across sellers, pay once with Khalti, and follow every order to
                  your door.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button variant="primary" onClick={() => document.getElementById("products")?.scrollIntoView()}>
                    Browse products
                  </Button>
                  <Button variant="outline" onClick={openRegister}>
                    Create an account
                  </Button>
                </div>
              </motion.div>

              <div className="grid grid-cols-2 gap-3">
                {mosaic.length > 0
                  ? mosaic.map((product, index) => (
                      <motion.div
                        key={product.id}
                        {...reveal(index + 1)}
                        className={`flex items-center justify-center overflow-hidden rounded-tile bg-paper-2 ${
                          index % 3 === 0 ? "aspect-[3/4]" : "aspect-square"
                        }`}
                      >
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.productName}
                          loading={index > 1 ? "lazy" : "eager"}
                          className="h-full w-full object-contain"
                        />
                      </motion.div>
                    ))
                  : Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className={`animate-pulse rounded-tile bg-paper-2 ${
                          index % 3 === 0 ? "aspect-[3/4]" : "aspect-square"
                        }`}
                      />
                    ))}
              </div>
            </div>
          </Container>
        </section>

        {/* ── Stats ────────────────────────────────────── */}
        <section className="border-b border-line bg-surface">
          <Container>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-8 py-10 md:grid-cols-4">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-display text-3xl font-semibold tracking-tight tabular-nums text-ink">
                    {value}
                  </dd>
                  <dd className="mt-1 text-sm text-muted">{label}</dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>

        {/* ── How it works ────────────────────────────── */}
        <section className="border-b border-line">
          <Container>
            <PageHeader title="How Kinau works" />
            <div className="grid gap-x-8 gap-y-8 py-10 md:grid-cols-3">
              {PROMISES.map(({ title, body }, index) => (
                <div key={title}>
                  <span className="font-display text-sm font-semibold tabular-nums text-pine">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-semibold text-ink">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ── Products ─────────────────────────────────── */}
        <section id="products">
          <Container>
            <PageHeader
              className="mt-14"
              title="Featured products"
              description="A rotating selection from sellers on Kinau."
            />

            {loading ? (
              <div className="grid grid-cols-2 gap-x-5 gap-y-8 py-10 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-x-5 gap-y-8 py-10 lg:grid-cols-4">
                  {products.map((product: Product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
                {pagination && (
                  <Pagination pagination={pagination} onPageChange={setPage} />
                )}
              </>
            ) : (
              <EmptyState
                className="py-10"
                icon={PackageSearch}
                title="No products yet"
                direction="Sellers are still stocking the shelves. Check back shortly."
              />
            )}
          </Container>
        </section>

        {/* ── Promo ────────────────────────────────────── */}
        <section className="mt-16 bg-pine text-paper">
          <Container>
            <div className="flex flex-col items-start gap-6 py-12 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  15% off your first order
                </h2>
                <p className="mt-1.5 max-w-prose text-sm text-paper/75">
                  Create an account and use code WELCOME15 at checkout.
                </p>
              </div>
              <Button variant="primary" onClick={openRegister} className="shrink-0">
                Create a free account
              </Button>
            </div>
          </Container>
        </section>
      </main>

      <Footer />

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={closeModal}
          onSwitch={switchMode}
        />
      )}
    </div>
  );
}