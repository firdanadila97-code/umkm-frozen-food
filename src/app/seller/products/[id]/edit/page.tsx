import React from 'react';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { getCategories, getProducts } from '@/services/marketplace';
import { ProductForm } from '@/features/seller/ProductForm';
import { Product } from '@/types/database';

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const categories = await getCategories();
  let product: Product | null = null;

  if (isSupabaseConfigured()) {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('products')
      .select('*, images:product_images(*)')
      .eq('id', params.id)
      .single();
    product = (data as unknown as Product) || null;
  } else {
    const demo = await getProducts({ pageSize: 20 });
    product = demo.products.find((p) => p.id === params.id) || demo.products[0] || null;
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Edit Produk UMKM</h1>
        <p className="mt-1 text-sm text-slate-600">
          Perbarui rincian produk, harga, stok inventaris, atau foto untuk {product.name}
        </p>
      </div>

      <ProductForm categories={categories} initialProduct={product} />
    </div>
  );
}
