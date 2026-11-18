'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingBag, Lock, Mail, ArrowRight, ShieldCheck, Store, User } from 'lucide-react';
import { loginAction } from '@/features/auth/actions';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const submitCredentials = (targetEmail: string, targetPassword: string) => {
    setErrorMsg(null);
    const formData = new FormData();
    formData.set('email', targetEmail);
    formData.set('password', targetPassword);

    startTransition(async () => {
      const res = await loginAction(formData);
      if (res.error) {
        setErrorMsg(res.error);
        showToast(res.error, 'error');
        return;
      }
      if (res.success && res.redirectTo) {
        showToast('Berhasil masuk ke UMKM Hub!', 'success');
        const customRedirect = searchParams.get('redirect');
        router.push(customRedirect || res.redirectTo);
        router.refresh();
      }
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitCredentials(email, password);
  };

  const handleQuickLogin = (quickEmail: string, quickPassword: string) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    submitCredentials(quickEmail, quickPassword);
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="surface-card p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-800 text-white">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Masuk ke UMKM Hub</h1>
          <p className="mt-1 text-sm text-slate-600">
            Kelola pesanan belanja, toko UMKM, atau panel Administrator
          </p>
        </div>

        {(errorMsg || searchParams.get('error')) && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700">
            {errorMsg || searchParams.get('error')}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-slate-700">
              Alamat Email
            </label>
            <div className="relative mt-1.5">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-xs font-bold text-slate-700">
                Kata Sandi
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-brand-800 hover:underline"
              >
                Lupa kata sandi?
              </Link>
            </div>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field pl-10"
              />
            </div>
          </div>

          <button type="submit" disabled={isPending} className="btn-primary w-full py-3">
            <span>{isPending ? 'Memverifikasi...' : 'Masuk Sekarang'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* 1-Click Quick Login Buttons */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs font-bold text-slate-800">
            Akses Cepat 1-Klik (Admin / Penjual / Pembeli):
          </p>
          <div className="mt-2.5 grid grid-cols-1 gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleQuickLogin('admin@umkmhub.id', 'AdminUMKM123!')}
              className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-left text-xs font-bold text-brand-900 transition hover:bg-brand-100"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand-700" />
                <span>Masuk sebagai Administrator</span>
              </span>
              <span className="font-mono text-[11px] text-brand-700">admin@umkmhub.id</span>
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => handleQuickLogin('kopigayo@umkmhub.id', 'SellerUMKM123!')}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-left text-xs font-semibold text-slate-700 transition hover:border-brand-700"
            >
              <span className="flex items-center gap-2">
                <Store className="h-4 w-4 text-brand-700" />
                <span>Masuk sebagai Penjual UMKM</span>
              </span>
              <span className="font-mono text-[11px] text-slate-500">kopigayo@umkmhub.id</span>
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => handleQuickLogin('pembeli@umkmhub.id', 'CustomerUMKM123!')}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-left text-xs font-semibold text-slate-700 transition hover:border-brand-700"
            >
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 text-brand-700" />
                <span>Masuk sebagai Pembeli</span>
              </span>
              <span className="font-mono text-[11px] text-slate-500">pembeli@umkmhub.id</span>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Belum punya akun?{' '}
          <Link href="/register" className="font-bold text-brand-800 hover:underline">
            Daftar sebagai Pembeli atau Penjual UMKM
          </Link>
        </p>
      </div>
    </div>
  );
}
