import React from 'react';
import { notFound } from 'next/navigation';
import { BadgeCheck, MapPin, Phone, Star, Building2 } from 'lucide-react';
import { getProducts, getStoreBySlug } from '@/services/marketplace';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function StoreDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const store = await getStoreBySlug(params.slug);
  if (!store) {
    notFound();
  }

  const { products } = await getProducts({ storeId: store.id, pageSize: 24 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Store Banner & Profile Header */}
      <div className="surface-card overflow-hidden">
        <div className="relative h-48 w-full bg-slate-800 sm:h-64">
          {store.banner_url && (
            <img
              src={store.banner_url}
              alt={store.name}
              className="h-full w-full object-cover opacity-90"
            />
          )}
        </div>

        <div className="relative px-6 pb-6 pt-4 sm:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="-mt-14 h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md">
                <img
                  src={
                    store.logo_url ||
                    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80'
                  }
                  alt={store.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-slate-900">{store.name}</h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
                    UMKM Terverifikasi
                  </span>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-brand-700" />
                    {store.address_detail}, {store.city}, {store.province}
                  </span>
                  {store.nib_number && (
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      NIB: {store.nib_number}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-center">
                <div className="flex items-center justify-center gap-1 text-sm font-extrabold text-slate-900">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {Number(store.rating_avg).toFixed(2)}
                </div>
                <span className="text-[11px] text-slate-500">{store.total_reviews} Ulasan</span>
              </div>

              {store.whatsapp && (
                <a
                  href={`https://wa.me/${store.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                >
                  <Phone className="h-4 w-4" />
                  <span>Hubungi Penjual</span>
                </a>
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tentang UMKM
            </h2>
            <p className="mt-1.5 max-w-4xl text-sm leading-relaxed text-slate-700">
              {store.description}
            </p>
          </div>
        </div>
      </div>

      {/* Store Products */}
      <section className="mt-10">
        <h2 className="text-xl font-extrabold text-slate-900">
          Etalase Produk ({products.length})
        </h2>

        {products.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="Belum ada produk aktif"
              description="Toko UMKM ini sedang menyiapkan produk terbaru mereka."
            />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
