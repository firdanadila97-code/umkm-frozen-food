import React from 'react';
import { getProducts } from '@/services/marketplace';
import { formatRupiah } from '@/utils/format';
import { ProductStatusBadge } from '@/components/ui/Badge';
import { moderateProductStatusAction } from '@/features/admin/actions';

export default async function AdminProductsModerationPage() {
  const { products } = await getProducts({ pageSize: 20 });

  return (
    <div className="space-y-6">
      <div className="surface-card p-6">
        <h1 className="text-xl font-extrabold text-slate-900">
          Moderasi Produk Marketplace ({products.length})
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Awasi kepatuhan produk UMKM dan arsipkan produk yang melanggar standar kualitas
        </p>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                <th className="px-6 py-3.5 font-bold">Produk</th>
                <th className="px-4 py-3.5 font-bold">Toko UMKM</th>
                <th className="px-4 py-3.5 font-bold">Harga</th>
                <th className="px-4 py-3.5 font-bold">Stok</th>
                <th className="px-4 py-3.5 font-bold">Status</th>
                <th className="px-6 py-3.5 text-right font-bold">Moderasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 font-bold text-slate-900">{p.name}</td>
                  <td className="px-4 py-4 text-xs font-semibold text-slate-700">
                    {p.store?.name}
                  </td>
                  <td className="px-4 py-4 font-bold text-brand-800">{formatRupiah(p.price)}</td>
                  <td className="px-4 py-4 text-slate-700">{p.stock}</td>
                  <td className="px-4 py-4">
                    <ProductStatusBadge status={p.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form
                      action={async () => {
                        'use server';
                        await moderateProductStatusAction(
                          p.id,
                          p.status === 'active' ? 'archived' : 'active'
                        );
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                      >
                        {p.status === 'active' ? 'Arsipkan' : 'Aktifkan'}
                      </button>
                    </form>
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
