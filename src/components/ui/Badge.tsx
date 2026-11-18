import React from 'react';
import { OrderStatus, PaymentStatus, ProductStatus, StoreVerificationStatus } from '@/types/database';

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, { label: string; className: string }> = {
    pending: { label: 'Menunggu Pembayaran', className: 'bg-amber-50 text-amber-800 border-amber-200' },
    confirmed: { label: 'Dikonfirmasi', className: 'bg-blue-50 text-blue-800 border-blue-200' },
    processing: { label: 'Diproses Penjual', className: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
    shipped: { label: 'Dalam Pengiriman', className: 'bg-purple-50 text-purple-800 border-purple-200' },
    delivered: { label: 'Selesai Diterima', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    cancelled: { label: 'Dibatalkan', className: 'bg-red-50 text-red-700 border-red-200' },
  };
  const item = styles[status] || styles.pending;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${item.className}`}>
      {item.label}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const styles: Record<PaymentStatus, { label: string; className: string }> = {
    pending: { label: 'Belum Dibayar', className: 'bg-amber-50 text-amber-800 border-amber-200' },
    settlement: { label: 'Lunas (Verified)', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    expire: { label: 'Kedaluwarsa', className: 'bg-slate-100 text-slate-700 border-slate-300' },
    cancel: { label: 'Dibatalkan', className: 'bg-red-50 text-red-700 border-red-200' },
    deny: { label: 'Ditolak', className: 'bg-red-50 text-red-700 border-red-200' },
    refund: { label: 'Dikembalikan', className: 'bg-purple-50 text-purple-800 border-purple-200' },
  };
  const item = styles[status] || styles.pending;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${item.className}`}>
      {item.label}
    </span>
  );
}

export function StoreStatusBadge({ status }: { status: StoreVerificationStatus }) {
  const styles: Record<StoreVerificationStatus, { label: string; className: string }> = {
    pending: { label: 'Menunggu Verifikasi', className: 'bg-amber-50 text-amber-800 border-amber-200' },
    approved: { label: 'UMKM Terverifikasi', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    rejected: { label: 'Ditolak', className: 'bg-red-50 text-red-700 border-red-200' },
    suspended: { label: 'Dibekukan', className: 'bg-slate-200 text-slate-800 border-slate-300' },
  };
  const item = styles[status] || styles.pending;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${item.className}`}>
      {item.label}
    </span>
  );
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const styles: Record<ProductStatus, { label: string; className: string }> = {
    active: { label: 'Aktif Dijual', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    draft: { label: 'Draf', className: 'bg-slate-100 text-slate-700 border-slate-200' },
    out_of_stock: { label: 'Stok Habis', className: 'bg-amber-50 text-amber-800 border-amber-200' },
    archived: { label: 'Diarsipkan', className: 'bg-red-50 text-red-700 border-red-200' },
  };
  const item = styles[status] || styles.active;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${item.className}`}>
      {item.label}
    </span>
  );
}
