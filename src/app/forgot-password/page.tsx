'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { forgotPasswordAction } from '@/features/auth/actions';

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ error?: string; message?: string }>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await forgotPasswordAction(formData);
      setStatus(res);
    });
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="surface-card p-6 sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-800">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-extrabold text-slate-900">Pulihkan Kata Sandi</h1>
        <p className="mt-1 text-sm text-slate-600">
          Masukkan email yang terdaftar pada akun UMKM Hub Anda untuk menerima tautan reset kata
          sandi.
        </p>

        {status.error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
            {status.error}
          </div>
        )}

        {status.message && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-slate-700">
              Alamat Email Terdaftar
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

          <button type="submit" disabled={isPending} className="btn-primary w-full py-2.5">
            {isPending ? 'Mengirim Tautan...' : 'Kirim Tautan Pemulihan'}
          </button>
        </form>

        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Halaman Masuk
        </Link>
      </div>
    </div>
  );
}
