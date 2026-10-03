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
  pending: "bg-marigold-soft text-amber",
  shipped: "bg-sky-soft text-sky",
  delivered: "bg-pine-soft text-pine",
  cancelled: "bg-crimson-soft text-crimson",
};

export const paymentStyles: Record<string, string> = {
  paid: "bg-pine-soft text-pine",
  unpaid: "bg-paper-2 text-muted",
};

export const statusTones = {
  pending: "pending",
  shipped: "shipped",
  delivered: "delivered",
  cancelled: "cancelled",
} as const;

export const paymentTones = {
  paid: "delivered",
  unpaid: "unpaid",
} as const;

export type StatusTone = (typeof statusTones)[keyof typeof statusTones];
export type PaymentTone = (typeof paymentTones)[keyof typeof paymentTones];