import React from 'react';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { Order } from '@/types/database';
import { formatDateWIB, formatRupiah } from '@/utils/format';
import { OrderStatusBadge } from '@/components/ui/Badge';

export default async function AdminOrdersMonitoringPage() {
  let orders: Order[] = [];

  if (isSupabaseConfigured()) {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('orders')
      .select('*, store:stores(name), customer:profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(50);
    orders = (data as unknown as Order[]) || [];
  }

  return (
    <div className="space-y-6">
      <div className="surface-card p-6">
        <h1 className="text-xl font-extrabold text-slate-900">
          Monitoring Seluruh Pesanan Platform ({orders.length})
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Pantau kelancaran pemenuhan pesanan antara pembeli dan penjual UMKM secara real-time
        </p>
      </div>

      <div className="surface-card overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Belum ada pesanan yang tercatat di database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                  <th className="px-6 py-3.5 font-bold">No. Pesanan</th>
                  <th className="px-4 py-3.5 font-bold">Pembeli</th>
                  <th className="px-4 py-3.5 font-bold">Toko UMKM</th>
                  <th className="px-4 py-3.5 font-bold">Kurir</th>
                  <th className="px-4 py-3.5 font-bold">Grand Total</th>
                  <th className="px-4 py-3.5 font-bold">Status</th>
                  <th className="px-6 py-3.5 font-bold">Waktu (WIB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-6 py-3.5 font-mono text-xs font-bold text-slate-900">
                      {o.order_number}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-700">
                      {o.customer?.full_name || '-'}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-bold text-brand-800">
                      {o.store?.name || '-'}
                    </td>
                    <td className="px-4 py-3.5 text-xs uppercase text-slate-600">
                      {o.courier_code} ({o.courier_service})
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {formatRupiah(o.grand_total)}
                    </td>
                    <td className="px-4 py-3.5">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">
                      {formatDateWIB(o.created_at, true)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
