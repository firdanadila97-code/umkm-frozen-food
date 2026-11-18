'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingBag, Store, User } from 'lucide-react';
import { registerAction } from '@/features/auth/actions';
import { useToast } from '@/components/ui/Toast';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'seller' ? 'seller' : 'customer';
  const [role, setRole] = useState<'customer' | 'seller'>(initialRole);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    formData.set('role', role);

    startTransition(async () => {
      const res = await registerAction(formData);
      if (res.error) {
        setErrorMsg(res.error);
        showToast(res.error, 'error');
        return;
      }
      if (res.redirectTo) {
        showToast('Pendaftaran berhasil!', 'success');
        router.push(res.redirectTo);
        router.refresh();
      } else if (res.message) {
        setMessage(res.message);
        showToast(res.message, 'info');
      }
    });
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="surface-card p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-800 text-white">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Buat Akun UMKM Hub</h1>
          <p className="mt-1 text-sm text-slate-600">
            Pilih peran akun Anda untuk mulai berbelanja atau berjualan produk lokal
          </p>
        </div>

        {/* Role Selector */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`flex flex-col items-center gap-1.5 rounded-2xl border p-4 text-center transition ${
              role === 'customer'
                ? 'border-brand-700 bg-brand-50/70 text-brand-900 ring-2 ring-brand-500/20'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            <User className="h-5 w-5 text-brand-700" />
            <span className="text-xs font-bold">Pembeli</span>
            <span className="text-[11px] text-slate-500">Belanja produk UMKM</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('seller')}
            className={`flex flex-col items-center gap-1.5 rounded-2xl border p-4 text-center transition ${
              role === 'seller'
                ? 'border-brand-700 bg-brand-50/70 text-brand-900 ring-2 ring-brand-500/20'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            <Store className="h-5 w-5 text-brand-700" />
            <span className="text-xs font-bold">Penjual UMKM</span>
            <span className="text-[11px] text-slate-500">Buka toko & kelola produk</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700">
            {errorMsg}
          </div>
        )}

        {message && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="full_name" className="block text-xs font-bold text-slate-700">
              Nama Lengkap Sesuai KTP
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              placeholder="Contoh: Hendra Syahputra"
              className="input-field mt-1.5"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700">
                Alamat Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="nama@email.com"
                className="input-field mt-1.5"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-slate-700">
                Nomor WhatsApp Aktif
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="081234567890"
                className="input-field mt-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700">
                Kata Sandi (Min. 8 Karakter)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                className="input-field mt-1.5"
              />
            </div>

            <div>
              <label htmlFor="confirm_password" className="block text-xs font-bold text-slate-700">
                Konfirmasi Kata Sandi
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                className="input-field mt-1.5"
              />
            </div>
          </div>

          <button type="submit" disabled={isPending} className="btn-primary w-full py-3">
            {isPending
              ? 'Mendaftarkan Akun...'
              : role === 'seller'
                ? 'Daftar Sebagai Mitra UMKM'
                : 'Daftar Sebagai Pembeli'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-600">
          Sudah memiliki akun?{' '}
          <Link href="/login" className="font-bold text-brand-800 hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
