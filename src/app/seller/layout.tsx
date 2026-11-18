import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Store,
  Package,
  PlusCircle,
  ClipboardList,
  BarChart3,
} from 'lucide-react';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { href: '/seller', label: 'Dashboard Toko', icon: LayoutDashboard },
    { href: '/seller/store', label: 'Pengaturan Toko UMKM', icon: Store },
    { href: '/seller/products', label: 'Manajemen Produk', icon: Package },
    { href: '/seller/products/new', label: 'Tambah Produk Baru', icon: PlusCircle },
    { href: '/seller/orders', label: 'Pesanan Masuk', icon: ClipboardList },
    { href: '/seller/reports', label: 'Laporan Penjualan', icon: BarChart3 },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="surface-card p-4">
            <div className="border-b border-slate-100 px-3 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                Mitra Penjual UMKM
              </span>
              <h2 className="mt-0.5 text-base font-extrabold text-slate-900">
                Seller Center
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
          </div>
        </aside>

        <div className="lg:col-span-9">{children}</div>
      </div>
    </div>
  );
}
