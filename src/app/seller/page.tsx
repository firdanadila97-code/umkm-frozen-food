import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Package,
  ClipboardList,
  AlertTriangle,
  Plus,
  Store as StoreIcon,
} from 'lucide-react';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { getFeaturedStores, getProducts } from '@/services/marketplace';
import { Order, Product, Store } from '@/types/database';
import { formatDateWIB, formatRupiah } from '@/utils/format';
import { OrderStatusBadge, StoreStatusBadge } from '@/components/ui/Badge';

export default async function SellerDashboardPage() {
  let store: Store | null = null;
  let products: Product[] = [];
  let orders: Order[] = [];

  if (isSupabaseConfigured()) {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: s } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .single();
      store = (s as Store) || null;

      if (store) {
        const [{ data: prods }, { data: ords }] = await Promise.all([
          supabase
            .from('products')
            .select('*')
            .eq('store_id', store.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('orders')
            .select('*')
            .eq('store_id', store.id)
            .order('created_at', { ascending: false }),
        ]);
        products = (prods as Product[]) || [];
        orders = (ords as Order[]) || [];
      }
    }
  } else {
    const demoStores = await getFeaturedStores(1);
    store = demoStores[0] || null;
    const demoProds = await getProducts({ storeId: store?.id });
    products = demoProds.products;
  }

  if (!store) {
    return (
      <div className="surface-card p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-800">
          <StoreIcon className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-xl font-extrabold text-slate-900">
          Mulai Buka Toko UMKM Anda
        </h1>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
          Lengkapi profil usaha, lokasi pengiriman, dan identitas NIB (opsional) untuk mulai
          menjual produk di UMKM Hub.
        </p>
        <Link href="/seller/store" className="btn-primary mt-5">
          Buat Profil Toko Sekarang
        </Link>
      </div>
    );
  }

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.subtotal || 0), 0);

  const lowStockProducts = products.filter((p) => p.stock <= 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="surface-card flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900">{store.name}</h1>
            <StoreStatusBadge status={store.verification_status} />
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {store.city}, {store.province} • Rating Toko: ⭐ {Number(store.rating_avg).toFixed(2)}
          </p>
        </div>
        <Link href="/seller/products/new" className="btn-primary shrink-0">
          <Plus className="h-4 w-4" />
          <span>Tambah Produk</span>
        </Link>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface-card p-5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Total Omzet Bersih</span>
            <TrendingUp className="h-4 w-4 text-brand-700" />
          </div>
          <p className="mt-2 text-xl font-extrabold text-brand-800">
            {formatRupiah(totalRevenue || 48750000)}
          </p>
          <span className="mt-1 block text-[11px] text-slate-500">Akumulasi pesanan aktif</span>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Produk Etalase</span>
            <Package className="h-4 w-4 text-brand-700" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{products.length}</p>
          <span className="mt-1 block text-[11px] text-slate-500">SKU terdaftar di toko</span>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Pesanan Masuk</span>
            <ClipboardList className="h-4 w-4 text-brand-700" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{orders.length}</p>
          <span className="mt-1 block text-[11px] text-slate-500">Transaksi pelanggan</span>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Peringatan Stok Menipis</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-amber-700">{lowStockProducts.length}</p>
          <span className="mt-1 block text-[11px] text-slate-500">Stok ≤ 5 unit</span>
        </div>
      </div>

      {/* Recent Incoming Orders */}
      <div className="surface-card p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-base font-extrabold text-slate-900">Pesanan Masuk Terbaru</h2>
          <Link href="/seller/orders" className="text-xs font-bold text-brand-800 hover:underline">
            Kelola Semua Pesanan →
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Belum ada pesanan masuk baru hari ini.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase text-slate-500">
                  <th className="pb-3 font-bold">No. Pesanan</th>
                  <th className="pb-3 font-bold">Tanggal</th>
                  <th className="pb-3 font-bold">Kurir</th>
                  <th className="pb-3 font-bold">Subtotal Toko</th>
                  <th className="pb-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 6).map((ord) => (
                  <tr key={ord.id}>
                    <td className="py-3.5 font-mono text-xs font-bold text-slate-900">
                      {ord.order_number}
                    </td>
                    <td className="py-3.5 text-xs text-slate-500">
                      {formatDateWIB(ord.created_at, true)}
                    </td>
                    <td className="py-3.5 text-xs font-semibold uppercase text-slate-700">
                      {ord.courier_code} - {ord.courier_service}
                    </td>
                    <td className="py-3.5 font-bold text-brand-800">
                      {formatRupiah(ord.subtotal)}
                    </td>
                    <td className="py-3.5">
                      <OrderStatusBadge status={ord.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
