import React from 'react';
import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[65vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-800">
        <Compass className="h-8 w-8" />
      </div>
      <h1 className="mt-5 text-2xl font-extrabold text-slate-900">
        Halaman Tidak Ditemukan (404)
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Maaf, halaman atau produk UMKM yang Anda cari tidak tersedia atau telah dipindahkan.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link href="/" className="btn-primary">
          Kembali ke Beranda
        </Link>
        <Link href="/marketplace" className="btn-secondary">
          Lihat Katalog
        </Link>
      </div>
    </div>
  );
}
