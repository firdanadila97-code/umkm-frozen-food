import React from 'react';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { Order, OrderStatus } from '@/types/database';
import { formatDateWIB, formatRupiah } from '@/utils/format';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/ui/Badge';
import { updateSellerOrderStatusAction } from '@/features/seller/actions';

export default async function SellerOrdersPage() {
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
        const { data } = await supabase
          .from('orders')
          .select(
            `
            *,
            payment:payments(status, payment_type),
            items:order_items(*)
          `
          )
          .eq('store_id', store.id)
          .order('created_at', { ascending: false });
        orders = (data as unknown as Order[]) || [];
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="surface-card p-6">
        <h1 className="text-xl font-extrabold text-slate-900">
          Manajemen Pesanan Masuk ({orders.length})
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Proses pesanan pelanggan, masukkan nomor resi kurir, dan perbarui status pengiriman
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="surface-card p-12 text-center">
          <p className="text-sm font-medium text-slate-600">
            Belum ada pesanan masuk pada toko Anda.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="surface-card p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="font-mono text-sm font-extrabold text-slate-900">
                    {order.order_number}
                  </span>
                  <span className="ml-3 text-xs text-slate-500">
                    {formatDateWIB(order.created_at, true)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {order.payment && <PaymentStatusBadge status={order.payment.status} />}
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-500">Item Dipesan</h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    {order.items?.map((item) => (
                      <li key={item.id} className="font-semibold text-slate-800">
                        {item.product_name_snapshot} x{item.quantity} (
                        {formatRupiah(item.total_price)})
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm font-extrabold text-brand-800">
                    Subtotal Toko: {formatRupiah(order.subtotal)}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-500">
                    Tujuan & Ekspedisi ({order.courier_code.toUpperCase()} - {order.courier_service})
                  </h3>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {order.address_snapshot?.recipient_name} ({order.address_snapshot?.phone})
                  </p>
                  <p className="text-xs text-slate-600">
                    {order.address_snapshot?.full_address}, {order.address_snapshot?.city},{' '}
                    {order.address_snapshot?.province}
                  </p>
                </div>
              </div>

              <form
                action={async (fd) => {
                  'use server';
                  const status = fd.get('status') as OrderStatus;
                  const tracking = String(fd.get('tracking_number') || '');
                  await updateSellerOrderStatusAction(order.id, status, tracking);
                }}
                className="flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Perbarui Status Pesanan
                  </label>
                  <select
                    name="status"
                    defaultValue={order.status}
                    className="input-field mt-1 text-xs"
                  >
                    <option value="pending">Menunggu Pembayaran</option>
                    <option value="confirmed">Dikonfirmasi</option>
                    <option value="processing">Sedang Dikemas (Processing)</option>
                    <option value="shipped">Dikirim Kurir (Shipped)</option>
                    <option value="delivered">Selesai Diterima (Delivered)</option>
                    <option value="cancelled">Batalkan Pesanan</option>
                  </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-bold text-slate-700">
                    Nomor Resi Pengiriman
                  </label>
                  <input
                    type="text"
                    name="tracking_number"
                    defaultValue={order.tracking_number || ''}
                    placeholder="Masukkan nomor resi JNE / SiCepat / J&T..."
                    className="input-field mt-1 text-xs"
                  />
                </div>

                <button type="submit" className="btn-primary text-xs">
                  Simpan Status
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
