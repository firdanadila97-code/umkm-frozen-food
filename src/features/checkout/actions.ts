'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { addressSchema, checkoutSchema, reviewSchema } from '@/schemas';
import { calculateShippingOptions } from '@/services/shipping';
import { createMidtransSnapTransaction } from '@/services/midtrans';

export async function saveAddressAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { error: 'Database Supabase belum dikonfigurasi di .env.local.' };
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Silakan masuk terlebih dahulu.' };

  const parsed = addressSchema.safeParse({
    label: formData.get('label'),
    recipient_name: formData.get('recipient_name'),
    phone: formData.get('phone'),
    province: formData.get('province'),
    city: formData.get('city'),
    district: formData.get('district'),
    postal_code: formData.get('postal_code'),
    full_address: formData.get('full_address'),
    notes: formData.get('notes'),
    is_default: formData.get('is_default') === 'true',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  if (parsed.data.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id);
  }

  const { error } = await supabase.from('addresses').insert({
    ...parsed.data,
    user_id: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath('/customer/addresses');
  revalidatePath('/checkout');
  return { success: true, message: 'Alamat pengiriman berhasil disimpan.' };
}

export async function deleteAddressAction(addressId: string) {
  if (!isSupabaseConfigured()) return { error: 'Supabase belum dikonfigurasi.' };

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from('addresses').delete().eq('id', addressId);
  if (error) return { error: error.message };

  revalidatePath('/customer/addresses');
  revalidatePath('/checkout');
  return { success: true };
}

/**
 * Executes transactional checkout via PostgreSQL RPC `create_checkout_order`,
 * recalculating shipping and prices strictly on the server, and prepares Midtrans Snap token.
 */
export async function processCheckoutAction(input: {
  store_id: string;
  address_id: string;
  courier_code: 'jne' | 'sicepat' | 'jnt' | 'pos';
  courier_service: string;
  notes?: string;
}) {
  if (!isSupabaseConfigured()) {
    return { error: 'Database Supabase belum dikonfigurasi di .env.local.' };
  }

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sesi Anda telah berakhir. Silakan masuk kembali.' };

  // 1. Fetch store & destination address to compute server-verified shipping cost
  const [{ data: store }, { data: address }, { data: cart }] = await Promise.all([
    supabase.from('stores').select('id, province, name').eq('id', parsed.data.store_id).single(),
    supabase
      .from('addresses')
      .select('*')
      .eq('id', parsed.data.address_id)
      .eq('user_id', user.id)
      .single(),
    supabase.from('carts').select('id').eq('user_id', user.id).single(),
  ]);

  if (!store || !address || !cart) {
    return { error: 'Data toko, alamat pengiriman, atau keranjang tidak ditemukan.' };
  }

  const { data: cartItems } = await supabase
    .from('cart_items')
    .select('quantity, product:products!inner(id, store_id, weight_grams, price, name)')
    .eq('cart_id', cart.id)
    .eq('product.store_id', store.id);

  if (!cartItems || cartItems.length === 0) {
    return { error: 'Tidak ada produk dari toko ini di keranjang Anda.' };
  }

  const totalWeightGrams = cartItems.reduce((sum, ci) => {
    const prod = ci.product as unknown as { weight_grams: number };
    return sum + (prod?.weight_grams || 250) * ci.quantity;
  }, 0);

  const shippingOptions = calculateShippingOptions(
    store.province,
    address.province,
    totalWeightGrams
  );

  const selectedShipping = shippingOptions.find(
    (opt) =>
      opt.courierCode === parsed.data.courier_code &&
      opt.service === parsed.data.courier_service
  );

  if (!selectedShipping) {
    return { error: 'Layanan pengiriman tidak valid.' };
  }

  // 2. Call PostgreSQL Transactional RPC `create_checkout_order`
  const { data: orderId, error: rpcError } = await supabase.rpc('create_checkout_order', {
    p_user_id: user.id,
    p_store_id: store.id,
    p_address_id: address.id,
    p_courier_code: selectedShipping.courierCode,
    p_courier_service: selectedShipping.service,
    p_shipping_cost: selectedShipping.cost,
    p_notes: parsed.data.notes || null,
  });

  if (rpcError || !orderId) {
    return { error: rpcError?.message || 'Gagal membuat pesanan. Silakan coba lagi.' };
  }

  // 3. Attempt to generate Midtrans Sandbox Snap Token if MIDTRANS_SERVER_KEY is configured
  let snapToken: string | null = null;
  let snapRedirectUrl: string | null = null;

  try {
    const { data: createdOrder } = await supabase
      .from('orders')
      .select('order_number, grand_total, shipping_cost, service_fee')
      .eq('id', orderId)
      .single();

    if (createdOrder && process.env.MIDTRANS_SERVER_KEY && !process.env.MIDTRANS_SERVER_KEY.includes('xxxx')) {
      const snap = await createMidtransSnapTransaction({
        orderId: createdOrder.order_number,
        grossAmount: Number(createdOrder.grand_total),
        customer: {
          firstName: address.recipient_name,
          email: user.email || 'customer@umkmhub.id',
          phone: address.phone,
        },
        items: [
          ...cartItems.map((ci) => {
            const p = ci.product as unknown as { id: string; name: string; price: number };
            return {
              id: p.id,
              name: p.name,
              price: Number(p.price),
              quantity: ci.quantity,
            };
          }),
          {
            id: 'SHIPPING',
            name: `Ongkir ${selectedShipping.courierName} ${selectedShipping.service}`,
            price: selectedShipping.cost,
            quantity: 1,
          },
          {
            id: 'SERVICE_FEE',
            name: 'Biaya Layanan Platform',
            price: Number(createdOrder.service_fee),
            quantity: 1,
          },
        ],
      });

      snapToken = snap.token;
      snapRedirectUrl = snap.redirect_url;
    }
  } catch {
    // Order remains safely in 'pending' payment state until user initiates Midtrans Sandbox payment
  }

  revalidatePath('/cart');
  revalidatePath('/customer/orders');
  return {
    success: true,
    orderId: orderId as string,
    snapToken,
    snapRedirectUrl,
  };
}

export async function submitReviewAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { error: 'Database Supabase belum dikonfigurasi.' };
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Silakan masuk terlebih dahulu.' };

  const parsed = reviewSchema.safeParse({
    order_id: formData.get('order_id'),
    product_id: formData.get('product_id'),
    rating: formData.get('rating'),
    comment: formData.get('comment'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from('reviews').insert({
    ...parsed.data,
    user_id: user.id,
    is_verified_purchase: true,
  });

  if (error) {
    return {
      error:
        error.code === '23505'
          ? 'Anda sudah memberikan ulasan untuk produk pada pesanan ini.'
          : error.message,
    };
  }

  revalidatePath(`/customer/orders/${parsed.data.order_id}`);
  revalidatePath('/marketplace');
  return { success: true, message: 'Terima kasih! Ulasan Anda berhasil dikirim.' };
}
