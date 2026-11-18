import React from 'react';
import { getCategories } from '@/services/marketplace';
import { upsertCategoryAction } from '@/features/admin/actions';

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="surface-card p-6">
        <h1 className="text-xl font-extrabold text-slate-900">
          Manajemen Kategori Produk ({categories.length})
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Tambah atau perbarui kategori produk utama pada marketplace UMKM Hub
        </p>

        <form
          action={async (fd) => {
            'use server';
            await upsertCategoryAction(fd);
          }}
          className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700">Nama Kategori *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="Contoh: Kopi & Teh"
              className="input-field mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700">Deskripsi Singkat *</label>
            <input
              type="text"
              name="description"
              required
              placeholder="Deskripsi kategori unggulan..."
              className="input-field mt-1"
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full">
              + Tambah Kategori
            </button>
          </div>
        </form>
      </div>

      <div className="surface-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
              <th className="px-6 py-3.5 font-bold">Urutan</th>
              <th className="px-4 py-3.5 font-bold">Nama Kategori</th>
              <th className="px-4 py-3.5 font-bold">Slug URL</th>
              <th className="px-6 py-3.5 font-bold">Deskripsi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className="px-6 py-3.5 font-bold text-slate-700">{cat.sort_order}</td>
                <td className="px-4 py-3.5 font-bold text-slate-900">{cat.name}</td>
                <td className="px-4 py-3.5 font-mono text-xs text-brand-800">{cat.slug}</td>
                <td className="px-6 py-3.5 text-xs text-slate-600">{cat.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
