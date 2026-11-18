import 'server-only';
import crypto from 'crypto';

export interface MidtransSnapRequest {
  orderId: string;
  grossAmount: number;
  customer: {
    firstName: string;
    email: string;
    phone: string;
  };
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

export interface MidtransSnapResponse {
  token: string;
  redirect_url: string;
}

/**
 * Server-side Midtrans Snap Token Generator (Sandbox / Production)
 * NEVER simulates a successful real payment; strictly uses Midtrans Snap API
 * and requires server-side webhook signature verification to settle payments.
 */
export async function createMidtransSnapTransaction(
  payload: MidtransSnapRequest
): Promise<MidtransSnapResponse> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';

  if (!serverKey || serverKey.includes('SB-Mid-server-xxxx')) {
    throw new Error(
      'MIDTRANS_SERVER_KEY belum dikonfigurasi. Masukkan Server Key Sandbox Midtrans Anda pada file .env.local untuk mengaktifkan pembuatan Snap Token.'
    );
  }

  const endpoint = isProduction
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

  const authString = Buffer.from(`${serverKey}:`).toString('base64');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${authString}`,
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: payload.orderId,
        gross_amount: payload.grossAmount,
      },
      customer_details: {
        first_name: payload.customer.firstName,
        email: payload.customer.email,
        phone: payload.customer.phone,
      },
      item_details: payload.items.map((item) => ({
        id: item.id,
        name: item.name.slice(0, 50),
        price: item.price,
        quantity: item.quantity,
      })),
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/customer/orders`,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Midtrans Snap API gagal (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as MidtransSnapResponse;
  return data;
}

/**
 * Verify Midtrans Webhook Notification SHA-512 Signature
 * Formula: SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export function verifyMidtransSignature(params: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
}): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) return false;

  const rawString = `${params.orderId}${params.statusCode}${params.grossAmount}${serverKey}`;
  const expectedSignature = crypto.createHash('sha512').update(rawString).digest('hex');

  return expectedSignature === params.signatureKey;
}
