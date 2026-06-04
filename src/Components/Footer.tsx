const FOOTER_COLUMNS = [
  { title: "Shop",    links: ["New Arrivals", "Best Sellers", "Sale"] },
  { title: "Company", links: ["About Us", "Careers", "Contact"] },
  { title: "Support", links: ["FAQ", "Shipping", "Returns"] },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between gap-8">

          {/* Brand */}
          <div>
            <p className="text-white font-bold text-lg mb-2">ShopEase</p>
            <p className="text-sm max-w-xs">
              Your one-stop shop for quality products delivered fast.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex gap-12 text-sm">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-white font-medium mb-3">{col.title}</p>
                <ul className="flex flex-col gap-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-xs text-center">
          © {new Date().getFullYear()} ShopEase. All rights reserved.
        </div>
      </div>
    </footer>
  );
}