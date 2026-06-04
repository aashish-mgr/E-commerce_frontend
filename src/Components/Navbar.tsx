import { useState } from "react";

const NAV_LINKS = ["Home", "Products", "Categories", "About"];

// Props:
//   onLogin    () => void
//   onRegister () => void
export default function Navbar({ onLogin, onRegister }:any) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b border-gray-200 sticky top-0 bg-white z-40">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">

        {/* Logo */}
        <span className="text-xl font-bold tracking-tight">ShopEase</span>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          {NAV_LINKS.map((link) => (
            <a key={link} href="#" className="hover:text-gray-900 transition-colors">
              {link}
            </a>
          ))}
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onLogin}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5"
          >
            Login
          </button>
          <button
            onClick={onRegister}
            className="text-sm bg-gray-900 text-white px-4 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Register
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-gray-600"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-4 py-4 flex flex-col gap-3 text-sm text-gray-600 bg-white">
          {NAV_LINKS.map((link) => (
            <a key={link} href="#" className="hover:text-gray-900 transition-colors">
              {link}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { onLogin(); setMenuOpen(false); }}
              className="flex-1 border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => { onRegister(); setMenuOpen(false); }}
              className="flex-1 bg-gray-900 text-white rounded-lg py-2 hover:bg-gray-700 transition-colors"
            >
              Register
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}