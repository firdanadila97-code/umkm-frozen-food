import React from 'react';
import Link from 'next/link';
import { Plus, Edit3, Archive } from 'lucide-react';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { getProducts } from '@/services/marketplace';
import { Product } from '@/types/database';
import { formatRupiah } from '@/utils/format';
import { ProductStatusBadge } from '@/components/ui/Badge';
import { archiveOrDeleteProductAction } from '@/features/seller/actions';

export default async function SellerProductsPage() {
  let products: Product[] = [];

  if (isSupabaseConfigured()) {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (store) {
        const { data } = await supabase
          .from('products')
          .select('*, category:categories(name), images:product_images(image_url, is_primary)')
          .eq('store_id', store.id)
          .order('created_at', { ascending: false });
        products = (data as unknown as Product[]) || [];
      }
    }
  } else {
    const demo = await getProducts({ pageSize: 8 });
    products = demo.products;
  }

  return (
    <div className="space-y-6">
      <div className="surface-card flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Manajemen Produk & Inventaris ({products.length})
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Kelola harga, stok ketersediaan, dan status publikasi produk toko UMKM Anda
          </p>
        </div>
        <Link href="/seller/products/new" className="btn-primary shrink-0">
          <Plus className="h-4 w-4" />
          <span>Tambah Produk Baru</span>
        </Link>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase text-slate-500">
                <th className="px-6 py-3.5 font-bold">Produk</th>
                <th className="px-4 py-3.5 font-bold">Harga</th>
                <th className="px-4 py-3.5 font-bold">Stok</th>
                <th className="px-4 py-3.5 font-bold">Terjual</th>
                <th className="px-4 py-3.5 font-bold">Status</th>
                <th className="px-6 py-3.5 text-right font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((prod) => {
                const img =
                  prod.images?.[0]?.image_url ||
                  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=200&q=80';
                return (
                  <tr key={prod.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={img}
                          alt={prod.name}
                          className="h-12 w-12 rounded-xl border border-slate-200 object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{prod.name}</p>
                          <p className="text-xs text-slate-500">
                            {prod.category?.name || 'Kategori UMKM'} • SKU: {prod.sku || '-'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-bold text-brand-800">
                      {formatRupiah(prod.price)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`font-bold ${
                          prod.stock <= 5 ? 'text-amber-700' : 'text-slate-900'
                        }`}
                      >
                        {prod.stock} unit
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{prod.sold_count}</td>
                    <td className="px-4 py-4">
                      <ProductStatusBadge status={prod.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/seller/products/${prod.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-brand-700 hover:text-brand-800"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <form
                          action={async () => {
                            'use server';
                            await archiveOrDeleteProductAction(prod.id, 'archive');
                          }}
                        >
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700"
                            title="Arsipkan Produk"
                          >
                            <Archive className="h-3.5 w-3.5" />
                            Arsipkan
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
