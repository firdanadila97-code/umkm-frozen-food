'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Minus, Plus, ShieldCheck } from 'lucide-react';
import { addToCartAction } from '@/features/cart/actions';
import { useToast } from '@/components/ui/Toast';
import { formatRupiah } from '@/utils/format';

interface AddToCartPanelProps {
  productId: string;
  price: number;
  stock: number;
  minOrder: number;
}

export function AddToCartPanel({
  productId,
  price,
  stock,
  minOrder = 1,
}: AddToCartPanelProps) {
  const [quantity, setQuantity] = useState(Math.max(1, minOrder));
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const router = useRouter();

  const handleAdd = (buyNow = false) => {
    startTransition(async () => {
      const res = await addToCartAction(productId, quantity);
      if (res.error) {
        showToast(res.error, 'error');
        return;
      }
      if (res.message) {
        showToast(res.message, 'success');
      }
      if (buyNow) {
        router.push('/cart');
      }
    });
  };

  return (
    <div className="surface-card space-y-5 p-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <span className="text-sm font-bold text-slate-800">Atur Jumlah Pembelian</span>
        <span className="text-xs font-semibold text-slate-500">
          Stok tersedia: <strong className="text-slate-900">{stock}</strong>
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            disabled={quantity <= minOrder || stock <= 0}
            onClick={() => setQuantity((q) => Math.max(minOrder, q - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 hover:bg-white disabled:opacity-40"
            aria-label="Kurangi jumlah"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-sm font-bold text-slate-900">{quantity}</span>
          <button
            type="button"
            disabled={quantity >= stock || stock <= 0}
            onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 hover:bg-white disabled:opacity-40"
            aria-label="Tambah jumlah"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="text-right">
          <span className="block text-xs text-slate-500">Subtotal</span>
          <span className="text-lg font-extrabold text-brand-800">
            {formatRupiah(price * quantity)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <button
          type="button"
          disabled={isPending || stock <= 0}
          onClick={() => handleAdd(false)}
          className="btn-primary w-full py-3"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>{isPending ? 'Menambahkan...' : '+ Keranjang'}</span>
        </button>

        <button
          type="button"
          disabled={isPending || stock <= 0}
          onClick={() => handleAdd(true)}
          className="btn-secondary w-full py-3"
        >
          Beli Sekarang
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-brand-50/70 p-3 text-xs text-brand-900">
        <ShieldCheck className="h-4 w-4 shrink-0 text-brand-700" />
        <span>Garansi keaslian produk UMKM & pengembalian dana jika pesanan tidak sesuai.</span>
      </div>
    </div>
  );
}
