import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ChevronDown,
  LayoutGrid,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  Store,
  User,
  type LucideIcon,
} from "lucide-react";
import { LogoutUser } from "../store/authSlice";
import { useNavbar } from "../context/NavbarContext";
import { getImageUrl } from "../api/index";
import { cn } from "../lib/cn";
import type { Cart, User as AppUser } from "../types";
import { Container } from "./ui/Container";
import { Button } from "./ui/Button";
import { Dialog, DialogContent } from "./ui/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/DropdownMenu";

type RootState = {
  auth: { user: AppUser | null; isAuthenticated: boolean; status: string };
  cart: { cart: Cart[] | null };
};

type AppDispatch = ThunkDispatch<RootState, unknown, UnknownAction>;

type Role = "customer" | "vendor" | "admin";

const customerLinks = [
  { label: "Home", to: "/" },
  { label: "Orders", to: "/orders" },
];

// The dashboard rail replaces these text links. Kept so `isActive` stays intact.
const adminLinks = [
  { label: "Overview", to: "/admin", tab: "overview" },
  { label: "Users", to: "/admin?tab=users", tab: "users" },
  { label: "Products", to: "/admin?tab=products", tab: "products" },
  { label: "Orders", to: "/admin?tab=orders", tab: "orders" },
  { label: "Categories", to: "/admin?tab=categories", tab: "categories" },
];

const vendorLinks = [
  { label: "Overview", to: "/vendor/dashboard", tab: "overview" },
  { label: "Products", to: "/vendor/dashboard?tab=products", tab: "products" },
  { label: "Orders", to: "/vendor/dashboard?tab=orders", tab: "orders" },
];

const publicLinks = [{ label: "Home", to: "/" }];

function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className="flex items-center gap-2 rounded-control focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pine"
    >
      <span aria-hidden className="flex size-8 items-center justify-center rounded-control bg-pine">
        <ShoppingBag className="size-4 text-paper" strokeWidth={2.4} />
      </span>
      <span className="font-display text-lg font-semibold tracking-tight text-ink">
        Kinau
      </span>
    </Link>
  );
}

function UserAvatar({
  name,
  avatar,
  className,
}: {
  name?: string;
  avatar?: string | null;
  className?: string;
}) {
  const initial = name?.[0]?.toUpperCase() ?? "?";
  const src = avatar ? getImageUrl(avatar) : "";

  return (
    <span
      className={`flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-pine-soft font-display text-sm font-semibold text-pine ${className ?? ""}`}
    >
      {src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        initial
      )}
    </span>
  );
}

function NavIconLink({
  to,
  label,
  icon: Icon,
  count,
  onNavigate,
  className,
}: {
  to: string;
  label: string;
  icon: LucideIcon;
  count?: number;
  onNavigate?: () => void;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <Link
      to={to}
      onClick={onNavigate}
      aria-label={count ? `${label}, ${count} items` : label}
      className={cn(
        "relative flex size-11 items-center justify-center rounded-control text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine",
        className,
      )}
    >
      <Icon aria-hidden className="size-5" />
      <AnimatePresence>
        {!!count && count > 0 && (
          <motion.span
            key={count}
            initial={reduce ? false : { scale: 1 }}
            animate={reduce ? {} : { scale: [1, 1.15, 1] }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-pine px-1 font-display text-[11px] font-semibold tabular-nums text-paper"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}

export default function Navbar() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);
  const cart = useSelector((state: RootState) => state.cart.cart);
  const { navbarData } = useNavbar();
  const navigate = useNavigate();
  const location = useLocation();

  const user = navbarData.user ?? authState.user;
  const role: Role =
    user?.userRole === "vendor"
      ? "vendor"
      : user?.userRole === "admin"
        ? "admin"
        : "customer";
  const isAuthenticated = !!authState.isAuthenticated;
  const authPending = authState.status === "idle" || authState.status === "loading";
  const isDashboard =
    location.pathname === "/admin" || location.pathname === "/vendor/dashboard";

  const cartCount =
    navbarData.cartCount ??
    (Array.isArray(cart)
      ? cart.reduce((sum: number, item: Cart) => sum + item.quantity, 0)
      : 0);

  const links = !isAuthenticated
    ? publicLinks
    : isDashboard
      ? []
      : role === "admin"
        ? adminLinks
        : role === "vendor"
          ? vendorLinks
          : customerLinks;

  const handleLogout = async () => {
    setSheetOpen(false);
    await dispatch(LogoutUser());
    navigate("/", { replace: true });
  };

  const openLogin = () => (navbarData.onLogin?.() ?? navigate("/login"));
  const openRegister = () => (navbarData.onRegister?.() ?? navigate("/login"));
  const handleProfileClick = () => navigate("/profile");

  const isActive = (to: string) => {
    if (!isDashboard) return location.pathname === to;
    if (to === location.pathname) {
      const tab = new URLSearchParams(location.search).get("tab");
      return !tab || tab === "overview";
    }
    const wanted = to.split("?tab=")[1];
    return new URLSearchParams(location.search).get("tab") === wanted;
  };

  const linkClass = (to: string) =>
    `rounded-control px-3 py-2 text-sm font-medium transition-colors ${
      isActive(to) ? "bg-pine-soft text-pine" : "text-ink-2 hover:bg-paper-2 hover:text-ink"
    }`;

  const isStaff = isAuthenticated && (role === "vendor" || role === "admin");
  const isCustomer = isAuthenticated && !isStaff;
  const dashboardPath = role === "admin" ? "/admin" : "/vendor/dashboard";

  const sheetLinkClass = (to: string) =>
    `flex min-h-11 items-center gap-2 rounded-control px-3 text-sm font-medium ${
      isActive(to) ? "bg-pine-soft text-pine" : "text-ink-2 hover:bg-paper-2 hover:text-ink"
    }`;

  // Cart and Orders get their own icon rows below, so drop Orders from the plain text list.
  const sheetLinks = isCustomer ? links.filter((link) => link.to !== "/orders") : links;

  const menuItems = (
    <>
      {isAuthenticated && role === "customer" && (
        <>
          <DropdownMenuItem asChild>
            <Link to="/orders">My orders</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/cart">Cart</Link>
          </DropdownMenuItem>
        </>
      )}
      {isStaff && (
        <DropdownMenuItem asChild>
          <Link to={dashboardPath}>
            <LayoutGrid aria-hidden className="size-4" />
            {role === "admin" ? "Admin console" : "Store dashboard"}
          </Link>
        </DropdownMenuItem>
      )}
      {isAuthenticated && (
        <DropdownMenuItem onSelect={handleProfileClick}>
          <User aria-hidden className="size-4" />
          My profile
        </DropdownMenuItem>
      )}
      {isAuthenticated && (
        <DropdownMenuSeparator className="my-1 h-px bg-line" />
      )}
      {isAuthenticated ? (
        <DropdownMenuItem destructive onSelect={handleLogout}>
          <LogOut aria-hidden className="size-4" />
          Sign out
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem
          onSelect={() => {
            openLogin();
            openRegister();
          }}
        >
          Sign in
        </DropdownMenuItem>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
      <Container>
        <div className="flex h-[var(--nav-h)] items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-6">
            <Brand />

            <div className="hidden items-center gap-1 md:flex">
              {links.map((link) => (
                <Link key={link.to} to={link.to} className={linkClass(link.to)}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {isCustomer && (
              <NavIconLink to="/cart" label="Cart" icon={ShoppingBag} count={cartCount} />
            )}
            {authPending ? (
              <div className="hidden items-center gap-2 md:flex" aria-label="Loading account">
                <UserAvatar />
              </div>
            ) : !isAuthenticated ? (
              <div className="hidden items-center gap-2 md:flex">
                <Button variant="ghost" size="sm" onClick={openLogin}>
                  Sign in
                </Button>
                <Button variant="solid" size="sm" onClick={openRegister}>
                  Create account
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Account menu"
                  className="flex h-11 items-center gap-2 rounded-control pl-1 pr-2 transition-colors hover:bg-paper-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
                >
                  <UserAvatar name={user?.userName} avatar={user?.avatar} />
                  <span className="hidden max-w-28 truncate text-sm font-medium text-ink lg:block">
                    {user?.userName}
                  </span>
                  <ChevronDown aria-hidden className="hidden size-4 text-muted lg:block" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-[13rem]">
                  <p className="px-3 pt-2 pb-1 text-xs text-muted lg:hidden">
                    {user?.userName}
                  </p>
                  {menuItems}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isCustomer && (
              <NavIconLink to="/orders" label="Orders" icon={Package} />
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
              aria-expanded={sheetOpen}
              onClick={() => setSheetOpen(true)}
            >
              <Menu aria-hidden className="size-5" />
            </Button>
          </div>
        </div>
      </Container>

      <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
        <DialogContent title="Menu" variant="sheet" className="border-line bg-surface p-0">
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-1">
              {sheetLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setSheetOpen(false)}
                  className={sheetLinkClass(link.to)}
                >
                  {link.label}
                </Link>
              ))}
              {isCustomer && (
                <>
                  <Link
                    to="/cart"
                    onClick={() => setSheetOpen(false)}
                    className={sheetLinkClass("/cart")}
                  >
                    <ShoppingBag aria-hidden className="size-4" />
                    Cart
                    {cartCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-pine px-1 font-display text-[11px] font-semibold tabular-nums text-paper">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setSheetOpen(false)}
                    className={sheetLinkClass("/orders")}
                  >
                    <Package aria-hidden className="size-4" />
                    Orders
                  </Link>
                </>
              )}
              {isStaff && (
                <Link
                  to="/"
                  onClick={() => setSheetOpen(false)}
                  className="flex min-h-11 items-center gap-2 rounded-control px-3 text-sm font-medium text-ink-2 hover:bg-paper-2 hover:text-ink"
                >
                  <Store aria-hidden className="size-4" />
                  View store
                </Link>
              )}
            </div>

            <div className="mt-auto flex flex-col gap-2 pt-4">
              {authPending ? (
                <p className="px-3 py-2 text-sm text-muted">Loading account</p>
              ) : !isAuthenticated ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSheetOpen(false);
                      openLogin();
                    }}
                  >
                    Sign in
                  </Button>
                  <Button
                    variant="solid"
                    onClick={() => {
                      setSheetOpen(false);
                      openRegister();
                    }}
                  >
                    Create account
                  </Button>
                </>
              ) : (
                <>
                  <p className="px-3 text-sm font-medium text-ink">{user?.userName}</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSheetOpen(false);
                      handleProfileClick();
                    }}
                  >
                    My profile
                  </Button>
                  {isStaff && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSheetOpen(false);
                        navigate(dashboardPath);
                      }}
                    >
                      {role === "admin" ? "Admin console" : "Store dashboard"}
                    </Button>
                  )}
                  <Button variant="danger" onClick={handleLogout}>
                    Sign out
                  </Button>
                </>
              )}
            </div>
          </nav>
        </DialogContent>
      </Dialog>
    </nav>
  );
}