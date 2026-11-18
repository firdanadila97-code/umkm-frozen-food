-- ============================================================================
-- UMKM HUB - MIGRATION 00002: ROW LEVEL SECURITY (RLS) POLICIES & STORAGE
-- Enforces Customer, Seller, and Admin permissions at the PostgreSQL layer
-- ============================================================================

-- Helper functions for role & ownership verification
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND status = 'active'
  );
$$;

-- Enable RLS across all 12 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 1. PROFILES POLICIES
-- ============================================================================
CREATE POLICY "Public profiles basic info visible to everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile (except role/status)"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id AND public.is_active_user())
  WITH CHECK (
    auth.uid() = id
    AND (
      role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
      OR (role = 'seller' AND (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) = 'customer')
    )
    AND status = (SELECT p.status FROM public.profiles p WHERE p.id = auth.uid())
  );

CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- 2. STORES POLICIES
-- ============================================================================
CREATE POLICY "Approved stores are viewable by everyone, owners and admins see all"
  ON public.stores FOR SELECT
  USING (
    verification_status = 'approved'
    OR owner_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY "Authenticated active users can create their own store"
  ON public.stores FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    AND public.is_active_user()
  );

CREATE POLICY "Store owners can update their own store profile"
  ON public.stores FOR UPDATE
  USING (auth.uid() = owner_id AND public.is_active_user())
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all stores"
  ON public.stores FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- 3. CATEGORIES POLICIES
-- ============================================================================
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Only admins can insert, update, or delete categories"
  ON public.categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- 4. PRODUCTS POLICIES
-- ============================================================================
CREATE POLICY "Active products from approved stores are public; sellers & admins see theirs"
  ON public.products FOR SELECT
  USING (
    (
      status IN ('active', 'out_of_stock')
      AND EXISTS (
        SELECT 1 FROM public.stores s
        WHERE s.id = products.store_id AND s.verification_status = 'approved'
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.id = products.store_id AND s.owner_id = auth.uid()
    )
    OR public.is_admin()
  );

CREATE POLICY "Sellers can insert products only into their own store"
  ON public.products FOR INSERT
  WITH CHECK (
    public.is_active_user()
    AND EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.id = store_id AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can update only their own store products"
  ON public.products FOR UPDATE
  USING (
    public.is_active_user()
    AND EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.id = products.store_id AND s.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.id = store_id AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can delete only their own store products"
  ON public.products FOR DELETE
  USING (
    public.is_active_user()
    AND EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.id = products.store_id AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all products"
  ON public.products FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- 5. PRODUCT_IMAGES POLICIES
-- ============================================================================
CREATE POLICY "Product images are viewable by everyone"
  ON public.product_images FOR SELECT
  USING (true);

CREATE POLICY "Sellers can manage images for their own products"
  ON public.product_images FOR ALL
  USING (
    public.is_active_user()
    AND EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.stores s ON s.id = p.store_id
      WHERE p.id = product_images.product_id AND s.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.stores s ON s.id = p.store_id
      WHERE p.id = product_id AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all product images"
  ON public.product_images FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- 6. ADDRESSES POLICIES
-- ============================================================================
CREATE POLICY "Users can manage only their own addresses"
  ON public.addresses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 7. CARTS & CART_ITEMS POLICIES
-- ============================================================================
CREATE POLICY "Users can view and manage only their own cart"
  ON public.carts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage items only in their own cart"
  ON public.cart_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_id AND c.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 8. ORDERS & ORDER_ITEMS POLICIES
-- ============================================================================
CREATE POLICY "Customers see own orders; Sellers see store orders; Admins see all"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.id = orders.store_id AND s.owner_id = auth.uid()
    )
    OR public.is_admin()
  );

CREATE POLICY "Sellers can update order status & tracking for their own store orders"
  ON public.orders FOR UPDATE
  USING (
    public.is_active_user()
    AND EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.id = orders.store_id AND s.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.id = store_id AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY "Customers can cancel their own pending orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'cancelled');

CREATE POLICY "Admins can manage all orders"
  ON public.orders FOR ALL
  USING (public.is_admin());

CREATE POLICY "Order items visible to order owner, store owner, and admin"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      LEFT JOIN public.stores s ON s.id = o.store_id
      WHERE o.id = order_items.order_id
        AND (o.user_id = auth.uid() OR s.owner_id = auth.uid() OR public.is_admin())
    )
  );

-- ============================================================================
-- 9. PAYMENTS POLICIES (Read-only for clients; written via RPC & Server Webhook)
-- ============================================================================
CREATE POLICY "Payments visible to order customer, store seller, and admin"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      LEFT JOIN public.stores s ON s.id = o.store_id
      WHERE o.id = payments.order_id
        AND (o.user_id = auth.uid() OR s.owner_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Admins can view and manage payments"
  ON public.payments FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- 10. REVIEWS POLICIES
-- ============================================================================
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Customers can submit reviews only for delivered orders they own"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.order_items oi ON oi.order_id = o.id
      WHERE o.id = order_id
        AND o.user_id = auth.uid()
        AND o.status = 'delivered'
        AND oi.product_id = reviews.product_id
    )
  );

CREATE POLICY "Users can update or delete their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can moderate reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- ============================================================================
-- 11. SUPABASE STORAGE BUCKETS & POLICIES
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('products', 'products', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('stores', 'stores', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for marketplace media"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('products', 'stores', 'avatars'));

CREATE POLICY "Authenticated users can upload marketplace media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND bucket_id IN ('products', 'stores', 'avatars')
  );

CREATE POLICY "Users can update or delete their own uploaded media"
  ON storage.objects FOR UPDATE
  USING (auth.uid() = owner);

CREATE POLICY "Users can delete their own uploaded media"
  ON storage.objects FOR DELETE
  USING (auth.uid() = owner);
