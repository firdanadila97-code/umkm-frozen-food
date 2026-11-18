import React from 'react';
import Link from 'next/link';
import {
  Users,
  Store,
  Package,
  CreditCard,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { getCategories, getFeaturedStores, getProducts } from '@/services/marketplace';

export default async function AdminDashboardPage() {
  let userCount = 5;
  let storeCount = 3;
  let productCount = 8;
  let orderCount = 0;

  if (isSupabaseConfigured()) {
    const supabase = createServerSupabaseClient();
    const [u, s, p, o] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('stores').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
    ]);
    userCount = u.count ?? 5;
    storeCount = s.count ?? 3;
    productCount = p.count ?? 8;
    orderCount = o.count ?? 0;
  } else {
    const [stores, prods] = await Promise.all([getFeaturedStores(10), getProducts()]);
    storeCount = stores.length;
    productCount = prods.total;
  }

  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="surface-card p-6">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-6 w-6 text-brand-700" />
          <h1 className="text-2xl font-extrabold text-slate-900">
            Pusat Kendali Administrator UMKM Hub
          </h1>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Awasi operasional ekosistem marketplace, verifikasi mitra UMKM baru, kelola kategori, dan
          pantau keamanan pembayaran Midtrans.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Total Pengguna</span>
              <Users className="h-4 w-4 text-brand-700" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{userCount}</p>
            <Link
              href="/admin/users"
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand-800 hover:underline"
            >
              Kelola Akun <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Toko UMKM</span>
              <Store className="h-4 w-4 text-brand-700" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{storeCount}</p>
            <Link
              href="/admin/stores"
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand-800 hover:underline"
            >
              Verifikasi Toko <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Produk Katalog</span>
              <Package className="h-4 w-4 text-brand-700" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{productCount}</p>
            <Link
              href="/admin/products"
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand-800 hover:underline"
            >
              Moderasi Produk <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Pesanan & Pembayaran</span>
              <CreditCard className="h-4 w-4 text-brand-700" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">
              {orderCount} ({categories.length} Kategori)
            </p>
            <Link
              href="/admin/payments"
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand-800 hover:underline"
            >
              Pantau Webhook <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
