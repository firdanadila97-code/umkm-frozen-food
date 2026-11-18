import React from 'react';
import { getCategories } from '@/services/marketplace';
import { ProductForm } from '@/features/seller/ProductForm';

export default async function AddProductPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Tambah Produk UMKM Baru</h1>
        <p className="mt-1 text-sm text-slate-600">
          Lengkapi detail produk, harga Rupiah (IDR), stok, dan unggah foto produk terbaik Anda
        </p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
