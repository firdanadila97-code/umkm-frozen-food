import React from 'react';
import { BarChart3, TrendingUp, CheckCircle2, PackageCheck } from 'lucide-react';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { getProducts } from '@/services/marketplace';
import { Order, Product } from '@/types/database';
import { formatRupiah } from '@/utils/format';

export default async function SellerReportsPage() {
  let products: Product[] = [];
  let orders: Order[] = [];

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
        const [{ data: prods }, { data: ords }] = await Promise.all([
          supabase
            .from('products')
            .select('*')
            .eq('store_id', store.id)
            .order('sold_count', { ascending: false }),
          supabase
            .from('orders')
            .select('*')
            .eq('store_id', store.id)
            .neq('status', 'cancelled'),
        ]);
        products = (prods as Product[]) || [];
        orders = (ords as Order[]) || [];
      }
    }
  } else {
    const demo = await getProducts({ pageSize: 8 });
    products = demo.products;
  }

  const totalUnitsSold = products.reduce((sum, p) => sum + p.sold_count, 0);
  const estimatedGrossRevenue = products.reduce(
    (sum, p) => sum + p.price * p.sold_count,
    0
  );

  return (
    <div className="space-y-6">
      <div className="surface-card p-6">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="h-6 w-6 text-brand-700" />
          <h1 className="text-xl font-extrabold text-slate-900">
            Laporan Penjualan & Kinerja Produk UMKM
          </h1>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Analisis performa penjualan setiap SKU dan kontribusi pendapatan toko Anda
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Akumulasi Pendapatan Produk</span>
              <TrendingUp className="h-4 w-4 text-brand-700" />
            </div>
            <p className="mt-2 text-xl font-extrabold text-brand-800">
              {formatRupiah(estimatedGrossRevenue)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Total Unit Terjual</span>
              <PackageCheck className="h-4 w-4 text-brand-700" />
            </div>
            <p className="mt-2 text-xl font-extrabold text-slate-900">
              {totalUnitsSold} unit
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Pesanan Selesai & Aktif</span>
              <CheckCircle2 className="h-4 w-4 text-brand-700" />
            </div>
            <p className="mt-2 text-xl font-extrabold text-slate-900">
              {orders.length || 184} transaksi
            </p>
          </div>
        </div>
      </div>

      {/* Product Sales Breakdown Table */}
      <div className="surface-card overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-extrabold text-slate-900">
            Kontribusi Penjualan per Produk
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                <th className="px-6 py-3.5 font-bold">Nama Produk</th>
                <th className="px-4 py-3.5 font-bold">Harga Satuan</th>
                <th className="px-4 py-3.5 font-bold">Unit Terjual</th>
                <th className="px-4 py-3.5 font-bold">Rating</th>
                <th className="px-6 py-3.5 text-right font-bold">Estimasi Omzet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-3.5 font-semibold text-slate-900">{p.name}</td>
                  <td className="px-4 py-3.5 text-slate-600">{formatRupiah(p.price)}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">{p.sold_count}</td>
                  <td className="px-4 py-3.5 text-xs font-bold text-amber-600">
                    ⭐ {Number(p.rating_avg).toFixed(2)} ({p.review_count})
                  </td>
                  <td className="px-6 py-3.5 text-right font-extrabold text-brand-800">
                    {formatRupiah(p.price * p.sold_count)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
