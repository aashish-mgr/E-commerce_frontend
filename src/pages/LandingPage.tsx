import { useState,useEffect } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import ProductCardts from "../Components/ProductCard";
import AuthModal from "../Components/AuthModal";
import { useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import type { Product } from "../types";
import { API } from "../api/index"


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


const STATS = [
  { value: "50k+", label: "Happy Customers" },
  { value: "10k+", label: "Products" },
  { value: "Free", label: "Shipping over $50" },
  { value: "24/7", label: "Support" },
];




// ── Landing Page ──────────────────────────────────────────────
export default function LandingPage() {
  const [authMode, setAuthMode] = useState(""); // "login" | "register" | null
  const authState = useSelector( (state: any) => state.auth);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
 
  const openLogin    = () => setAuthMode("login");
  const openRegister = () => setAuthMode("register");
  const closeModal   = () => setAuthMode("");
  const switchMode   = () => setAuthMode((m) => (m === "login" ? "register" : "login"));
  const handleAddToCart = (product: any) => {
    // Implement add to cart functionality here
    console.log("Added to cart:", product);
  };

  const getProducts = async () => {
    try {
      const response = await API.get('/product/getAll');  
      
      
      setProducts(response.data.data);
     
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  useEffect(() => {
    getProducts();
   
  },[])
  
  useEffect(() => {
    if(authState.isAuthenticated) {
      closeModal();
      navigate('/dashboard');
      console.log(authState.isAuthenticated);
    }
  }, [authState.isAuthenticated]);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">

      {/* Navbar — receives auth handlers as props */}
      <Navbar onLogin={openLogin} onRegister={openRegister} />

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
            Free shipping on orders over $50.
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

          ProductCard component used here — receives product as a prop
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((product: Product) => (
              <ProductCardts key={product.id} product={product} onAddToCart={handleAddToCart}/>
            ))}
          </div>
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

