export interface VendorStats {
  productCount: number;
  orderCount: number;
  revenue: number;
  pendingCount: number;
}

export default function VendorOverview({ stats }: { stats: VendorStats }) {
  const cards = [
    {
      label: "Total Products",
      value: stats.productCount,
      icon: (
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      ),
      bgLight: "bg-indigo-50",
      textColor: "text-indigo-600",
    },
    {
      label: "Total Orders",
      value: stats.orderCount,
      icon: (
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      ),
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Revenue",
      value: `Rs. ${stats.revenue.toLocaleString("en-NP", { minimumFractionDigits: 2 })}`,
      icon: (
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      ),
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      label: "Pending Orders",
      value: stats.pendingCount,
      icon: (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </>
      ),
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${card.bgLight} ${card.textColor} flex items-center justify-center flex-shrink-0`}>
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                {card.icon}
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{card.label}</p>
              <p className="text-xl font-bold text-gray-900 truncate">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}