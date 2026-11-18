import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BadgeCheck,
  MapPin,
  Star,
  Package,
  Scale,
  Store as StoreIcon,
  CheckCircle2,
} from 'lucide-react';
import { getProductBySlug, getProductReviews } from '@/services/marketplace';
import { AddToCartPanel } from '@/features/products/AddToCartPanel';
import { calculateDiscountPercentage, formatDateWIB, formatRupiah } from '@/utils/format';

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    notFound();
  }

  const reviews = await getProductReviews(product.id);
  const primaryImage =
    product.images?.find((img) => img.is_primary)?.image_url ||
    product.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=900&q=80';

  const discountPct = calculateDiscountPercentage(product.price, product.compare_at_price);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/" className="hover:text-brand-800">
          Beranda
        </Link>
        <span>/</span>
        <Link href="/marketplace" className="hover:text-brand-800">
          Katalog
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/marketplace?category=${product.category.slug}`}
              className="hover:text-brand-800"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="truncate font-semibold text-slate-800">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Product Image Gallery */}
        <div className="lg:col-span-5">
          <div className="surface-card overflow-hidden p-3">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100">
              <img
                src={primaryImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              {discountPct && (
                <span className="absolute left-4 top-4 rounded-xl bg-brand-700 px-3 py-1 text-xs font-bold text-white">
                  Hemat {discountPct}%
                </span>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2.5">
                {product.images.map((img) => (
                  <div
                    key={img.id}
                    className="aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                  >
                    <img
                      src={img.image_url}
                      alt={img.alt_text || product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Details & Seller Info */}
        <div className="space-y-6 lg:col-span-7">
          <div className="surface-card p-6">
            {product.category && (
              <Link
                href={`/marketplace?category=${product.category.slug}`}
                className="inline-block rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-800"
              >
                {product.category.name}
              </Link>
            )}

            <h1 className="mt-2.5 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {product.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1 font-bold text-slate-900">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {Number(product.rating_avg || 4.9).toFixed(2)}
                <span className="font-normal text-slate-500">
                  ({product.review_count} ulasan)
                </span>
              </span>
              <span>•</span>
              <span>
                Terjual <strong className="text-slate-900">{product.sold_count}</strong>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Scale className="h-4 w-4 text-slate-400" />
                Berat {product.weight_grams} gram
              </span>
              {product.sku && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Package className="h-4 w-4 text-slate-400" />
                    SKU: {product.sku}
                  </span>
                </>
              )}
            </div>

            <div className="mt-5 flex items-baseline gap-3 rounded-2xl bg-slate-50 p-4">
              <span className="text-3xl font-extrabold text-brand-800">
                {formatRupiah(product.price)}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-base text-slate-400 line-through">
                  {formatRupiah(product.compare_at_price)}
                </span>
              )}
            </div>

            <div className="mt-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Deskripsi Produk
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {product.description}
              </p>
            </div>
          </div>

          {/* Add to Cart Widget */}
          <AddToCartPanel
            productId={product.id}
            price={product.price}
            stock={product.stock}
            minOrder={product.min_order}
          />

          {/* Seller Information Card */}
          {product.store && (
            <div className="surface-card flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <img
                  src={
                    product.store.logo_url ||
                    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80'
                  }
                  alt={product.store.name}
                  className="h-14 w-14 rounded-2xl border border-slate-200 object-cover"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-bold text-slate-900">{product.store.name}</h3>
                    <BadgeCheck className="h-4 w-4 text-brand-600" />
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5" />
                    Dikirim dari {product.store.city}, {product.store.province}
                  </p>
                </div>
              </div>

              <Link
                href={`/stores/${product.store.slug}`}
                className="btn-secondary shrink-0 text-xs sm:text-sm"
              >
                <StoreIcon className="h-4 w-4" />
                <span>Kunjungi Toko</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="mt-12">
        <div className="surface-card p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Ulasan Pembeli Terverifikasi ({reviews.length})
              </h2>
              <p className="text-xs text-slate-500">
                Hanya pembeli yang telah menyelesaikan pesanan yang dapat memberikan ulasan
              </p>
            </div>
          </div>

          {reviews.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Belum ada ulasan untuk produk ini.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {reviews.map((rev) => (
                <div key={rev.id} className="py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">
                        {(rev.user?.full_name || 'P')[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {rev.user?.full_name || 'Pembeli UMKM Hub'}
                        </p>
                        <p className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" />
                          Pembelian Terverifikasi • {formatDateWIB(rev.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
