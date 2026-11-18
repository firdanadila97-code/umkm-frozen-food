'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { MapPin, Star, ShoppingCart, BadgeCheck } from 'lucide-react';
import { Product } from '@/types/database';
import { calculateDiscountPercentage, formatRupiah } from '@/utils/format';
import { addToCartAction } from '@/features/cart/actions';
import { useToast } from '@/components/ui/Toast';

export function ProductCard({ product }: { product: Product }) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const primaryImage =
    product.images?.find((img) => img.is_primary)?.image_url ||
    product.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80';

  const discountPct = calculateDiscountPercentage(product.price, product.compare_at_price);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await addToCartAction(product.id, 1);
      if (res.error) {
        showToast(res.error, 'error');
      } else if (res.message) {
        showToast(res.message, 'success');
      }
    });
  };

  return (
    <div className="surface-card group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-600/40 hover:shadow-card-hover">
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square w-full overflow-hidden bg-slate-100"
      >
        <img
          src={primaryImage}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {discountPct && (
          <span className="absolute left-3 top-3 rounded-lg bg-brand-700 px-2 py-1 text-xs font-bold text-white shadow-xs">
            Hemat {discountPct}%
          </span>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60">
            <span className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-slate-900">
              Stok Habis
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 truncate font-medium text-brand-800">
              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-brand-600" />
              <span className="truncate">{product.store?.name || 'UMKM Nusantara'}</span>
            </span>
            {product.store?.city && (
              <span className="inline-flex shrink-0 items-center gap-0.5 text-slate-400">
                <MapPin className="h-3 w-3" />
                {product.store.city}
              </span>
            )}
          </div>

          <Link
            href={`/products/${product.slug}`}
            className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-slate-900 transition-colors group-hover:text-brand-800"
          >
            {product.name}
          </Link>
        </div>

        <div className="mt-3 pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold text-brand-800">
              {formatRupiah(product.price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-xs text-slate-400 line-through">
                {formatRupiah(product.compare_at_price)}
              </span>
            )}
          </div>

          <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-800">
                {Number(product.rating_avg || 4.9).toFixed(1)}
              </span>
              <span className="text-slate-300">•</span>
              <span>{product.sold_count} terjual</span>
            </div>

            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isPending || product.stock <= 0}
              className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-800 transition-colors hover:bg-brand-800 hover:text-white disabled:opacity-40"
              title="Tambah ke Keranjang"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>{isPending ? '...' : '+ Keranjang'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
