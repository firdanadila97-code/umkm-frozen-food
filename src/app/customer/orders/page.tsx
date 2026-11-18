import React from 'react';
import Link from 'next/link';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { Order } from '@/types/database';
import { formatDateWIB, formatRupiah } from '@/utils/format';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function CustomerOrdersPage() {
  let orders: Order[] = [];

  if (isSupabaseConfigured()) {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from('orders')
        .select(
          `
          *,
          store:stores(id, name, slug, city),
          payment:payments(status, payment_type, midtrans_order_id),
          items:order_items(id, product_name_snapshot, quantity, unit_price)
        `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      orders = (data as unknown as Order[]) || [];
    }
  }

  return (
    <div className="space-y-6">
      <div className="surface-card p-6">
        <h1 className="text-xl font-extrabold text-slate-900">Riwayat Pesanan Saya</h1>
        <p className="mt-1 text-sm text-slate-600">
          Daftar seluruh transaksi pembelian produk UMKM Anda beserta status pengiriman kurir
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="Belum Ada Transaksi"
          description="Anda belum memiliki riwayat pesanan. Yuk jelajahi katalog produk UMKM Nusantara!"
          actionLabel="Telusuri Katalog"
          actionHref="/marketplace"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="surface-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-3.5 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900">
                    {order.order_number}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600">{formatDateWIB(order.created_at, true)}</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-bold text-brand-800">{order.store?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {order.payment && <PaymentStatusBadge status={order.payment.status} />}
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>

              <div className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  {order.items?.map((item) => (
                    <p key={item.id} className="text-sm font-semibold text-slate-800">
                      {item.product_name_snapshot}{' '}
                      <span className="font-normal text-slate-500">x{item.quantity}</span>
                    </p>
                  ))}
                  <p className="pt-1 text-xs text-slate-500">
                    Ekspedisi: <strong className="uppercase">{order.courier_code}</strong> (
                    {order.courier_service})
                    {order.tracking_number && ` • Resi: ${order.tracking_number}`}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div className="text-right">
                    <span className="block text-xs text-slate-500">Total Tagihan</span>
                    <span className="text-base font-extrabold text-brand-800">
                      {formatRupiah(order.grand_total)}
                    </span>
                  </div>
                  <Link href={`/customer/orders/${order.id}`} className="btn-secondary text-xs">
                    Lihat Detail & Ulasan
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
