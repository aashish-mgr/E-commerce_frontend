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
}

export type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled";

// export interface OrderItem {
//   id: number;
//   name: string;
//   emoji: string;
//   price: number;
//   quantity: number;
// }

//  export interface Order {
//   id: string;
//   date: string;
//   status: OrderStatus;
//   items: OrderItem[];
// }


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
