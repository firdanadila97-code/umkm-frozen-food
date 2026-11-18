import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Truck, MapPin, Star } from 'lucide-react';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { Order } from '@/types/database';
import { formatDateWIB, formatRupiah } from '@/utils/format';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/ui/Badge';
import { submitReviewAction } from '@/features/checkout/actions';

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="surface-card p-6">
        <p className="text-sm text-slate-600">
          Hubungkan database Supabase pada <code className="font-mono">.env.local</code> untuk
          melihat detail pesanan.
        </p>
      </div>
    );
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data } = await supabase
    .from('orders')
    .select(
      `
      *,
      store:stores(id, name, slug, city, phone, whatsapp),
      payment:payments(*),
      items:order_items(*)
    `
    )
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (!data) notFound();
  const order = data as unknown as Order;

  return (
    <div className="space-y-6">
      <div className="surface-card p-6">
        <Link
          href="/customer/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Riwayat Pesanan
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
              Pesanan {order.order_number}
            </h1>
            <p className="text-xs text-slate-500">
              Dibuat pada {formatDateWIB(order.created_at, true)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {order.payment && <PaymentStatusBadge status={order.payment.status} />}
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
              <MapPin className="h-4 w-4 text-brand-700" />
              <span>Alamat Tujuan Pengiriman</span>
            </div>
            <p className="mt-2 text-sm font-bold text-slate-900">
              {order.address_snapshot?.recipient_name} ({order.address_snapshot?.phone})
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              {order.address_snapshot?.full_address}, Kec. {order.address_snapshot?.district},{' '}
              {order.address_snapshot?.city}, {order.address_snapshot?.province}{' '}
              {order.address_snapshot?.postal_code}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
              <Truck className="h-4 w-4 text-brand-700" />
              <span>Informasi Kurir & Pembayaran</span>
            </div>
            <p className="mt-2 text-sm font-bold uppercase text-slate-900">
              {order.courier_code} — Layanan {order.courier_service}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Nomor Resi:{' '}
              <strong className="font-mono text-slate-900">
                {order.tracking_number || 'Menunggu input penjual'}
              </strong>
            </p>
            {order.payment?.snap_redirect_url && order.payment.status === 'pending' && (
              <a
                href={order.payment.snap_redirect_url}
                target="_blank"
                rel="noreferrer"
                className="btn-primary mt-3 text-xs"
              >
                Lanjutkan Pembayaran Midtrans Sandbox
              </a>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="mt-6 divide-y divide-slate-100 border-t border-slate-100">
          {order.items?.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"
            >
              <div>
                <p className="text-sm font-bold text-slate-900">{item.product_name_snapshot}</p>
                <p className="text-xs text-slate-500">
                  {item.quantity} x {formatRupiah(item.unit_price)}
                </p>
              </div>
              <span className="text-sm font-extrabold text-brand-800">
                {formatRupiah(item.total_price)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-4 space-y-1.5 border-t border-slate-200 pt-4 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal Produk</span>
            <span>{formatRupiah(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Ongkos Kirim</span>
            <span>{formatRupiah(order.shipping_cost)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Biaya Layanan</span>
            <span>{formatRupiah(order.service_fee)}</span>
          </div>
          <div className="flex justify-between pt-2 text-base font-extrabold text-slate-900">
            <span>Total Tagihan</span>
            <span className="text-brand-800">{formatRupiah(order.grand_total)}</span>
          </div>
        </div>
      </div>

      {/* Review Submission (Available when order is delivered) */}
      {order.status === 'delivered' && order.items && order.items.length > 0 && (
        <div className="surface-card p-6">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            <h2 className="text-base font-extrabold text-slate-900">
              Berikan Ulasan Produk UMKM
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            Ulasan jujur Anda sangat membantu kemajuan toko {order.store?.name}.
          </p>

          <div className="mt-4 space-y-4">
            {order.items.map((item) => (
              <form
                key={item.id}
                action={async (fd) => {
                  'use server';
                  await submitReviewAction(fd);
                }}
                className="rounded-2xl border border-slate-200 p-4 space-y-3"
              >
                <input type="hidden" name="order_id" value={order.id} />
                <input type="hidden" name="product_id" value={item.product_id} />
                <p className="text-sm font-bold text-slate-900">{item.product_name_snapshot}</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">Rating</label>
                    <select name="rating" defaultValue="5" className="input-field mt-1">
                      <option value="5">⭐⭐⭐⭐⭐ (5 - Sangat Puas)</option>
                      <option value="4">⭐⭐⭐⭐ (4 - Puas)</option>
                      <option value="3">⭐⭐⭐ (3 - Cukup)</option>
                      <option value="2">⭐⭐ (2 - Kurang)</option>
                      <option value="1">⭐ (1 - Tidak Sesuai)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700">
                      Komentar Ulasan
                    </label>
                    <input
                      type="text"
                      name="comment"
                      required
                      minLength={5}
                      placeholder="Ceritakan kualitas produk dan kemasan penjual..."
                      className="input-field mt-1"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary text-xs">
                  Kirim Ulasan Terverifikasi
                </button>
              </form>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
