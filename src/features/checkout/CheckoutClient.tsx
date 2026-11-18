'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Truck, ShieldCheck, Lock, Plus } from 'lucide-react';
import { Address, CartItem, ShippingOption } from '@/types/database';
import { formatRupiah } from '@/utils/format';
import { processCheckoutAction } from '@/features/checkout/actions';
import { useToast } from '@/components/ui/Toast';

interface CheckoutClientProps {
  storeId: string;
  storeName: string;
  storeCity: string;
  items: CartItem[];
  addresses: Address[];
  shippingOptions: ShippingOption[];
}

export function CheckoutClient({
  storeId,
  storeName,
  storeCity,
  items,
  addresses,
  shippingOptions,
}: CheckoutClientProps) {
  const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddr?.id || '');
  const [selectedShippingIdx, setSelectedShippingIdx] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { showToast } = useToast();

  const selectedShipping = shippingOptions[selectedShippingIdx] || shippingOptions[0];
  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const serviceFee = 2000;
  const grandTotal = subtotal + (selectedShipping?.cost || 0) + serviceFee;

  const handleCheckout = () => {
    if (!selectedAddressId) {
      showToast('Silakan pilih atau tambahkan alamat pengiriman terlebih dahulu.', 'error');
      return;
    }

    startTransition(async () => {
      const res = await processCheckoutAction({
        store_id: storeId,
        address_id: selectedAddressId,
        courier_code: selectedShipping.courierCode,
        courier_service: selectedShipping.service,
        notes,
      });

      if (res.error) {
        showToast(res.error, 'error');
        return;
      }

      showToast('Pesanan berhasil dibuat secara transaksional!', 'success');
      if (res.snapRedirectUrl) {
        window.location.href = res.snapRedirectUrl;
      } else {
        router.push(`/customer/orders/${res.orderId}`);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        {/* 1. Delivery Address Selection */}
        <div className="surface-card p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-brand-700" />
              <h2 className="text-base font-extrabold text-slate-900">
                1. Pilih Alamat Pengiriman
              </h2>
            </div>
            <Link
              href="/customer/addresses"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-800 hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              Kelola Alamat
            </Link>
          </div>

          {addresses.length === 0 ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
              Anda belum memiliki alamat pengiriman tersimpan.{' '}
              <Link href="/customer/addresses" className="font-bold underline">
                Tambahkan Alamat Sekarang
              </Link>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    selectedAddressId === addr.id
                      ? 'border-brand-700 bg-brand-50/50 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-800">
                      {addr.label}
                    </span>
                    <input
                      type="radio"
                      name="address_id"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="text-brand-800 focus:ring-brand-700"
                    />
                  </div>
                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {addr.recipient_name} ({addr.phone})
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    {addr.full_address}, Kec. {addr.district}, {addr.city}, {addr.province}{' '}
                    {addr.postal_code}
                  </p>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 2. Courier & Service Selection */}
        <div className="surface-card p-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Truck className="h-5 w-5 text-brand-700" />
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                2. Pilih Ekspedisi Pengiriman
              </h2>
              <p className="text-xs text-slate-500">
                Dikirim dari <strong>{storeName}</strong> ({storeCity})
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {shippingOptions.map((opt, idx) => (
              <label
                key={`${opt.courierCode}-${opt.service}`}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  selectedShippingIdx === idx
                    ? 'border-brand-700 bg-brand-50/50 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">
                    {opt.courierName} — {opt.service}
                  </span>
                  <input
                    type="radio"
                    name="shipping_option"
                    checked={selectedShippingIdx === idx}
                    onChange={() => setSelectedShippingIdx(idx)}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Estimasi tiba: {opt.etdDays} • {opt.description}
                </p>
                <p className="mt-2 text-sm font-extrabold text-brand-800">
                  {formatRupiah(opt.cost)}
                </p>
              </label>
            ))}
          </div>
        </div>

        {/* 3. Order Items & Notes */}
        <div className="surface-card p-6">
          <h2 className="border-b border-slate-100 pb-4 text-base font-extrabold text-slate-900">
            3. Rincian Produk Dipesan ({items.length})
          </h2>

          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.product?.name}</p>
                  <p className="text-xs text-slate-500">
                    {item.quantity} x {formatRupiah(item.product?.price || 0)}
                  </p>
                </div>
                <span className="text-sm font-extrabold text-slate-900">
                  {formatRupiah((item.product?.price || 0) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label htmlFor="notes" className="block text-xs font-bold text-slate-700">
              Catatan untuk Penjual UMKM (Opsional)
            </label>
            <input
              id="notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Tolong giling kasar untuk seduh V60 / bungkus kado..."
              className="input-field mt-1.5"
            />
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="lg:col-span-4">
        <div className="surface-card sticky top-24 space-y-5 p-6">
          <h2 className="text-base font-extrabold text-slate-900">Ringkasan Pembayaran</h2>

          <div className="space-y-2.5 border-b border-slate-100 pb-4 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Produk</span>
              <span className="font-semibold text-slate-900">{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Ongkos Kirim ({selectedShipping?.courierName})</span>
              <span className="font-semibold text-slate-900">
                {formatRupiah(selectedShipping?.cost || 0)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Biaya Layanan Platform</span>
              <span className="font-semibold text-slate-900">{formatRupiah(serviceFee)}</span>
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-sm font-bold text-slate-900">Total Tagihan</span>
            <span className="text-xl font-extrabold text-brand-800">
              {formatRupiah(grandTotal)}
            </span>
          </div>

          <button
            type="button"
            disabled={isPending || addresses.length === 0}
            onClick={handleCheckout}
            className="btn-primary w-full py-3.5"
          >
            <Lock className="h-4 w-4" />
            <span>{isPending ? 'Memproses Pesanan...' : 'Buat Pesanan & Bayar (Midtrans)'}</span>
          </button>

          <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="h-4 w-4 text-brand-700" />
              <span>Keamanan Transaksi Midtrans Sandbox</span>
            </div>
            <p className="mt-1 leading-relaxed">
              Harga dan stok divalidasi secara transaksional di database PostgreSQL. Status
              pembayaran diverifikasi melalui tanda tangan kriptografi SHA-512 Server Webhook.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
