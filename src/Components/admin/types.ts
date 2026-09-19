export interface SalesPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface AdminStats {
  totalUsers: number;
  totalVendors: number;
  totalCustomers: number;
  totalAdmins: number;
  totalProducts: number;
  totalOrders: number;
  totalCategories: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  lowStockProducts: number;
  totalRevenue: number;
  salesTrend: SalesPoint[];
  recentOrders: AdminOrder[];
  recentUsers: AdminUser[];
}

export interface AdminUser {
  id: string;
  userName: string;
  userEmail: string;
  userRole: string;
  provider: string;
  avatar?: string | null;
  createdAt: string;
}

export interface AdminProduct {
  id: string;
  productName: string;
  productDescription: string;
  productPrice: string;
  image: string;
  stock: number;
  categoryId: string;
  createdAt: string;
  User?: {
    id: string;
    userName: string;
    userEmail: string;
  };
  Category?: {
    id: string;
    categoryName: string;
  };
}

export interface AdminOrder {
  id: string;
  shippingAddress: string;
  phoneNumber: string;
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
  Payment?: {
    id: string;
    paymentMethod: string;
    paymentStatus: string;
    pidx?: string | null;
  };
  OrderDetails?: {
    id: string;
    quantity: number;
    Product?: {
      id: string;
      productName: string;
      productPrice: string;
      image: string;
      stock: number;
    };
  }[];
  User?: {
    id: string;
    userName: string;
    userEmail: string;
  };
}

export const roleStyles: Record<string, string> = {
  admin: "bg-purple-50 text-purple-700 border border-purple-200",
  vendor: "bg-blue-50 text-blue-700 border border-blue-200",
  customer: "bg-gray-100 text-gray-600 border border-gray-200",
};