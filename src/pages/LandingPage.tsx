import { useCallback, useEffect, useMemo, useState } from "react";
import Footer from "../Components/Footer";
import ProductCardts from "../Components/ProductCard";
import AuthModal from "../Components/AuthModal";
import { useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import type { Product, PaginationMeta } from "../types";
import { API, authAPI } from "../api/index"
import { useNavbar } from "../context/NavbarContext";
import Pagination from "../Components/Pagination";
import { toast, showErrorToast } from "../lib/toast";


const STATS = [
  { value: "50k+", label: "Happy Customers" },
  { value: "10k+", label: "Products" },
  { value: "Free", label: "Shipping over Rs. 50" },
  { value: "24/7", label: "Support" },
];




// ── Landing Page ──────────────────────────────────────────────
export default function LandingPage() {
  const [authMode, setAuthMode] = useState(""); // "login" | "register" | null
  const authState = useSelector( (state: any) => state.auth);
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const {setNavbarData} = useNavbar();
 
  const openLogin = useCallback(() => setAuthMode("login"), []);
  const openRegister = useCallback(() => setAuthMode("register"), []);
  const closeModal = useCallback(() => setAuthMode(""), []);
  const switchMode = useCallback(() => setAuthMode((m) => (m === "login" ? "register" : "login")), []);
  const handleAddToCart = useCallback(
    async (product: Product) => {
      if (!authState.isAuthenticated) {
        openLogin();
        return;
      }
      try {
        await authAPI.post("/cart/addToCart", {
          quantity: 1,
          productId: product.id,
        });
        toast.success(`"${product.productName}" added to cart`);
      } catch (error) {
        showErrorToast(error, "Failed to add to cart.");
      }
    },
    [authState.isAuthenticated, openLogin]
  );

  const navbarData = useMemo(
    () => ({
      onLogin: openLogin,
      onRegister: openRegister,
    }),
    [openLogin, openRegister]
  );

  const getProducts = async () => {
    try {
      const response = await API.get('/product/getAll', { params: { page, limit: 8 } });
      setProducts(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  useEffect(() => {
    getProducts();
   
  },[page])

  useEffect(() => {
    setNavbarData(navbarData);
    return () => setNavbarData({});
  }, [navbarData, setNavbarData])
  
  
  useEffect(() => {
    if(authState.isAuthenticated) {
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

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">

    
      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────── */}
        <section className="bg-gray-50 py-20 px-4 text-center">
          <p className="text-sm text-indigo-600 font-medium mb-3 tracking-wide uppercase">
            New arrivals every week
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Shop Smarter,<br />Live Better
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
            Discover thousands of quality products at unbeatable prices.
            Free shipping on orders over Rs. 50.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="#products"
              className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Shop Now
            </a>
            <button
              onClick={openRegister}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Create Account
            </button>
          </div>
        </section>

        {/* ── Stats ────────────────────────────────────── */}
        <section className="border-y border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Products ─────────────────────────────────── */}
        <section id="products" className="py-16 px-4 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Products</h2>
          <p className="text-gray-500 mb-8">Hand-picked just for you</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((product: Product) => (
              <ProductCardts key={product.id} product={product} onAddToCart={handleAddToCart}/>
            ))}
          </div>
          {pagination && (
            <Pagination pagination={pagination} onPageChange={setPage} />
          )}
        </section>

        {/* ── Promo Banner ─────────────────────────────── */}
        <section className="bg-indigo-600 text-white py-14 px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Get 15% off your first order
          </h2>
          <p className="text-indigo-200 mb-6">
            Sign up today and use code WELCOME15 at checkout
          </p>
          <button
            onClick={openRegister}
            className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Create Free Account
          </button>
        </section>

      </main>

      {/* Footer — standalone, no props needed */}
      <Footer />

      {/* Auth Modal — only mounts when authMode is set */}
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

