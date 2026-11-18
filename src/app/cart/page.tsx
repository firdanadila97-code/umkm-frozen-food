import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { getUserCartItems } from '@/features/cart/actions';
import { CartClient } from '@/features/cart/CartClient';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function CartPage() {
  const items = await getUserCartItems();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Keranjang Belanja Anda
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Periksa kembali produk UMKM pilihan Anda sebelum melanjutkan ke pembayaran aman
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Keranjang Belanja Masih Kosong"
          description="Mari dukung pengrajin dan produsen lokal dengan menambahkan produk UMKM favorit Anda ke keranjang."
          actionLabel="Jelajahi Katalog UMKM"
          actionHref="/marketplace"
          icon={<ShoppingCart className="h-7 w-7" />}
        />
      ) : (
        <CartClient items={items} />
      )}
    </div>
  );
}
