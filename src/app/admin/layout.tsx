import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Users,
  Store,
  Tags,
  Package,
  ClipboardList,
  CreditCard,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { href: '/admin', label: 'Dashboard Admin', icon: ShieldCheck },
    { href: '/admin/users', label: 'Manajemen Pengguna', icon: Users },
    { href: '/admin/stores', label: 'Verifikasi Toko UMKM', icon: Store },
    { href: '/admin/categories', label: 'Manajemen Kategori', icon: Tags },
    { href: '/admin/products', label: 'Moderasi Produk', icon: Package },
    { href: '/admin/orders', label: 'Monitoring Pesanan', icon: ClipboardList },
    { href: '/admin/payments', label: 'Monitoring Pembayaran', icon: CreditCard },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="surface-card p-4">
            <div className="border-b border-slate-100 px-3 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                Otoritas Platform
              </span>
              <h2 className="mt-0.5 text-base font-extrabold text-slate-900">
                Panel Administrator
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
