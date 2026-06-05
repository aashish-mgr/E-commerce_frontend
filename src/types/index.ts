export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  emoji: string;
  rating: number;
  inStock: boolean;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
}