import React from 'react';
import Link from 'next/link';
import { ShoppingBag, MapPin, CreditCard, ArrowRight } from 'lucide-react';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/features/auth/actions';
import { Order } from '@/types/database';
import { formatDateWIB, formatRupiah } from '@/utils/format';
import { OrderStatusBadge } from '@/components/ui/Badge';

export default async function CustomerDashboardPage() {
  const profile = await getCurrentUserProfile();
  let recentOrders: Order[] = [];
  let addressCount = 0;

  if (isSupabaseConfigured() && profile) {
    const supabase = createServerSupabaseClient();
    const [{ data: orders }, { count }] = await Promise.all([
      supabase
        .from('orders')
        .select('*, store:stores(name, slug)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('addresses')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id),
    ]);
    recentOrders = (orders as unknown as Order[]) || [];
    addressCount = count || 0;
  }

  return (
    <div className="space-y-6">
      <div className="surface-card p-6">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Selamat Datang, {profile?.full_name || 'Pelanggan UMKM Hub'}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Pantau status pengiriman pesanan UMKM Anda, kelola alamat, dan berikan ulasan produk.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Total Pesanan</span>
              <ShoppingBag className="h-4 w-4 text-brand-700" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{recentOrders.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Alamat Tersimpan</span>
              <MapPin className="h-4 w-4 text-brand-700" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{addressCount}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Metode Pembayaran</span>
              <CreditCard className="h-4 w-4 text-brand-700" />
            </div>
            <p className="mt-2 text-sm font-bold text-brand-800">Midtrans Sandbox Ready</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="surface-card p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-base font-extrabold text-slate-900">Pesanan Terbaru</h2>
          <Link
            href="/customer/orders"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-800 hover:underline"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-slate-500">Belum ada riwayat pesanan.</p>
            <Link href="/marketplace" className="btn-primary mt-4">
              Mulai Belanja Produk UMKM
            </Link>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase text-slate-500">
                  <th className="pb-3 font-bold">No. Pesanan</th>
                  <th className="pb-3 font-bold">Toko UMKM</th>
                  <th className="pb-3 font-bold">Tanggal</th>
                  <th className="pb-3 font-bold">Total</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 text-right font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-3.5 font-mono text-xs font-bold text-slate-900">
                      {order.order_number}
                    </td>
                    <td className="py-3.5 text-slate-700">{order.store?.name || 'Toko UMKM'}</td>
                    <td className="py-3.5 text-xs text-slate-500">
                      {formatDateWIB(order.created_at)}
                    </td>
                    <td className="py-3.5 font-bold text-brand-800">
                      {formatRupiah(order.grand_total)}
                    </td>
                    <td className="py-3.5">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href={`/customer/orders/${order.id}`}
                        className="text-xs font-bold text-brand-800 hover:underline"
                      >
                        Detail →
                      </Link>
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
