'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { resetPasswordAction } from '@/features/auth/actions';

export default function ResetPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ error?: string; message?: string }>({});
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await resetPasswordAction(formData);
      setStatus(res);
      if (res.success) {
        setTimeout(() => router.push('/login'), 1500);
      }
    });
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="surface-card p-6 sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-800">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-extrabold text-slate-900">Atur Kata Sandi Baru</h1>
        <p className="mt-1 text-sm text-slate-600">
          Buat kata sandi baru yang kuat untuk mengamankan akun UMKM Hub Anda.
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
            <label htmlFor="password" className="block text-xs font-bold text-slate-700">
              Kata Sandi Baru
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="input-field mt-1.5"
            />
          </div>

          <div>
            <label htmlFor="confirm_password" className="block text-xs font-bold text-slate-700">
              Konfirmasi Kata Sandi Baru
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              minLength={8}
              className="input-field mt-1.5"
            />
          </div>

          <button type="submit" disabled={isPending} className="btn-primary w-full py-2.5">
            {isPending ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
          </button>
        </form>
      </div>
    </div>
  );
}
