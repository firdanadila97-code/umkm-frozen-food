-- ============================================================================
-- UMKM HUB - MIGRATION 00001: INITIAL SCHEMA, RELATIONSHIPS, INDEXES & TRIGGERS
-- PostgreSQL / Supabase
-- Timezone: Asia/Jakarta | Currency: IDR (numeric/bigint)
-- ============================================================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Enums for strict data integrity
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'seller', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('active', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE store_verification_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE product_status AS ENUM ('draft', 'active', 'out_of_stock', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'settlement', 'expire', 'cancel', 'deny', 'refund');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) >= 2),
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  status user_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Jakarta', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Jakarta', now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- ============================================================================
-- 2. STORES TABLE (UMKM Stores)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(trim(name)) >= 3),
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  banner_url TEXT,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  address_detail TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  nib_number TEXT, -- Nomor Induk Berusaha (optional UMKM verification)
  verification_status store_verification_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (rating_avg >= 0 AND rating_avg <= 5),
  total_reviews INTEGER NOT NULL DEFAULT 0 CHECK (total_reviews >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Jakarta', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Jakarta', now())
);

CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON public.stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_verification_status ON public.stores(verification_status);
CREATE INDEX IF NOT EXISTS idx_stores_city ON public.stores(city);

-- ============================================================================
-- 3. CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT NOT NULL DEFAULT 'Package',
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Jakarta', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Jakarta', now())
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active, sort_order);

-- ============================================================================
-- 4. PRODUCTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL CHECK (char_length(trim(name)) >= 3),
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price BIGINT NOT NULL CHECK (price >= 1000), -- Minimum Rp 1.000
  compare_at_price BIGINT CHECK (compare_at_price IS NULL OR compare_at_price >= price),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku TEXT,
  weight_grams INTEGER NOT NULL DEFAULT 250 CHECK (weight_grams > 0),
  min_order INTEGER NOT NULL DEFAULT 1 CHECK (min_order >= 1),
  status product_status NOT NULL DEFAULT 'active',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sold_count INTEGER NOT NULL DEFAULT 0 CHECK (sold_count >= 0),
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (rating_avg >= 0 AND rating_avg <= 5),
  review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Jakarta', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Jakarta', now())
);

CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_sold_count ON public.products(sold_count DESC);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- ============================================================================
-- 5. PRODUCT_IMAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Jakarta', now())
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id, sort_order);

-- ============================================================================
-- 6. ADDRESSES TABLE (Customer Delivery Addresses)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Rumah', -- Rumah, Kantor, Kos, dll.
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  full_address TEXT NOT NULL,
  notes TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Jakarta', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Jakarta', now())
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);

-- ============================================================================
-- 7. CARTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Jakarta', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Jakarta', now())
);

CREATE INDEX IF NOT EXISTS idx_carts_user_id ON public.carts(user_id);

-- ============================================================================
-- 8. CART_ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Jakarta', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Jakarta', now()),
  UNIQUE(cart_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);

-- ============================================================================
-- 9. ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE RESTRICT,
  address_snapshot JSONB NOT NULL, -- Immutable snapshot of delivery address at checkout time
  courier_code TEXT NOT NULL,      -- jne, sicepat, jnt, pos
  courier_service TEXT NOT NULL,   -- REG, YES, BEST, etc.
  tracking_number TEXT,
  subtotal BIGINT NOT NULL CHECK (subtotal >= 0),
  shipping_cost BIGINT NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  service_fee BIGINT NOT NULL DEFAULT 0 CHECK (service_fee >= 0),
  grand_total BIGINT NOT NULL CHECK (grand_total >= 0),
  status order_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  cancelled_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Jakarta', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Jakarta', now())
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON public.orders(store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- ============================================================================
-- 10. ORDER_ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name_snapshot TEXT NOT NULL,
  product_image_snapshot TEXT,
  unit_price BIGINT NOT NULL CHECK (unit_price >= 0),
  weight_grams INTEGER NOT NULL DEFAULT 250,
  quantity INTEGER NOT NULL CHECK (quantity >= 1),
  total_price BIGINT NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Jakarta', now())
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- ============================================================================
-- 11. PAYMENTS TABLE (Midtrans Integration Ready)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  midtrans_order_id TEXT NOT NULL UNIQUE,
  midtrans_transaction_id TEXT,
  snap_token TEXT,
  snap_redirect_url TEXT,
  payment_type TEXT, -- bank_transfer, qris, gopay, shopeepay, cstore
  va_number TEXT,
  bank TEXT,
  gross_amount BIGINT NOT NULL CHECK (gross_amount >= 0),
  status payment_status NOT NULL DEFAULT 'pending',
  raw_notification JSONB,
  paid_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Jakarta', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Jakarta', now())
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_midtrans_order_id ON public.payments(midtrans_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- ============================================================================
-- 12. REVIEWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL CHECK (char_length(trim(comment)) >= 5),
  is_verified_purchase BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Jakarta', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Jakarta', now()),
  UNIQUE(order_id, product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- A. Automatic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('Asia/Jakarta', now());
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles', 'stores', 'categories', 'products',
    'addresses', 'carts', 'cart_items', 'orders', 'payments', 'reviews'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I;', t, t);
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();',
      t, t
    );
  END LOOP;
END;
$$;

-- B. Automatic Profile & Cart creation when a user registers in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_role user_role;
  v_full_name TEXT;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  BEGIN
    v_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer');
  EXCEPTION WHEN OTHERS THEN
    v_role := 'customer';
  END;

  -- Never allow self-registration as admin via client metadata
  IF v_role = 'admin' THEN
    v_role := 'customer';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    NEW.raw_user_meta_data->>'phone',
    v_role
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.carts (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- C. Recalculate Product & Store Rating Averages on Review Insert/Update/Delete
CREATE OR REPLACE FUNCTION public.recalculate_product_and_store_ratings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_product_id UUID;
  v_store_id UUID;
BEGIN
  v_product_id := COALESCE(NEW.product_id, OLD.product_id);

  UPDATE public.products
  SET
    rating_avg = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM public.reviews WHERE product_id = v_product_id), 0),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE product_id = v_product_id)
  WHERE id = v_product_id
  RETURNING store_id INTO v_store_id;

  IF v_store_id IS NOT NULL THEN
    UPDATE public.stores
    SET
      rating_avg = COALESCE((
        SELECT ROUND(AVG(r.rating)::numeric, 2)
        FROM public.reviews r
        JOIN public.products p ON p.id = r.product_id
        WHERE p.store_id = v_store_id
      ), 0),
      total_reviews = (
        SELECT COUNT(*)
        FROM public.reviews r
        JOIN public.products p ON p.id = r.product_id
        WHERE p.store_id = v_store_id
      )
    WHERE id = v_store_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_reviews_rating_sync ON public.reviews;
CREATE TRIGGER trg_reviews_rating_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.recalculate_product_and_store_ratings();

-- D. Transactional Checkout Function (Prevents Stock Overselling & Client Price Tampering)
CREATE OR REPLACE FUNCTION public.create_checkout_order(
  p_user_id UUID,
  p_store_id UUID,
  p_address_id UUID,
  p_courier_code TEXT,
  p_courier_service TEXT,
  p_shipping_cost BIGINT,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_cart_id UUID;
  v_order_id UUID;
  v_order_number TEXT;
  v_address_snapshot JSONB;
  v_subtotal BIGINT := 0;
  v_service_fee BIGINT := 2000; -- Biaya layanan platform Rp 2.000
  v_grand_total BIGINT := 0;
  v_item RECORD;
BEGIN
  -- 1. Verify caller identity
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized checkout attempt';
  END IF;

  -- 2. Snapshot delivery address owned by user
  SELECT jsonb_build_object(
    'id', a.id,
    'label', a.label,
    'recipient_name', a.recipient_name,
    'phone', a.phone,
    'province', a.province,
    'city', a.city,
    'district', a.district,
    'postal_code', a.postal_code,
    'full_address', a.full_address,
    'notes', a.notes
  )
  INTO v_address_snapshot
  FROM public.addresses a
  WHERE a.id = p_address_id AND a.user_id = p_user_id;

  IF v_address_snapshot IS NULL THEN
    RAISE EXCEPTION 'Alamat pengiriman tidak ditemukan atau tidak valid';
  END IF;

  -- 3. Locate user's cart
  SELECT id INTO v_cart_id FROM public.carts WHERE user_id = p_user_id;
  IF v_cart_id IS NULL THEN
    RAISE EXCEPTION 'Keranjang belanja kosong';
  END IF;

  -- 4. Lock products in cart for this store and calculate subtotal from DB prices
  FOR v_item IN
    SELECT
      ci.id AS cart_item_id,
      ci.quantity,
      p.id AS product_id,
      p.name AS product_name,
      p.price,
      p.stock,
      p.status,
      p.weight_grams,
      (SELECT pi.image_url FROM public.product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) AS primary_image
    FROM public.cart_items ci
    JOIN public.products p ON p.id = ci.product_id
    WHERE ci.cart_id = v_cart_id AND p.store_id = p_store_id
    FOR UPDATE OF p
  LOOP
    IF v_item.status <> 'active' THEN
      RAISE EXCEPTION 'Produk "%" sedang tidak aktif', v_item.product_name;
    END IF;

    IF v_item.stock < v_item.quantity THEN
      RAISE EXCEPTION 'Stok produk "%" tidak mencukupi (tersisa: %)', v_item.product_name, v_item.stock;
    END IF;

    v_subtotal := v_subtotal + (v_item.price * v_item.quantity);
  END LOOP;

  IF v_subtotal = 0 THEN
    RAISE EXCEPTION 'Tidak ada produk dari toko ini di keranjang Anda';
  END IF;

  v_grand_total := v_subtotal + GREATEST(p_shipping_cost, 0) + v_service_fee;
  v_order_number := 'UMKM-' || to_char(timezone('Asia/Jakarta', now()), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 6));

  -- 5. Insert Order
  INSERT INTO public.orders (
    order_number,
    user_id,
    store_id,
    address_snapshot,
    courier_code,
    courier_service,
    subtotal,
    shipping_cost,
    service_fee,
    grand_total,
    status,
    notes
  )
  VALUES (
    v_order_number,
    p_user_id,
    p_store_id,
    v_address_snapshot,
    p_courier_code,
    p_courier_service,
    v_subtotal,
    GREATEST(p_shipping_cost, 0),
    v_service_fee,
    v_grand_total,
    'pending',
    p_notes
  )
  RETURNING id INTO v_order_id;

  -- 6. Insert Order Items, Deduct Stock, and Clear Purchased Items from Cart
  FOR v_item IN
    SELECT
      ci.id AS cart_item_id,
      ci.quantity,
      p.id AS product_id,
      p.name AS product_name,
      p.price,
      p.stock,
      p.weight_grams,
      (SELECT pi.image_url FROM public.product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) AS primary_image
    FROM public.cart_items ci
    JOIN public.products p ON p.id = ci.product_id
    WHERE ci.cart_id = v_cart_id AND p.store_id = p_store_id
  LOOP
    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name_snapshot,
      product_image_snapshot,
      unit_price,
      weight_grams,
      quantity,
      total_price
    )
    VALUES (
      v_order_id,
      v_item.product_id,
      v_item.product_name,
      v_item.primary_image,
      v_item.price,
      v_item.weight_grams,
      v_item.quantity,
      v_item.price * v_item.quantity
    );

    -- Deduct product stock and auto-mark out_of_stock if 0
    UPDATE public.products
    SET
      stock = stock - v_item.quantity,
      sold_count = sold_count + v_item.quantity,
      status = CASE WHEN (stock - v_item.quantity) <= 0 THEN 'out_of_stock'::product_status ELSE status END
    WHERE id = v_item.product_id;

    -- Remove from cart
    DELETE FROM public.cart_items WHERE id = v_item.cart_item_id;
  END LOOP;

  -- 7. Create Pending Payment Record for Midtrans Snap
  INSERT INTO public.payments (
    order_id,
    midtrans_order_id,
    gross_amount,
    status,
    expired_at
  )
  VALUES (
    v_order_id,
    v_order_number,
    v_grand_total,
    'pending',
    timezone('Asia/Jakarta', now()) + interval '24 hours'
  );

  RETURN v_order_id;
END;
$$;
