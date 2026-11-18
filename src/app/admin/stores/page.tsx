import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { getFeaturedStores } from '@/services/marketplace';
import { Store } from '@/types/database';
import { StoreStatusBadge } from '@/components/ui/Badge';
import { verifyStoreAction } from '@/features/admin/actions';

export default async function AdminStoresVerificationPage() {
  let stores: Store[] = [];

  if (isSupabaseConfigured()) {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false });
    stores = (data as Store[]) || [];
  } else {
    stores = await getFeaturedStores(10);
  }

  return (
    <div className="space-y-6">
      <div className="surface-card p-6">
        <h1 className="text-xl font-extrabold text-slate-900">
          Verifikasi & Kurasi Toko UMKM ({stores.length})
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Setujui atau tolak pendaftaran toko UMKM setelah memeriksa kelengkapan alamat dan nomor
          NIB
        </p>
      </div>

      <div className="space-y-4">
        {stores.map((store) => (
          <div
            key={store.id}
            className="surface-card flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-extrabold text-slate-900">{store.name}</h2>
                <StoreStatusBadge status={store.verification_status} />
              </div>
              <p className="text-xs text-slate-500">
                Lokasi: {store.address_detail}, {store.city}, {store.province} • NIB:{' '}
                <strong>{store.nib_number || 'Belum dilampirkan'}</strong>
              </p>
              <p className="text-xs text-slate-600">{store.description}</p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <form
                action={async () => {
                  'use server';
                  await verifyStoreAction(store.id, 'approved');
                }}
              >
                <button type="submit" className="btn-primary py-2 px-3 text-xs">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Setujui UMKM</span>
                </button>
              </form>

              <form
                action={async () => {
                  'use server';
                  await verifyStoreAction(
                    store.id,
                    'rejected',
                    'Mohon lengkapi alamat detail dan identitas UMKM.'
                  );
                }}
              >
                <button type="submit" className="btn-danger py-2 px-3 text-xs">
                  <XCircle className="h-4 w-4" />
                  <span>Tolak</span>
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
