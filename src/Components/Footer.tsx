import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Container } from "./ui/Container";

type Category = { id: string; categoryName: string };

/** lucide dropped brand glyphs, so the two social marks are inlined. */
function FacebookMark() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M14 8.5V7c0-.8.2-1.2 1.4-1.2H17V3h-2.6C11.2 3 10 4.4 10 6.8v1.7H8v3h2V21h4V11.5h2.6l.4-3H14Z" />
    </svg>
  );
}

function InstagramMark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-5"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const shopLinks = [
  { label: "All products", to: "/products" },
  { label: "My orders", to: "/orders" },
  { label: "Cart", to: "/cart" },
  { label: "My profile", to: "/profile" },
];

const helpLinks = [
  { label: "Place an order", to: "/products" },
  { label: "Shipping and delivery", to: "/products" },
  { label: "Returns", to: "/products" },
  { label: "Contact the seller", to: "/products" },
];

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/categories`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: { categories?: Category[] } | Category[]) => {
        const list = Array.isArray(data) ? data : (data.categories ?? []);
        setCategories(list.slice(0, 5));
      })
      .catch(() => setCategories([]));
  }, []);

  return (
    <footer className="mt-20 bg-pine text-paper">
      <Container>
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="flex size-8 items-center justify-center rounded-control bg-paper"
              >
                <ShoppingBag className="size-4 text-pine" strokeWidth={2.4} />
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">
                Kinau
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-paper/75">
              A Nepali marketplace where independent sellers list their own goods
              and buyers pay once with Khalti.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Kinau on Facebook"
                className="flex size-10 items-center justify-center rounded-control text-paper/80 transition-colors hover:bg-paper/10 hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marigold"
              >
                <FacebookMark />
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Kinau on Instagram"
                className="flex size-10 items-center justify-center rounded-control text-paper/80 transition-colors hover:bg-paper/10 hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marigold"
              >
                <InstagramMark />
              </a>
            </div>
          </div>

          <nav aria-labelledby="footer-shop">
            <h2 id="footer-shop" className="font-display text-sm font-semibold">
              Shop
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-paper/75 transition-colors hover:text-marigold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marigold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-categories">
            <h2 id="footer-categories" className="font-display text-sm font-semibold">
              Categories
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      to={`/category/${category.id}`}
                      className="text-sm text-paper/75 transition-colors hover:text-marigold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marigold"
                    >
                      {category.categoryName}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-sm text-paper/55">Loading categories</li>
              )}
            </ul>
          </nav>

          <nav aria-labelledby="footer-help">
            <h2 id="footer-help" className="font-display text-sm font-semibold">
              Help
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-paper/75 transition-colors hover:text-marigold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marigold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-paper/15 py-6 text-xs text-paper/65 sm:flex-row sm:items-center sm:justify-between">
          <p>Kinau. Built for sellers across Nepal.</p>
          <p>Prices in Nepali rupees. Payments secured by Khalti.</p>
        </div>
      </Container>
    </footer>
  );
}