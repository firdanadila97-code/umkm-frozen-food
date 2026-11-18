'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { categorySchema } from '@/schemas';
import { StoreVerificationStatus, UserStatus } from '@/types/database';
import { slugify } from '@/utils/format';

async function requireAdmin() {
  if (!isSupabaseConfigured()) {
    throw new Error('Database Supabase belum dikonfigurasi di .env.local.');
  }
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin' || profile.status !== 'active') {
    throw new Error('Akses ditolak: Hanya Administrator aktif yang diizinkan.');
  }

  return supabase;
}

export async function toggleUserStatusAction(targetUserId: string, status: UserStatus) {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', targetUserId);

    if (error) return { error: error.message };
    revalidatePath('/admin/users');
    return {
      success: true,
      message: `Status akun pengguna berhasil diubah menjadi ${status === 'active' ? 'Aktif' : 'Ditangguhkan'}.`,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan.' };
  }
}

export async function verifyStoreAction(
  storeId: string,
  verificationStatus: StoreVerificationStatus,
  rejectionReason?: string
) {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase
      .from('stores')
      .update({
        verification_status: verificationStatus,
        rejection_reason: verificationStatus === 'rejected' ? rejectionReason || 'Dokumen belum lengkap' : null,
      })
      .eq('id', storeId);

    if (error) return { error: error.message };
    revalidatePath('/admin/stores');
    revalidatePath('/marketplace');
    return {
      success: true,
      message: `Status verifikasi toko berhasil diubah menjadi ${verificationStatus.toUpperCase()}.`,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan.' };
  }
}

export async function upsertCategoryAction(formData: FormData, categoryId?: string) {
  try {
    const supabase = await requireAdmin();
    const parsed = categorySchema.safeParse({
      name: formData.get('name'),
      description: formData.get('description'),
      icon_name: formData.get('icon_name') || 'Package',
      image_url: formData.get('image_url') || '',
      is_active: formData.get('is_active') !== 'false',
      sort_order: formData.get('sort_order') || 0,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const slug = slugify(parsed.data.name);

    if (categoryId) {
      const { error } = await supabase
        .from('categories')
        .update({
          ...parsed.data,
          slug,
        })
        .eq('id', categoryId);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase.from('categories').insert({
        ...parsed.data,
        slug,
      });
      if (error) return { error: error.message };
    }

    revalidatePath('/admin/categories');
    revalidatePath('/marketplace');
    revalidatePath('/');
    return { success: true, message: 'Kategori berhasil disimpan.' };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan.' };
  }
}

export async function moderateProductStatusAction(
  productId: string,
  status: 'active' | 'archived'
) {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase
      .from('products')
      .update({ status })
      .eq('id', productId);

    if (error) return { error: error.message };
    revalidatePath('/admin/products');
    revalidatePath('/marketplace');
    return { success: true, message: 'Status produk berhasil diperbarui oleh Admin.' };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan.' };
  }
}
