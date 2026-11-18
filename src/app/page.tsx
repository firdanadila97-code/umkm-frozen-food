import React from 'react';
import Link from 'next/link';
import {
  Search,
  ArrowRight,
  BadgeCheck,
  MapPin,
  Star,
  Sparkles,
  Store as StoreIcon,
  ShieldCheck,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { getCategories, getFeaturedStores, getProducts } from '@/services/marketplace';
import { ProductCard } from '@/components/marketplace/ProductCard';

export default async function HomePage() {
  const [categories, featuredStores, popularResult, newestResult] = await Promise.all([
    getCategories(),
    getFeaturedStores(3),
    getProducts({ sort: 'popular', pageSize: 4 }),
    getProducts({ sort: 'newest', pageSize: 4 }),
  ]);

  return (
    <div className="space-y-16 pb-8">
      {/* 1. HERO SECTION & SEARCH BAR */}
      <section className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-bold text-brand-800">
                <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                <span>Pasar Digital Resmi Pengrajin & Produsen Lokal</span>
              </div>

              <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl lg:leading-[1.15]">
                Dukung Karya Terbaik{' '}
                <span className="text-brand-800">UMKM Nusantara</span> Langsung dari Sumbernya
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Temukan ribuan produk autentik mulai dari Kopi Arabika Gayo, Batik Tulis Lasem,
                Anyaman Ketak Lombok, hingga Madu Hutan Murni yang dikurasi langsung dari pelaku
                usaha kecil menengah terverifikasi.
              </p>

              {/* Hero Search Form */}
              <form
                action="/marketplace"
                method="GET"
                className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    name="q"
                    placeholder="Apa produk lokal yang Anda cari hari ini?"
                    className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <button type="submit" className="btn-primary py-3.5 px-6 text-sm">
                  <span>Cari Produk</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Popular Keywords */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Pencarian Populer:</span>
                <Link
                  href="/marketplace?q=Kopi+Gayo"
                  className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-800"
                >
                  Kopi Gayo
                </Link>
                <Link
                  href="/marketplace?q=Batik+Tulis"
                  className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-800"
                >
                  Batik Tulis Lasem
                </Link>
                <Link
                  href="/marketplace?q=Madu+Sumbawa"
                  className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-800"
                >
                  Madu Sumbawa
                </Link>
                <Link
                  href="/marketplace?q=Rotan"
                  className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-800"
                >
                  Anyaman Rotan
                </Link>
              </div>
            </div>

            {/* Hero Showcase Card */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=1000&q=80"
                  alt="Produk Unggulan UMKM Indonesia"
                  className="h-80 w-full object-cover opacity-85 sm:h-96"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent p-6 flex flex-col justify-end">
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-bold text-white">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Kurasi Terbaik Minggu Ini
                  </span>
                  <h2 className="mt-2 text-xl font-bold text-white">
                    Panen Raya Kopi Spesialti & Kriya Nusantara
                  </h2>
                  <p className="mt-1 text-xs text-slate-200">
                    100% hasil penjualan diteruskan langsung ke rekening koperasi & pengrajin daerah.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
              Kategori Pilihan Nusantara
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Telusuri produk UMKM berdasarkan kategori unggulan daerah
            </p>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1 text-sm font-bold text-brand-800 hover:text-brand-900"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/marketplace?category=${cat.slug}`}
              className="surface-card group flex flex-col overflow-hidden p-3 transition-all hover:-translate-y-0.5 hover:border-brand-700"
            >
              <div className="aspect-4/3 w-full overflow-hidden rounded-xl bg-slate-100">
                <img
                  src={
                    cat.image_url ||
                    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h3 className="mt-3 text-center text-xs font-bold text-slate-900 group-hover:text-brand-800 sm:text-sm">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. POPULAR PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-800">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                Produk Terlaris Minggu Ini
              </h2>
              <p className="text-sm text-slate-600">
                Produk UMKM paling diminati dengan ulasan terverifikasi tertinggi
              </p>
            </div>
          </div>
          <Link
            href="/marketplace?sort=popular"
            className="inline-flex items-center gap-1 text-sm font-bold text-brand-800 hover:text-brand-900"
          >
            <span>Lihat Katalog</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popularResult.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. FEATURED UMKM STORES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-800">
              <StoreIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                Mitra UMKM Unggulan
              </h2>
              <p className="text-sm text-slate-600">
                Kenali kisah dan dedikasi para pelaku usaha lokal di balik produk berkualitas
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {featuredStores.map((store) => (
            <Link
              key={store.id}
              href={`/stores/${store.slug}`}
              className="surface-card group flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:border-brand-700"
            >
              <div className="relative h-32 w-full bg-slate-200">
                {store.banner_url && (
                  <img
                    src={store.banner_url}
                    alt={store.name}
                    className="h-full w-full object-cover"
                  />
                )}
                <div className="absolute -bottom-6 left-5 h-14 w-14 overflow-hidden rounded-2xl border-2 border-white bg-white shadow-md">
                  <img
                    src={
                      store.logo_url ||
                      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80'
                    }
                    alt={store.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-5 pt-8">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-800">
                      {store.name}
                    </h3>
                    <BadgeCheck className="h-4 w-4 shrink-0 text-brand-600" />
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {store.city}, {store.province}
                  </p>
                  <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-slate-600">
                    {store.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {Number(store.rating_avg).toFixed(2)} ({store.total_reviews} ulasan)
                  </span>
                  <span className="font-bold text-brand-800 group-hover:underline">
                    Kunjungi Toko →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. NEW ARRIVALS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-800">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                Koleksi Terbaru UMKM
              </h2>
              <p className="text-sm text-slate-600">
                Produk baru yang siap dikirim langsung dari bengkel kriya & rumah produksi
              </p>
            </div>
          </div>
          <Link
            href="/marketplace?sort=newest"
            className="inline-flex items-center gap-1 text-sm font-bold text-brand-800 hover:text-brand-900"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {newestResult.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. PROMOTIONAL SELLER CALL-TO-ACTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-brand-900 px-6 py-10 text-white shadow-lg sm:px-12 sm:py-12">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <span className="inline-block rounded-lg bg-brand-800 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-200">
                Program Digitalisasi UMKM 2026
              </span>
              <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">
                Punya Usaha Kuliner, Kriya, atau Busana Lokal?
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-100 sm:text-base">
                Bergabunglah bersama ribuan pelaku UMKM di seluruh Indonesia. Nikmati fasilitas
                dashboard manajemen stok, laporan penjualan otomatis, dan pencairan dana transparan.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:justify-end">
              <Link
                href="/register?role=seller"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-brand-900 shadow-sm transition hover:bg-brand-50"
              >
                <span>Buka Toko Gratis</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center rounded-xl border border-brand-700 bg-brand-800/60 px-5 py-3.5 text-sm font-semibold text-white hover:bg-brand-800"
              >
                Pelajari Mitra
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
