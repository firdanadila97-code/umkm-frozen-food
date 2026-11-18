'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { productSchema, storeSchema } from '@/schemas';
import { OrderStatus } from '@/types/database';
import { slugify } from '@/utils/format';

export async function upsertStoreAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { error: 'Database Supabase belum dikonfigurasi di .env.local.' };
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Silakan masuk terlebih dahulu.' };

  const parsed = storeSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    city: formData.get('city'),
    province: formData.get('province'),
    address_detail: formData.get('address_detail'),
    phone: formData.get('phone'),
    whatsapp: formData.get('whatsapp'),
    nib_number: formData.get('nib_number'),
    logo_url: formData.get('logo_url') || '',
    banner_url: formData.get('banner_url') || '',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { data: existingStore } = await supabase
    .from('stores')
    .select('id, slug')
    .eq('owner_id', user.id)
    .single();

  if (existingStore) {
    const { error } = await supabase
      .from('stores')
      .update({
        name: parsed.data.name,
        description: parsed.data.description,
        city: parsed.data.city,
        province: parsed.data.province,
        address_detail: parsed.data.address_detail,
        phone: parsed.data.phone,
        whatsapp: parsed.data.whatsapp || null,
        nib_number: parsed.data.nib_number || null,
        logo_url: parsed.data.logo_url || null,
        banner_url: parsed.data.banner_url || null,
      })
      .eq('id', existingStore.id)
      .eq('owner_id', user.id);

    if (error) return { error: error.message };
  } else {
    const uniqueSlug = `${slugify(parsed.data.name)}-${Math.random().toString(36).substring(2, 6)}`;
    const { error } = await supabase.from('stores').insert({
      owner_id: user.id,
      name: parsed.data.name,
      slug: uniqueSlug,
      description: parsed.data.description,
      city: parsed.data.city,
      province: parsed.data.province,
      address_detail: parsed.data.address_detail,
      phone: parsed.data.phone,
      whatsapp: parsed.data.whatsapp || null,
      nib_number: parsed.data.nib_number || null,
      logo_url: parsed.data.logo_url || null,
      banner_url: parsed.data.banner_url || null,
      verification_status: 'pending',
    });

    if (error) return { error: error.message };

    // Upgrade customer role to seller if not already
    await supabase.from('profiles').update({ role: 'seller' }).eq('id', user.id);
  }

  revalidatePath('/seller/store');
  revalidatePath('/seller');
  return {
    success: true,
    message: existingStore
      ? 'Profil toko UMKM berhasil diperbarui.'
      : 'Toko UMKM berhasil dibuat dan sedang menunggu verifikasi Admin.',
  };
}

export async function createOrUpdateProductAction(formData: FormData, productId?: string) {
  if (!isSupabaseConfigured()) {
    return { error: 'Database Supabase belum dikonfigurasi di .env.local.' };
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Silakan masuk terlebih dahulu.' };

  const { data: store } = await supabase
    .from('stores')
    .select('id, verification_status')
    .eq('owner_id', user.id)
    .single();

  if (!store) {
    return { error: 'Anda belum memiliki toko UMKM. Silakan lengkapi profil toko terlebih dahulu.' };
  }

  const rawImages = (formData.get('image_urls')?.toString() || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const parsed = productSchema.safeParse({
    name: formData.get('name'),
    category_id: formData.get('category_id'),
    description: formData.get('description'),
    price: formData.get('price'),
    compare_at_price: formData.get('compare_at_price'),
    stock: formData.get('stock'),
    sku: formData.get('sku'),
    weight_grams: formData.get('weight_grams'),
    min_order: formData.get('min_order') || 1,
    status: formData.get('status') || 'active',
    image_urls: rawImages,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  let targetProductId = productId;

  if (productId) {
    // Verify ownership strictly on the backend
    const { data: existing } = await supabase
      .from('products')
      .select('id, store_id')
      .eq('id', productId)
      .eq('store_id', store.id)
      .single();

    if (!existing) {
      return { error: 'Anda tidak memiliki akses untuk mengubah produk ini.' };
    }

    const { error } = await supabase
      .from('products')
      .update({
        name: parsed.data.name,
        category_id: parsed.data.category_id,
        description: parsed.data.description,
        price: parsed.data.price,
        compare_at_price: parsed.data.compare_at_price,
        stock: parsed.data.stock,
        sku: parsed.data.sku || null,
        weight_grams: parsed.data.weight_grams,
        min_order: parsed.data.min_order,
        status: parsed.data.stock === 0 ? 'out_of_stock' : parsed.data.status,
      })
      .eq('id', productId)
      .eq('store_id', store.id);

    if (error) return { error: error.message };

    // Replace product images
    await supabase.from('product_images').delete().eq('product_id', productId);
  } else {
    const slug = `${slugify(parsed.data.name)}-${Math.random().toString(36).substring(2, 6)}`;
    const { data: created, error } = await supabase
      .from('products')
      .insert({
        store_id: store.id,
        category_id: parsed.data.category_id,
        name: parsed.data.name,
        slug,
        description: parsed.data.description,
        price: parsed.data.price,
        compare_at_price: parsed.data.compare_at_price,
        stock: parsed.data.stock,
        sku: parsed.data.sku || null,
        weight_grams: parsed.data.weight_grams,
        min_order: parsed.data.min_order,
        status: parsed.data.stock === 0 ? 'out_of_stock' : parsed.data.status,
      })
      .select('id')
      .single();

    if (error || !created) return { error: error?.message || 'Gagal menyimpan produk.' };
    targetProductId = created.id;
  }

  if (targetProductId) {
    const imageRows = parsed.data.image_urls.map((url, idx) => ({
      product_id: targetProductId!,
      image_url: url,
      alt_text: parsed.data.name,
      is_primary: idx === 0,
      sort_order: idx + 1,
    }));
    await supabase.from('product_images').insert(imageRows);
  }

  revalidatePath('/seller/products');
  revalidatePath('/marketplace');
  return {
    success: true,
    message: productId ? 'Produk berhasil diperbarui.' : 'Produk baru berhasil ditambahkan.',
  };
}

export async function archiveOrDeleteProductAction(productId: string, mode: 'archive' | 'delete') {
  if (!isSupabaseConfigured()) return { error: 'Supabase belum dikonfigurasi.' };

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!store) return { error: 'Toko tidak ditemukan.' };

  if (mode === 'archive') {
    const { error } = await supabase
      .from('products')
      .update({ status: 'archived' })
      .eq('id', productId)
      .eq('store_id', store.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('store_id', store.id);
    if (error) {
      // Fallback to archive if product is referenced in historical order_items
      await supabase
        .from('products')
        .update({ status: 'archived' })
        .eq('id', productId)
        .eq('store_id', store.id);
      revalidatePath('/seller/products');
      return {
        success: true,
        message: 'Produk memiliki riwayat pesanan dan telah diarsipkan.',
      };
    }
  }

  revalidatePath('/seller/products');
  revalidatePath('/marketplace');
  return {
    success: true,
    message: mode === 'archive' ? 'Produk berhasil diarsipkan.' : 'Produk berhasil dihapus.',
  };
}

export async function updateSellerOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
  trackingNumber?: string
) {
  if (!isSupabaseConfigured()) return { error: 'Supabase belum dikonfigurasi.' };

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('owner_id', user.id)
    .single();
  if (!store) return { error: 'Toko tidak ditemukan.' };

  const updatePayload: { status: OrderStatus; tracking_number?: string } = {
    status: newStatus,
  };
  if (trackingNumber && trackingNumber.trim()) {
    updatePayload.tracking_number = trackingNumber.trim();
  }

  const { error } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', orderId)
    .eq('store_id', store.id);

  if (error) return { error: error.message };

  revalidatePath('/seller/orders');
  revalidatePath('/customer/orders');
  return { success: true, message: 'Status pesanan berhasil diperbarui.' };
}
