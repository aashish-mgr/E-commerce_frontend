export interface Product {
  id: number;
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
  selected: boolean
}