import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ShieldCheck, Truck, CreditCard, MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white text-slate-600">
      {/* Trust Strip */}
      <div className="border-b border-slate-100 bg-brand-50/50">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-800 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">100% UMKM Terverifikasi</h4>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                Seluruh toko melalui kurasi kualitas dan verifikasi identitas usaha resmi.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-800 text-white">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Transaksi Aman Midtrans</h4>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                Mendukung QRIS, Virtual Account Bank Nasional, dan E-Wallet dengan rekening bersama.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-800 text-white">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Pengiriman Nusantara</h4>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                Terintegrasi dengan JNE, SiCepat, J&T Express, dan Pos Indonesia dari Aceh hingga Papua.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-800 text-white">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="text-lg font-extrabold text-slate-900">
                UMKM<span className="text-brand-700">Hub</span> Indonesia
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
              Ekosistem pasar digital yang mempertemukan pengrajin, petani, dan pelaku UMKM terbaik
              Indonesia langsung dengan pelanggan di seluruh tanah air.
            </p>
            <div className="mt-5 space-y-2 text-xs text-slate-500">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-700" />
                Gedung Smesco Indonesia Lt. 4, Jl. Gatot Subroto Kav. 94, Jakarta Selatan
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-700" />
                (021) 2789-9900 / WhatsApp Layanan Mitra: 0811-1000-111
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-700" />
                layanan@umkmhub.id
              </p>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Jelajahi Kategori
            </h5>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/marketplace?category=kuliner-kemasan" className="hover:text-brand-800">
                  Kuliner & Kopi Nusantara
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=batik-wastra" className="hover:text-brand-800">
                  Batik Tulis & Wastra
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=kriya-anyaman" className="hover:text-brand-800">
                  Kriya & Anyaman
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=herbal-kesehatan" className="hover:text-brand-800">
                  Herbal & Madu Murni
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Layanan Pelanggan
            </h5>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/customer" className="hover:text-brand-800">
                  Akun Pembeli
                </Link>
              </li>
              <li>
                <Link href="/customer/orders" className="hover:text-brand-800">
                  Lacak Pesanan
                </Link>
              </li>
              <li>
                <Link href="/customer/addresses" className="hover:text-brand-800">
                  Daftar Alamat Pengiriman
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-brand-800">
                  Keranjang Belanja
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Mitra Penjual & Admin
            </h5>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/register?role=seller" className="hover:text-brand-800">
                  Buka Toko UMKM Gratis
                </Link>
              </li>
              <li>
                <Link href="/seller" className="hover:text-brand-800">
                  Dashboard Penjual UMKM
                </Link>
              </li>
              <li>
                <Link href="/seller/reports" className="hover:text-brand-800">
                  Laporan Penjualan
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-brand-800">
                  Portal Administrator
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} UMKM Hub Indonesia. Bangga Buatan Indonesia.</p>
          <p>Zona Waktu: Asia/Jakarta (WIB) • Mata Uang: Rupiah (IDR)</p>
        </div>
      </div>
    </footer>
  );
}
