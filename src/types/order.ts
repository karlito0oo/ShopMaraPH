export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  size: string;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Order {
  id: number;
  user_id: number;
  status: string;
  customer_name: string;
  instagram_username: string;
  address_line1: string;
  barangay: string;
  city: string;
  province: string;
  mobile_number: string;
  payment_method: string;
  payment_proof: string;
  total_amount: number;
  admin_notes: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  user?: User;
  shipping_fee?: number;
} 