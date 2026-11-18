import React from 'react';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { Profile } from '@/types/database';
import { formatDateWIB } from '@/utils/format';
import { toggleUserStatusAction } from '@/features/admin/actions';

export default async function AdminUsersPage() {
  let users: Profile[] = [];

  if (isSupabaseConfigured()) {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    users = (data as Profile[]) || [];
  } else {
    users = [
      {
        id: '00000000-0000-4000-8000-000000000001',
        email: 'admin@umkmhub.id',
        full_name: 'Admin Utama UMKM Hub',
        phone: '08111000111',
        avatar_url: null,
        role: 'admin',
        status: 'active',
        created_at: '2026-01-01T08:00:00+07:00',
        updated_at: '2026-01-01T08:00:00+07:00',
      },
      {
        id: '00000000-0000-4000-8000-000000000002',
        email: 'kopigayo@umkmhub.id',
        full_name: 'Hendra Syahputra',
        phone: '08126000221',
        avatar_url: null,
        role: 'seller',
        status: 'active',
        created_at: '2026-01-12T09:00:00+07:00',
        updated_at: '2026-01-12T09:00:00+07:00',
      },
      {
        id: '00000000-0000-4000-8000-000000000003',
        email: 'batiklasem@umkmhub.id',
        full_name: 'Siti Nurhaliza',
        phone: '08132500332',
        avatar_url: null,
        role: 'seller',
        status: 'active',
        created_at: '2026-01-14T10:00:00+07:00',
        updated_at: '2026-01-14T10:00:00+07:00',
      },
      {
        id: '00000000-0000-4000-8000-000000000005',
        email: 'pembeli@umkmhub.id',
        full_name: 'Budi Santoso',
        phone: '081299887766',
        avatar_url: null,
        role: 'customer',
        status: 'active',
        created_at: '2026-01-20T11:00:00+07:00',
        updated_at: '2026-01-20T11:00:00+07:00',
      },
    ];
  }

  return (
    <div className="space-y-6">
      <div className="surface-card p-6">
        <h1 className="text-xl font-extrabold text-slate-900">
          Manajemen Pengguna & Penjual ({users.length})
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Pantau seluruh akun pembeli, penjual UMKM, dan tangguhkan akun yang melanggar ketentuan
        </p>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                <th className="px-6 py-3.5 font-bold">Nama & Email</th>
                <th className="px-4 py-3.5 font-bold">Telepon</th>
                <th className="px-4 py-3.5 font-bold">Peran</th>
                <th className="px-4 py-3.5 font-bold">Terdaftar</th>
                <th className="px-4 py-3.5 font-bold">Status</th>
                <th className="px-6 py-3.5 text-right font-bold">Tindakan Keamanan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{u.full_name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-600">{u.phone || '-'}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase text-slate-800">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-500">
                    {formatDateWIB(u.created_at)}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        u.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {u.status === 'active' ? 'Aktif' : 'Ditangguhkan'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.role !== 'admin' && (
                      <form
                        action={async () => {
                          'use server';
                          await toggleUserStatusAction(
                            u.id,
                            u.status === 'active' ? 'suspended' : 'active'
                          );
                        }}
                      >
                        <button
                          type="submit"
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold ${
                            u.status === 'active'
                              ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                              : 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'active' ? 'Tangguhkan Akun' : 'Aktifkan Kembali'}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
