import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUserProfile, LogoutUser } from "../store/authSlice";
import { useNavbar } from "../context/NavbarContext";
import { toast } from "../lib/toast";

type Role = "customer" | "vendor";

const customerLinks = [
  { label: "Home", to: "/" },
  { label: "Orders", to: "/orders" },
];

const vendorLinks = [
  { label: "Overview", to: "/vendor/dashboard", tab: "overview" },
  { label: "Products", to: "/vendor/dashboard?tab=products", tab: "products" },
  { label: "Orders", to: "/vendor/dashboard?tab=orders", tab: "orders" },
];

const publicLinks = [{ label: "Home", to: "/" }];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dispatch = useDispatch();
  const authState = useSelector((state: any) => state.auth);
  const cart = useSelector((state: any) => state.cart.cart);
  const { navbarData } = useNavbar();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = navbarData.user ?? authState.user;
  const role: Role = user?.userRole === "vendor" ? "vendor" : "customer";
  const isAuthenticated = !!authState.isAuthenticated;

  const cartCount =
    navbarData.cartCount ??
    (Array.isArray(cart) ? cart.reduce((sum: number, i: any) => sum + i.quantity, 0) : 0);

  const links = !isAuthenticated
    ? publicLinks
    : role === "vendor"
      ? vendorLinks
      : customerLinks;

  const closeMenus = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleLogout = async () => {
    closeMenus();
    await dispatch(LogoutUser() as any);
    navigate("/", { replace: true });
  };

  const openLogin = () => (navbarData.onLogin?.() ?? navigate("/login"));
  const openRegister = () => (navbarData.onRegister?.() ?? navigate("/login"));
  const handleProfileClick = () =>
    navbarData.onProfileClick?.() ?? toast.info("User profile coming soon!");

  const isActive = (to: string) => {
    if (location.pathname !== "/vendor/dashboard") return location.pathname === to;
    if (to === "/vendor/dashboard") {
      const tab = new URLSearchParams(location.search).get("tab");
      return tab !== "products" && tab !== "orders";
    }
    const wanted = to.split("?tab=")[1];
    return new URLSearchParams(location.search).get("tab") === wanted;
  };

  const linkClass = (to: string) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive(to) ? "text-indigo-600 bg-indigo-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    }`;

  useEffect(() => {
    closeMenus();
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (authState.isAuthenticated) {
      dispatch(getUserProfile() as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const avatarInitial = user?.userName?.[0]?.toUpperCase() ?? "?";

  return (
    <nav className="border-b border-gray-200 sticky top-0 bg-white z-40">
      <div className="flex items-center justify-between h-16 pr-4">
        {/* Brand — far left corner */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            onClick={closeMenus}
            className="text-xl font-bold tracking-tight text-gray-900 hover:text-indigo-600 transition-colors p-2"
          >
            ShopEase
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link key={link.to} to={link.to} onClick={closeMenus} className={linkClass(link.to)}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={openLogin}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg transition-colors"
              >
                Login
              </button>
              <button
                onClick={openRegister}
                className="text-sm font-semibold bg-gray-900 text-white px-4 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Register
              </button>
            </div>
          ) : role === "vendor" ? (
            <div ref={dropdownRef} className="hidden md:block relative">
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 hover:bg-gray-100 pl-1.5 pr-3 py-1.5 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700">
                  {avatarInitial}
                </div>
                <span className="hidden lg:block text-sm font-medium text-gray-700">{user?.userName}</span>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 text-sm z-50">
                  <Link
                    to="/vendor/dashboard"
                    onClick={closeMenus}
                    className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors block"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/"
                    onClick={closeMenus}
                    className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors block"
                  >
                    View Store
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition-colors">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Cart */}
              <Link
                to="/cart"
                onClick={closeMenus}
                className="hidden md:flex relative items-center gap-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
              >
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                <span className="hidden xl:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full min-w-4 h-4 flex items-center justify-center px-1">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User dropdown */}
              <div ref={dropdownRef} className="hidden md:block relative">
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 hover:bg-gray-100 pl-1.5 pr-3 py-1.5 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700">
                    {avatarInitial}
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-gray-700">{user?.userName}</span>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 text-sm z-50">
                    <button
                      onClick={() => { handleProfileClick(); setDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      My Profile
                    </button>
                    <Link
                      to="/orders"
                      onClick={closeMenus}
                      className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors block"
                    >
                      My Orders
                    </Link>
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition-colors">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-gray-600 hover:text-gray-900 ml-1"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="17" x2="21" y2="17" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-4 py-4 flex flex-col gap-3 text-sm bg-white shadow-lg animate-[slideDown_0.2s_ease]">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={closeMenus}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                isActive(link.to) ? "text-indigo-600 bg-indigo-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated && role === "vendor" && (
            <Link
              to="/"
              onClick={closeMenus}
              className="px-3 py-2 rounded-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              View Store
            </Link>
          )}

          {isAuthenticated && role === "customer" && (
            <Link
              to="/cart"
              onClick={closeMenus}
              className="px-3 py-2 rounded-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              Cart
              {cartCount > 0 && (
                <span className="bg-indigo-600 text-white text-[10px] font-bold rounded-full min-w-4 h-4 flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          <div className="border-t border-gray-100 my-1" />

          {!isAuthenticated ? (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => { openLogin(); setMenuOpen(false); }}
                className="flex-1 border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => { openRegister(); setMenuOpen(false); }}
                className="flex-1 bg-gray-900 text-white rounded-lg py-2 hover:bg-gray-700 transition-colors"
              >
                Register
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors font-medium"
            >
              Sign Out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}