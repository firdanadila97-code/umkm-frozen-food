export type UserRole = 'customer' | 'seller' | 'admin';
export type UserStatus = 'active' | 'suspended';
export type StoreVerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type ProductStatus = 'draft' | 'active' | 'out_of_stock' | 'archived';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'settlement' | 'expire' | 'cancel' | 'deny' | 'refund';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string | null;
  banner_url: string | null;
  city: string;
  province: string;
  address_detail: string;
  phone: string;
  whatsapp: string | null;
  nib_number: string | null;
  verification_status: StoreVerificationStatus;
  rejection_reason: string | null;
  is_featured: boolean;
  rating_avg: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
  owner?: Pick<Profile, 'id' | 'full_name' | 'email' | 'phone'>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  sku: string | null;
  weight_grams: number;
  min_order: number;
  status: ProductStatus;
  is_featured: boolean;
  sold_count: number;
  rating_avg: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  store?: Pick<Store, 'id' | 'name' | 'slug' | 'city' | 'province' | 'logo_url' | 'verification_status' | 'rating_avg' | 'phone' | 'whatsapp'>;
  category?: Pick<Category, 'id' | 'name' | 'slug'>;
  images?: ProductImage[];
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  postal_code: string;
  full_address: string;
  notes: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name_snapshot: string;
  product_image_snapshot: string | null;
  unit_price: number;
  weight_grams: number;
  quantity: number;
  total_price: number;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  midtrans_order_id: string;
  midtrans_transaction_id: string | null;
  snap_token: string | null;
  snap_redirect_url: string | null;
  payment_type: string | null;
  va_number: string | null;
  bank: string | null;
  gross_amount: number;
  status: PaymentStatus;
  paid_at: string | null;
  expired_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  store_id: string;
  address_snapshot: Address;
  courier_code: string;
  courier_service: string;
  tracking_number: string | null;
  subtotal: number;
  shipping_cost: number;
  service_fee: number;
  grand_total: number;
  status: OrderStatus;
  notes: string | null;
  cancelled_reason: string | null;
  created_at: string;
  updated_at: string;
  store?: Pick<Store, 'id' | 'name' | 'slug' | 'city' | 'phone' | 'whatsapp'>;
  customer?: Pick<Profile, 'id' | 'full_name' | 'email' | 'phone'>;
  items?: OrderItem[];
  payment?: Payment;
}

export interface Review {
  id: string;
  order_id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  user?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
  product?: Pick<Product, 'id' | 'name' | 'slug'>;
}

export interface ShippingOption {
  courierCode: 'jne' | 'sicepat' | 'jnt' | 'pos';
  courierName: string;
  service: string;
  description: string;
  etdDays: string;
  cost: number;
}
