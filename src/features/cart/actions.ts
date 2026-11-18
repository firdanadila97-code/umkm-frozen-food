'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { CartItem } from '@/types/database';

export async function getUserCartItems(): Promise<CartItem[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!cart) return [];

  const { data: items } = await supabase
    .from('cart_items')
    .select(
      `
      *,
      product:products(
        *,
        store:stores(id, name, slug, city, province, verification_status),
        images:product_images(id, image_url, is_primary, sort_order)
      )
    `
    )
    .eq('cart_id', cart.id)
    .order('created_at', { ascending: false });

  return (items as unknown as CartItem[]) || [];
}

export async function addToCartAction(productId: string, quantity = 1) {
  if (!isSupabaseConfigured()) {
    return {
      error:
        'Database Supabase belum terhubung (.env.local). Silakan hubungkan proyek Supabase Anda untuk menyimpan keranjang.',
    };
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Silakan masuk terlebih dahulu untuk menambahkan produk ke keranjang.' };
  }

  // Validate product availability and stock
  const { data: product, error: prodErr } = await supabase
    .from('products')
    .select('id, name, stock, status, min_order')
    .eq('id', productId)
    .single();

  if (prodErr || !product) {
    return { error: 'Produk tidak ditemukan.' };
  }

  if (product.status !== 'active' || product.stock < quantity) {
    return { error: `Stok produk "${product.name}" tidak mencukupi.` };
  }

  // Ensure user has a cart
  let { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!cart) {
    const { data: newCart, error: createCartErr } = await supabase
      .from('carts')
      .insert({ user_id: user.id })
      .select('id')
      .single();
    if (createCartErr || !newCart) {
      return { error: 'Gagal membuat keranjang belanja.' };
    }
    cart = newCart;
  }

  // Check if item already exists in cart
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cart.id)
    .eq('product_id', productId)
    .single();

  const newQty = (existingItem?.quantity || 0) + Math.max(1, quantity);
  if (newQty > product.stock) {
    return {
      error: `Jumlah di keranjang melebihi stok tersedia (${product.stock} tersisa).`,
    };
  }

  if (existingItem) {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQty })
      .eq('id', existingItem.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from('cart_items').insert({
      cart_id: cart.id,
      product_id: productId,
      quantity: Math.max(product.min_order || 1, quantity),
    });
    if (error) return { error: error.message };
  }

  revalidatePath('/cart');
  revalidatePath('/', 'layout');
  return { success: true, message: `"${product.name}" berhasil ditambahkan ke keranjang.` };
}

export async function updateCartItemQuantityAction(cartItemId: string, quantity: number) {
  if (!isSupabaseConfigured()) return { error: 'Supabase belum dikonfigurasi.' };

  const supabase = createServerSupabaseClient();
  if (quantity <= 0) {
    const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
    if (error) return { error: error.message };
    revalidatePath('/cart');
    return { success: true };
  }

  const { data: item } = await supabase
    .from('cart_items')
    .select('id, product:products(stock, name)')
    .eq('id', cartItemId)
    .single();

  const prod = item?.product as unknown as { stock: number; name: string } | undefined;
  if (prod && quantity > prod.stock) {
    return { error: `Maksimal stok "${prod.name}" adalah ${prod.stock} unit.` };
  }

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId);

  if (error) return { error: error.message };
  revalidatePath('/cart');
  return { success: true };
}

export async function removeCartItemAction(cartItemId: string) {
  if (!isSupabaseConfigured()) return { error: 'Supabase belum dikonfigurasi.' };

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
  if (error) return { error: error.message };

  revalidatePath('/cart');
  revalidatePath('/', 'layout');
  return { success: true };
}
