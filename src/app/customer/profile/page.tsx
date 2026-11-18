import React from 'react';
import { revalidatePath } from 'next/cache';
import { getCurrentUserProfile } from '@/features/auth/actions';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';

export default async function CustomerProfilePage() {
  const profile = await getCurrentUserProfile();

  async function updateProfile(formData: FormData) {
    'use server';
    if (!isSupabaseConfigured()) return;
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .update({
        full_name: String(formData.get('full_name') || '').trim(),
        phone: String(formData.get('phone') || '').trim(),
      })
      .eq('id', user.id);

    revalidatePath('/customer/profile');
    revalidatePath('/', 'layout');
  }

  return (
    <div className="surface-card p-6">
      <h1 className="text-xl font-extrabold text-slate-900">Pengaturan Profil Akun</h1>
      <p className="mt-1 text-sm text-slate-600">
        Perbarui informasi nama lengkap dan nomor WhatsApp aktif Anda
      </p>

      <form action={updateProfile} className="mt-6 max-w-lg space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700">Alamat Email</label>
          <input
            type="email"
            disabled
            value={profile?.email || 'pembeli@umkmhub.id'}
            className="input-field mt-1.5"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700">Nama Lengkap</label>
          <input
            type="text"
            name="full_name"
            required
            defaultValue={profile?.full_name || 'Budi Santoso'}
            className="input-field mt-1.5"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700">Nomor WhatsApp / Telepon</label>
          <input
            type="tel"
            name="phone"
            defaultValue={profile?.phone || '081299887766'}
            className="input-field mt-1.5"
          />
        </div>

        <button type="submit" className="btn-primary">
          Simpan Perubahan Profil
        </button>
      </form>
    </div>
  );
}
