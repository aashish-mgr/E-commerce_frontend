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
  name: string;
  email: string;
  avatar: string;
}