import React from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { getCategories, getProducts } from '@/services/marketplace';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';

interface MarketplacePageProps {
  searchParams: {
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: 'popular' | 'newest' | 'price_asc' | 'price_desc' | 'rating';
    page?: string;
  };
}

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const page = Number(searchParams.page || 1);
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;
  const sort = searchParams.sort || 'popular';

  const [categories, result] = await Promise.all([
    getCategories(),
    getProducts({
      q: searchParams.q,
      categorySlug: searchParams.category,
      minPrice,
      maxPrice,
      sort,
      page,
      pageSize: 8,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Katalog Produk UMKM Indonesia
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Menampilkan <span className="font-bold text-slate-900">{result.total}</span> produk asli
          dari toko UMKM terverifikasi
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-3">
          <form action="/marketplace" method="GET" className="surface-card space-y-6 p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <SlidersHorizontal className="h-4 w-4 text-brand-700" />
                <span>Filter Pencarian</span>
              </div>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-800"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Link>
            </div>

            {/* Keyword */}
            <div>
              <label htmlFor="filter-q" className="block text-xs font-bold text-slate-700">
                Kata Kunci Produk
              </label>
              <div className="relative mt-1.5">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="filter-q"
                  type="search"
                  name="q"
                  defaultValue={searchParams.q || ''}
                  placeholder="Contoh: Kopi, Batik..."
                  className="input-field pl-9"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="filter-category" className="block text-xs font-bold text-slate-700">
                Kategori UMKM
              </label>
              <select
                id="filter-category"
                name="category"
                defaultValue={searchParams.category || ''}
                className="input-field mt-1.5"
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <span className="block text-xs font-bold text-slate-700">Rentang Harga (IDR)</span>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="minPrice"
                  defaultValue={searchParams.minPrice || ''}
                  placeholder="Min (Rp)"
                  min={0}
                  step={5000}
                  className="input-field text-xs"
                />
                <input
                  type="number"
                  name="maxPrice"
                  defaultValue={searchParams.maxPrice || ''}
                  placeholder="Maks (Rp)"
                  min={0}
                  step={5000}
                  className="input-field text-xs"
                />
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label htmlFor="filter-sort" className="block text-xs font-bold text-slate-700">
                Urutkan Berdasarkan
              </label>
              <select
                id="filter-sort"
                name="sort"
                defaultValue={sort}
                className="input-field mt-1.5"
              >
                <option value="popular">Paling Laris</option>
                <option value="newest">Terbaru</option>
                <option value="rating">Ulasan Tertinggi</option>
                <option value="price_asc">Harga Terendah</option>
                <option value="price_desc">Harga Tertinggi</option>
              </select>
            </div>

            <button type="submit" className="btn-primary w-full">
              Terapkan Filter
            </button>
          </form>
        </aside>

        {/* Product Grid */}
        <section className="lg:col-span-9">
          {/* Quick Category Pills */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <Link
              href="/marketplace"
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                !searchParams.category
                  ? 'bg-brand-800 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-brand-700'
              }`}
            >
              Semua Produk
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/marketplace?category=${cat.slug}`}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  searchParams.category === cat.slug
                    ? 'bg-brand-800 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-brand-700'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {result.products.length === 0 ? (
            <EmptyState
              title="Produk tidak ditemukan"
              description="Coba ubah kata kunci pencarian atau sesuaikan filter kategori dan rentang harga Anda."
              actionLabel="Reset Semua Filter"
              actionHref="/marketplace"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {result.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const params = new URLSearchParams();
                    if (searchParams.q) params.set('q', searchParams.q);
                    if (searchParams.category) params.set('category', searchParams.category);
                    if (searchParams.minPrice) params.set('minPrice', searchParams.minPrice);
                    if (searchParams.maxPrice) params.set('maxPrice', searchParams.maxPrice);
                    if (searchParams.sort) params.set('sort', searchParams.sort);
                    params.set('page', String(p));

                    return (
                      <Link
                        key={p}
                        href={`/marketplace?${params.toString()}`}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition ${
                          p === page
                            ? 'bg-brand-800 text-white'
                            : 'border border-slate-200 bg-white text-slate-700 hover:border-brand-700'
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
