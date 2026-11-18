import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingBag,
  MapPin,
  UserCheck,
  Store,
} from 'lucide-react';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { href: '/customer', label: 'Ringkasan Akun', icon: LayoutDashboard },
    { href: '/customer/orders', label: 'Riwayat Pesanan', icon: ShoppingBag },
    { href: '/customer/addresses', label: 'Alamat Pengiriman', icon: MapPin },
    { href: '/customer/profile', label: 'Pengaturan Profil', icon: UserCheck },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="surface-card p-4">
            <div className="border-b border-slate-100 px-3 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                Portal Pelanggan
              </span>
              <h2 className="mt-0.5 text-base font-extrabold text-slate-900">
                Akun Belanja Saya
              </h2>
            </div>

            <nav className="mt-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-brand-50 hover:text-brand-800"
                  >
                    <Icon className="h-4 w-4 text-brand-700" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 rounded-xl bg-brand-50 p-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-900">
                <Store className="h-4 w-4 text-brand-700" />
                <span>Ingin Jualan di UMKM Hub?</span>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                Buka toko UMKM Anda dan jangkau pelanggan seluruh Indonesia.
              </p>
              <Link href="/seller/store" className="btn-primary mt-3 w-full py-2 text-xs">
                Buka Toko UMKM
              </Link>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-9">{children}</div>
      </div>
    </div>
  );
}
