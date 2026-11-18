import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { Payment } from '@/types/database';
import { formatDateWIB, formatRupiah } from '@/utils/format';
import { PaymentStatusBadge } from '@/components/ui/Badge';

export default async function AdminPaymentsMonitoringPage() {
  let payments: Payment[] = [];

  if (isSupabaseConfigured()) {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    payments = (data as Payment[]) || [];
  }

  return (
    <div className="space-y-6">
      <div className="surface-card p-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-brand-700" />
          <h1 className="text-xl font-extrabold text-slate-900">
            Monitoring Pembayaran & Webhook Midtrans
          </h1>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Endpoint Webhook Resmi:{' '}
          <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-800">
            POST /api/webhooks/midtrans
          </code>{' '}
          (Memverifikasi SHA-512 Signature sebelum mengubah status pembayaran).
        </p>
      </div>

      <div className="surface-card overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Belum ada log transaksi pembayaran Midtrans.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                  <th className="px-6 py-3.5 font-bold">Midtrans Order ID</th>
                  <th className="px-4 py-3.5 font-bold">Metode</th>
                  <th className="px-4 py-3.5 font-bold">Nominal</th>
                  <th className="px-4 py-3.5 font-bold">Status</th>
                  <th className="px-6 py-3.5 font-bold">Waktu Lunas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((pay) => (
                  <tr key={pay.id}>
                    <td className="px-6 py-3.5 font-mono text-xs font-bold text-slate-900">
                      {pay.midtrans_order_id}
                    </td>
                    <td className="px-4 py-3.5 text-xs uppercase text-slate-600">
                      {pay.payment_type || 'Snap Pending'} {pay.bank ? `(${pay.bank})` : ''}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-brand-800">
                      {formatRupiah(pay.gross_amount)}
                    </td>
                    <td className="px-4 py-3.5">
                      <PaymentStatusBadge status={pay.status} />
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">
                      {pay.paid_at ? formatDateWIB(pay.paid_at, true) : '-'}
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
