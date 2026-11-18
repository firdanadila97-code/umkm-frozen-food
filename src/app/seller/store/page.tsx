'use client';

import React, { useState, useTransition } from 'react';
import { Store as StoreIcon, Upload } from 'lucide-react';
import { upsertStoreAction } from '@/features/seller/actions';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';

export default function SellerStoreSettingsPage() {
  const [isPending, startTransition] = useTransition();
  const [logoUrl, setLogoUrl] = useState(
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80'
  );
  const [bannerUrl, setBannerUrl] = useState(
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=80'
  );
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const handleStorageUpload = async (
    file: File,
    target: 'logo' | 'banner'
  ) => {
    if (!isSupabaseConfigured()) {
      showToast('Hubungkan Supabase Storage di .env.local untuk mengunggah file langsung.', 'info');
      return;
    }
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const filePath = `${target}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('stores').upload(filePath, file, {
        upsert: true,
      });
      if (error) {
        showToast(error.message, 'error');
        return;
      }
      const { data } = supabase.storage.from('stores').getPublicUrl(filePath);
      if (target === 'logo') setLogoUrl(data.publicUrl);
      else setBannerUrl(data.publicUrl);
      showToast(`Gambar ${target} berhasil diunggah ke Supabase Storage!`, 'success');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('logo_url', logoUrl);
    formData.set('banner_url', bannerUrl);

    startTransition(async () => {
      const res = await upsertStoreAction(formData);
      if (res.error) showToast(res.error, 'error');
      else if (res.message) showToast(res.message, 'success');
    });
  };

  return (
    <div className="surface-card p-6 sm:p-8">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-800">
          <StoreIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Profil & Identitas Toko UMKM
          </h1>
          <p className="text-xs text-slate-500">
            Kelola informasi toko, lokasi pengiriman asal, nomor WhatsApp, serta logo & banner
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700">
              Nama Toko UMKM *
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue="Roastery Kopi Gayo Lestari"
              placeholder="Contoh: Galeri Batik Tulis Sekar Lasem"
              className="input-field mt-1.5"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">
              Nomor Induk Berusaha / NIB (Opsional)
            </label>
            <input
              type="text"
              name="nib_number"
              defaultValue="9120301847291"
              placeholder="13 digit NIB OSS untuk lencana Terverifikasi"
              className="input-field mt-1.5"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700">
            Deskripsi & Cerita Singkat UMKM *
          </label>
          <textarea
            name="description"
            required
            rows={3}
            defaultValue="Koperasi petani dan penyangrai kopi Arabika Gayo organik langsung dari dataran tinggi Takengon, Aceh Tengah."
            className="input-field mt-1.5"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700">
              Provinsi Asal Pengiriman *
            </label>
            <select name="province" defaultValue="Aceh" className="input-field mt-1.5">
              <option value="DKI Jakarta">DKI Jakarta</option>
              <option value="Jawa Barat">Jawa Barat</option>
              <option value="Jawa Tengah">Jawa Tengah</option>
              <option value="DI Yogyakarta">DI Yogyakarta</option>
              <option value="Jawa Timur">Jawa Timur</option>
              <option value="Aceh">Aceh</option>
              <option value="Sumatera Utara">Sumatera Utara</option>
              <option value="Bali">Bali</option>
              <option value="Nusa Tenggara Barat">Nusa Tenggara Barat</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">
              Kota / Kabupaten *
            </label>
            <input
              type="text"
              name="city"
              required
              defaultValue="Takengon"
              className="input-field mt-1.5"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700">
            Alamat Lengkap Workshop / Toko *
          </label>
          <input
            type="text"
            name="address_detail"
            required
            defaultValue="Jl. Lebe Kader No. 45, Kec. Bebesen, Kabupaten Aceh Tengah"
            className="input-field mt-1.5"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700">
              Nomor Telepon Toko *
            </label>
            <input
              type="tel"
              name="phone"
              required
              defaultValue="08126000221"
              className="input-field mt-1.5"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">
              Nomor WhatsApp Bisnis (Awali 62)
            </label>
            <input
              type="tel"
              name="whatsapp"
              defaultValue="628126000221"
              className="input-field mt-1.5"
            />
          </div>
        </div>

        {/* Logo & Banner Upload / URL */}
        <div className="grid grid-cols-1 gap-6 border-t border-slate-100 pt-5 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700">Logo Toko UMKM</label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className="input-field mt-1.5 text-xs"
            />
            <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-brand-800 hover:underline">
              <Upload className="h-3.5 w-3.5" />
              <span>{uploading ? 'Mengunggah...' : 'Unggah File ke Supabase Storage'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleStorageUpload(f, 'logo');
                }}
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Banner Sampul Toko</label>
            <input
              type="url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://..."
              className="input-field mt-1.5 text-xs"
            />
            <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-brand-800 hover:underline">
              <Upload className="h-3.5 w-3.5" />
              <span>{uploading ? 'Mengunggah...' : 'Unggah Banner ke Supabase Storage'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleStorageUpload(f, 'banner');
                }}
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button type="submit" disabled={isPending} className="btn-primary px-6 py-3">
            {isPending ? 'Menyimpan...' : 'Simpan Pengaturan Toko'}
          </button>
        </div>
      </form>
    </div>
  );
}
