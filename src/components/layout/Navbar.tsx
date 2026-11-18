import React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  Store,
  ShieldCheck,
  User,
  LayoutDashboard,
} from 'lucide-react';
import { getCurrentUserProfile, logoutAction } from '@/features/auth/actions';
import { getUserCartItems } from '@/features/cart/actions';
import { isSupabaseConfigured } from '@/lib/supabase/server';

export async function Navbar() {
  const [profile, cartItems] = await Promise.all([
    getCurrentUserProfile(),
    getUserCartItems(),
  ]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const configured = isSupabaseConfigured();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      {!configured && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-center text-xs font-medium text-amber-900">
          Mode Pratinjau Database: Salin <code className="rounded bg-amber-100 px-1 py-0.5 font-mono">.env.example</code> ke <code className="rounded bg-amber-100 px-1 py-0.5 font-mono">.env.local</code> dan jalankan migrasi SQL Supabase untuk mengaktifkan transaksi penuh.
        </div>
      )}

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-800 text-white shadow-xs">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              UMKM<span className="text-brand-700">Hub</span>
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Karya Nusantara
            </span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <form
          action="/marketplace"
          method="GET"
          className="hidden max-w-md flex-1 md:flex"
        >
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              name="q"
              placeholder="Cari kopi Gayo, batik tulis, anyaman, madu murni..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </form>

        {/* Navigation Links & Actions */}
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/marketplace"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-brand-800"
          >
            Katalog
          </Link>

          <Link
            href="/seller"
            className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-800 lg:inline-flex"
          >
            <Store className="h-4 w-4 text-brand-700" />
            <span>Panel UMKM</span>
          </Link>

          <Link
            href="/admin"
            className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 xl:inline-flex"
          >
            <ShieldCheck className="h-4 w-4 text-slate-600" />
            <span>Admin</span>
          </Link>

          {/* Shopping Cart */}
          <Link
            href="/cart"
            className="relative inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 transition-colors hover:border-brand-700 hover:text-brand-800"
            aria-label="Keranjang Belanja"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {profile ? (
            <div className="flex items-center gap-2">
              <Link
                href={
                  profile.role === 'admin'
                    ? '/admin'
                    : profile.role === 'seller'
                      ? '/seller'
                      : '/customer'
                }
                className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50/70 px-3 py-2 text-xs font-bold text-brand-900 hover:bg-brand-100"
              >
                <LayoutDashboard className="h-4 w-4 text-brand-700" />
                <span className="max-w-[110px] truncate">{profile.full_name}</span>
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700"
                >
                  Keluar
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-secondary py-2 text-xs sm:text-sm">
                <User className="h-4 w-4" />
                <span>Masuk</span>
              </Link>
              <Link
                href="/register"
                className="btn-primary hidden py-2 text-xs sm:inline-flex sm:text-sm"
              >
                Daftar UMKM
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
