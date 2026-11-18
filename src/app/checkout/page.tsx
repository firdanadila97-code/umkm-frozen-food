import React from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { getUserCartItems } from '@/features/cart/actions';
import { calculateShippingOptions } from '@/services/shipping';
import { CheckoutClient } from '@/features/checkout/CheckoutClient';
import { Address } from '@/types/database';

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { store?: string };
}) {
  const allCartItems = await getUserCartItems();
  if (allCartItems.length === 0) {
    redirect('/cart');
  }

  const targetStoreId = searchParams.store || allCartItems[0]?.product?.store_id;
  const storeItems = allCartItems.filter((item) => item.product?.store_id === targetStoreId);

  if (storeItems.length === 0 || !targetStoreId) {
    redirect('/cart');
  }

  let addresses: Address[] = [];
  if (isSupabaseConfigured()) {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      addresses = (data as Address[]) || [];
    }
  }

  const store = storeItems[0].product?.store;
  const originProvince = store?.province || 'DKI Jakarta';
  const destinationProvince = addresses[0]?.province || 'DKI Jakarta';
  const totalWeightGrams = storeItems.reduce(
    (sum, item) => sum + (item.product?.weight_grams || 250) * item.quantity,
    0
  );

  const shippingOptions = calculateShippingOptions(
    originProvince,
    destinationProvince,
    totalWeightGrams
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Checkout Pengiriman & Pembayaran
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Pastikan alamat tujuan dan layanan kurir sudah sesuai sebelum melanjutkan ke Midtrans
        </p>
      </div>

      <CheckoutClient
        storeId={targetStoreId}
        storeName={store?.name || 'Toko UMKM'}
        storeCity={store?.city || 'Indonesia'}
        items={storeItems}
        addresses={addresses}
        shippingOptions={shippingOptions}
      />
    </div>
  );
}
