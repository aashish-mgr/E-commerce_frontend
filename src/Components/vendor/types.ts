export interface Category {
  id: string;
  categoryName: string;
}

export interface VendorProduct {
  id: string;
  productName: string;
  productDescription: string;
  productPrice: string;
  image: string;
  categoryId: string;
  stock: number;
  Category?: Category;
}

export interface VendorOrderDetail {
  id: string;
  quantity: number;
  Product: {
    id: string;
    productName: string;
    productPrice: string;
    image: string;
    stock: number;
  };
  Order: {
    id: string;
    shippingAddress: string;
    phoneNumber: string;
    totalAmount: number;
    orderStatus: string;
    userId: string;
    createdAt: string;
    Payment?: {
      id: string;
      paymentMethod: string;
      paymentStatus: string;
    };
    User?: {
      id: string;
      userName: string;
      userEmail: string;
    };
  };
}

export const emptyProductForm = {
  productName: "",
  productDescription: "",
  productPrice: "",
  categoryId: "",
  stock: 0,
};

export type ProductForm = typeof emptyProductForm;

export const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  shipped: "bg-blue-50 text-blue-700 border border-blue-200",
  delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border border-red-200",
};

export const paymentStyles: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  unpaid: "bg-gray-100 text-gray-600 border border-gray-200",
};