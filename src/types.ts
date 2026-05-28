export interface Product {
  id: number;
  category: 'acoustic' | 'electric' | 'bass' | 'ukulele' | 'accessory';
  title: string;
  price: number;
  old_price?: number | null; // using snake_case to match typical database schemas
  rating: number;
  reviews: number;
  badge?: 'sale' | 'new' | null;
  emoji: string;
  brand: string;
  specs: Record<string, string | number | boolean>;
  description: string;
  image_class?: string;
}

export interface CartItem {
  id?: string;
  user_id?: string;
  product_id: number;
  qty: number;
  created_at?: string;
}

export interface Order {
  id: string | number;
  user_id?: string;
  created_at?: string;
  date: string;
  items: {
    product_id: number;
    qty: number;
    title: string;
    price: number;
  }[];
  total: number;
  status: 'processing' | 'delivered';
}

export interface Profile {
  id?: string;
  name: string;
  avatar: string;
  email?: string;
}

export interface Favorite {
  user_id: string;
  product_id: number;
}
