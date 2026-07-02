export interface Product {
  id: string;
  productName: string;
  productPrice: number;
  productDescription: string;
  image: string;
  Category: Category;
}
export interface Category {
  categoryName: string;
}

export interface User {
  userName: string;
  userEmail: string;
  userRole: string;
}

export interface Cart {
  Product: Product,
  id: string,
  quantity: number,
  selected: boolean,
  productId: string
}

export type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled";


export interface Order {
  id: string,
  shippingAddress: string,
  phoneNumber: number,
  totalAmount: number,
  orderStatus: string,
  createdAt: string,
  OrderDetails: OrderItem[],

}

export interface OrderItem {
  id: string,
  quantity: number,
  orderId: string,
  Product: Product
}

export enum STATUS {
    Idle = "idle",
    Loading = "loading",
    Success = "success",
    Error = "error"
}