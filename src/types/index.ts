export type OrderStatus = 'new' | 'preparing' | 'ready' | 'on_the_way' | 'delivered';

export interface Category {
  id: string;
  name: string;
  sort_order?: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category_id?: string;
  image_url?: string;
  is_active?: boolean;
  size_options?: { name: string; price: number }[];
  addon_options?: { name: string; price: number }[];
}

export interface Deal {
  id: string;
  title: string;
  price: number;
  image_url?: string;
  is_active?: boolean;
  deal_items?: { product_id: string; product_name?: string; qty: number }[];
}

export interface Order {
  id: string;
  user_id?: string | null;
  customer_name: string;
  phone: string;
  address: string;
  status: OrderStatus;
  total_price: number;
  rider_id?: string;
  notes?: string;
  created_at: string;
  order_items?: OrderItem[];
  rating_stars?: number | null;
  rating_delivery?: number | null;
  rating_quality?: number | null;
  rating_comment?: string | null;
  rated_at?: string | null;
  ready_at?: string | null;
  delivered_at?: string | null;
  payment_received_at?: string | null;
  distance_km?: number | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  deal_id?: string;
  qty: number;
  price: number;
  item_name?: string;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  status: 'active' | 'inactive';
  pin?: string | null;
}

export interface CartItem {
  product_id?: string;
  deal_id?: string;
  name: string;
  price: number;
  qty: number;
  size?: string;
  addons?: string[];
  notes?: string;
}
