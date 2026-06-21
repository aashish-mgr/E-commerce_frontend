import { useCallback, useEffect, useMemo, useState } from "react";
import ProductCard from "../Components/ProductCard";
import FilterBar from "../Components/FilterBar";
import type { Product, User } from "../types";
import Footer from "../Components/Footer"
import {useSelector} from 'react-redux'
import { API } from "../api/index"
import { useNavbar } from "../context/NavbarContext";
import { useNavigate } from "react-router-dom";

// ── Mock data ─────────────────────────────────────────────────


// const PRODUCTS: Product[] = [
//   { id: 1,  name: "Wireless Headphones",  price: 89,  category: "Electronics", emoji: "🎧", rating: 4.5, inStock: true,  description: "Premium over-ear headphones with active noise cancellation and 30-hour battery life." },
//   { id: 2,  name: "Running Shoes",        price: 120, category: "Footwear",    emoji: "👟", rating: 4.8, inStock: true,  description: "Lightweight, breathable shoes with responsive cushioning for long-distance runs." },
//   { id: 3,  name: "Leather Wallet",       price: 45,  category: "Accessories", emoji: "👛", rating: 4.2, inStock: true,  description: "Slim bi-fold wallet crafted from genuine full-grain leather with 6 card slots." },
//   { id: 4,  name: "Sunglasses",           price: 65,  category: "Accessories", emoji: "🕶️", rating: 4.0, inStock: false, description: "UV400 polarized lenses in a lightweight titanium frame. Ideal for all-day outdoor wear." },
//   { id: 5,  name: "Mechanical Keyboard",  price: 149, category: "Electronics", emoji: "⌨️", rating: 4.7, inStock: true,  description: "TKL layout with tactile brown switches, per-key RGB backlighting, and aluminum body." },
//   { id: 6,  name: "Yoga Mat",             price: 38,  category: "Sports",      emoji: "🧘", rating: 4.3, inStock: true,  description: "6mm thick non-slip mat made from eco-friendly TPE material. Includes carry strap." },
//   { id: 7,  name: "Ceramic Coffee Mug",   price: 22,  category: "Home",        emoji: "☕", rating: 4.6, inStock: true,  description: "Hand-thrown 12oz ceramic mug with a comfortable handle. Microwave and dishwasher safe." },
//   { id: 8,  name: "Smart Water Bottle",   price: 55,  category: "Sports",      emoji: "🍶", rating: 4.4, inStock: false, description: "Insulated stainless steel bottle that tracks hydration and glows to remind you to drink." },
// ];


// ── Toast notification ────────────────────────────────────────
interface Toast {
  id: number;
  message: string;
}

// ── Dashboard ─────────────────────────────────────────────────
export default function Dashboard() {
  const [cartCount, setCartCount]           = useState(0);
  const [search, setSearch]                 = useState("");
  const [selectedCategory, setCategory]     = useState("All");
  const [toasts, setToasts]                 = useState<Toast[]>([]);
  const authState = useSelector( (state: any) => state.auth);
  const [products, setProducts] = useState<Product[]>([]);
  const {setNavbarData} = useNavbar();
  const navigate = useNavigate();

   const getProducts = async () => {
    try {
      const response = await API.get('/product/getAll');  
      
      
      setProducts(response.data.data);
     
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  const CURRENT_USER: User = authState.user?.data ;
  useEffect(() => {
    getProducts();
    console.log(authState.user?.data);
  },[])

  

  const CATEGORIES = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.Category?.categoryName));
    return ["All", ...Array.from(set)];
  }, [products]);

  // Filter products based on search + category
  const filteredProducts = useMemo(() => {
    return products.filter((p: Product) => {
      const matchesSearch =
        p.productName.toLowerCase().includes(search.toLowerCase()) ||
        p.productDescription.toLowerCase().includes(search.toLowerCase()) ||
        p.Category.categoryName.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || p.Category.categoryName === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory, products]);

  // Show a short toast notification
  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2500);
  }, []);

  const handleAddToCart = useCallback((product: Product) => {
    setCartCount((n) => n + 1);
    showToast(`"${product.productName}" added to cart`);
  }, [showToast]);

  const handleCartClick = useCallback(() => {
    navigate("/cart");
  }, []);

  const handleOrderHistoryClick = useCallback(() => {
    navigate('/orders');
  }, []);

  const handleProfileClick = useCallback(() => {
    showToast("User profile coming soon!");
    console.log(CATEGORIES);
    console.log(products.map((p) => p.Category.categoryName));
  }, [CATEGORIES, products, showToast]);

  const navbarData = useMemo(
    () => ({
      user: CURRENT_USER,
      cartCount,
      onProfileClick: handleProfileClick,
    }),
    [CURRENT_USER, cartCount, handleOrderHistoryClick, handleProfileClick]
  );

  useEffect(() => {
    setNavbarData(navbarData);
    return () => setNavbarData({});
  }, [navbarData, setNavbarData])
  

 

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

   
      
        {/* Filter bar */}
        <div className="sticky top-16 z-20 bg-white  shadow-md p-4 mb-6 " >
          <FilterBar
            search={search}
            selectedCategory={selectedCategory}
            categories={CATEGORIES}
            onSearchChange={setSearch}
            onCategoryChange={setCategory}
          />
        </div>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Welcome banner */}
        <div className="bg-indigo-600 text-white rounded-2xl px-6 py-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold mb-0.5">
              Welcome back, {CURRENT_USER?.userName?.split(" ")[0]}! 👋
            </h1>
            
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleOrderHistoryClick}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
                <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
              </svg>
              Order History
            </button>
            <button
              onClick={handleCartClick}
              className="flex items-center gap-2 bg-white text-indigo-600 hover:bg-indigo-50 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              View Cart {cartCount > 0 && `(${cartCount})`}
            </button>
          </div>
        </div>

       
        


        {/* Product grid */}
        {filteredProducts.length > 0 ? (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Showing {filteredProducts.length} of {products.length} products
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProducts.map((product: Product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
              
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-medium text-gray-500">No products found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        )}
      </main>

      {/* Toast notifications */}
      <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg animate-[fadeIn_0.2s_ease]"
          >
            {toast.message}
          </div>
        ))}
      </div>
      {/* footer */}
        <Footer />

    </div>
  );
}