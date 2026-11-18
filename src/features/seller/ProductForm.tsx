'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { Category, Product } from '@/types/database';
import { createOrUpdateProductAction } from '@/features/seller/actions';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';

interface ProductFormProps {
  categories: Category[];
  initialProduct?: Product | null;
}

export function ProductForm({ categories, initialProduct }: ProductFormProps) {
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [imageUrlsText, setImageUrlsText] = useState(
    initialProduct?.images?.map((i) => i.image_url).join('\n') ||
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80'
  );
  const router = useRouter();
  const { showToast } = useToast();

  const handleUploadImage = async (file: File) => {
    if (!isSupabaseConfigured()) {
      showToast('Hubungkan Supabase Storage di .env.local untuk mengunggah foto langsung.', 'info');
      return;
    }
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const filePath = `prod-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('products').upload(filePath, file);
      if (error) {
        showToast(error.message, 'error');
        return;
      }
      const { data } = supabase.storage.from('products').getPublicUrl(filePath);
      setImageUrlsText((prev) => (prev ? `${prev}\n${data.publicUrl}` : data.publicUrl));
      showToast('Foto produk berhasil ditambahkan!', 'success');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('image_urls', imageUrlsText);

    startTransition(async () => {
      const res = await createOrUpdateProductAction(formData, initialProduct?.id);
      if (res.error) {
        showToast(res.error, 'error');
        return;
      }
      if (res.message) {
        showToast(res.message, 'success');
      }
      router.push('/seller/products');
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="surface-card space-y-5 p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700">Nama Produk UMKM *</label>
          <input
            type="text"
            name="name"
            required
            defaultValue={initialProduct?.name || ''}
            placeholder="Contoh: Kopi Arabika Aceh Gayo Wine Process 250g"
            className="input-field mt-1.5"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700">Kategori *</label>
          <select
            name="category_id"
            required
            defaultValue={initialProduct?.category_id || categories[0]?.id}
            className="input-field mt-1.5"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700">
          Deskripsi Lengkap Produk *
        </label>
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={initialProduct?.description || ''}
          placeholder="Jelaskan bahan baku, keunggulan, ukuran, cara penyimpanan, dan sertifikasi halal/PIRT..."
          className="input-field mt-1.5"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div>
          <label className="block text-xs font-bold text-slate-700">Harga Jual (IDR) *</label>
          <input
            type="number"
            name="price"
            required
            min={1000}
            defaultValue={initialProduct?.price || 85000}
            className="input-field mt-1.5"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700">
            Harga Coret (Opsional)
          </label>
          <input
            type="number"
            name="compare_at_price"
            defaultValue={initialProduct?.compare_at_price || ''}
            placeholder="100000"
            className="input-field mt-1.5"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700">Stok Tersedia *</label>
          <input
            type="number"
            name="stock"
            required
            min={0}
            defaultValue={initialProduct?.stock ?? 25}
            className="input-field mt-1.5"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700">Berat (Gram) *</label>
          <input
            type="number"
            name="weight_grams"
            required
            min={10}
            defaultValue={initialProduct?.weight_grams || 250}
            className="input-field mt-1.5"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-bold text-slate-700">Kode SKU (Opsional)</label>
          <input
            type="text"
            name="sku"
            defaultValue={initialProduct?.sku || ''}
            placeholder="UMKM-SKU-01"
            className="input-field mt-1.5"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700">Minimal Pembelian</label>
          <input
            type="number"
            name="min_order"
            min={1}
            defaultValue={initialProduct?.min_order || 1}
            className="input-field mt-1.5"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700">Status Produk</label>
          <select
            name="status"
            defaultValue={initialProduct?.status || 'active'}
            className="input-field mt-1.5"
          >
            <option value="active">Aktif Dijual</option>
            <option value="draft">Simpan Sebagai Draf</option>
            <option value="out_of_stock">Stok Habis</option>
            <option value="archived">Diarsipkan</option>
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700">
            Daftar URL Foto Produk (Satu URL per baris, baris pertama menjadi foto utama) *
          </label>
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-brand-800 hover:underline">
            <Upload className="h-3.5 w-3.5" />
            <span>{uploading ? 'Mengunggah...' : 'Unggah Foto ke Supabase Storage'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUploadImage(f);
              }}
            />
          </label>
        </div>
        <textarea
          rows={3}
          value={imageUrlsText}
          onChange={(e) => setImageUrlsText(e.target.value)}
          required
          className="input-field mt-1.5 font-mono text-xs"
        />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Batal
        </button>
        <button type="submit" disabled={isPending} className="btn-primary px-6">
          {isPending
            ? 'Menyimpan...'
            : initialProduct
              ? 'Simpan Perubahan Produk'
              : 'Terbitkan Produk'}
        </button>
      </div>
    </form>
  );
}
