'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { Trash2, Minus, Plus, Store, ArrowRight } from 'lucide-react';
import { CartItem } from '@/types/database';
import { formatRupiah } from '@/utils/format';
import {
  removeCartItemAction,
  updateCartItemQuantityAction,
} from '@/features/cart/actions';
import { useToast } from '@/components/ui/Toast';

export function CartClient({ items }: { items: CartItem[] }) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  // Group cart items by Store so each UMKM store order has accurate shipping & stock locking
  const groupedByStore = items.reduce<
    Record<
      string,
      {
        storeId: string;
        storeName: string;
        storeCity: string;
        items: CartItem[];
        subtotal: number;
      }
    >
  >((acc, item) => {
    const storeId = item.product?.store_id || 'unknown';
    const storeName = item.product?.store?.name || 'Toko UMKM';
    const storeCity = item.product?.store?.city || 'Indonesia';
    if (!acc[storeId]) {
      acc[storeId] = { storeId, storeName, storeCity, items: [], subtotal: 0 };
    }
    acc[storeId].items.push(item);
    acc[storeId].subtotal += (item.product?.price || 0) * item.quantity;
    return acc;
  }, {});

  const handleQty = (itemId: string, nextQty: number) => {
    startTransition(async () => {
      const res = await updateCartItemQuantityAction(itemId, nextQty);
      if (res.error) showToast(res.error, 'error');
    });
  };

  const handleRemove = (itemId: string) => {
    startTransition(async () => {
      const res = await removeCartItemAction(itemId);
      if (res.error) showToast(res.error, 'error');
      else showToast('Produk dihapus dari keranjang.', 'info');
    });
  };

  const grandSubtotal = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        {Object.values(groupedByStore).map((group) => (
          <div key={group.storeId} className="surface-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-brand-700" />
                <span className="text-sm font-bold text-slate-900">{group.storeName}</span>
                <span className="text-xs text-slate-500">({group.storeCity})</span>
              </div>
              <Link
                href={`/checkout?store=${group.storeId}`}
                className="btn-primary py-1.5 px-3.5 text-xs"
              >
                <span>Checkout Toko Ini</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 px-6">
              {group.items.map((item) => {
                const product = item.product;
                if (!product) return null;
                const img =
                  product.images?.[0]?.image_url ||
                  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=300&q=80';

                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={img}
                        alt={product.name}
                        className="h-20 w-20 rounded-xl border border-slate-200 object-cover"
                      />
                      <div>
                        <Link
                          href={`/products/${product.slug}`}
                          className="text-sm font-bold text-slate-900 hover:text-brand-800"
                        >
                          {product.name}
                        </Link>
                        <p className="mt-1 text-sm font-extrabold text-brand-800">
                          {formatRupiah(product.price)}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Stok tersedia: {product.stock} • Berat: {product.weight_grams}g
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleQty(item.id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-700 hover:bg-white"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-9 text-center text-xs font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={isPending || item.quantity >= product.stock}
                          onClick={() => handleQty(item.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-700 hover:bg-white disabled:opacity-40"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleRemove(item.id)}
                        className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Hapus produk"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Card */}
      <div className="lg:col-span-4">
        <div className="surface-card sticky top-24 space-y-4 p-6">
          <h2 className="text-base font-extrabold text-slate-900">Ringkasan Belanja</h2>
          <div className="space-y-2 border-b border-slate-100 pb-4 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Total Item</span>
              <span className="font-semibold text-slate-900">
                {items.reduce((s, i) => s + i.quantity, 0)} produk
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Harga Produk</span>
              <span className="font-extrabold text-brand-800">{formatRupiah(grandSubtotal)}</span>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-slate-500">
            Pengiriman dihitung per toko UMKM asal pengiriman. Pilih tombol{' '}
            <strong>Checkout</strong> untuk memilih alamat dan kurir pengiriman.
          </p>

          {Object.values(groupedByStore)[0] && (
            <Link
              href={`/checkout?store=${Object.values(groupedByStore)[0].storeId}`}
              className="btn-primary w-full py-3"
            >
              <span>Lanjut ke Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
