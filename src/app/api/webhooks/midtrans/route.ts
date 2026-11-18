import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { verifyMidtransSignature } from '@/services/midtrans';
import { OrderStatus, PaymentStatus } from '@/types/database';

/**
 * POST /api/webhooks/midtrans
 * Official Server-Side Midtrans Payment Notification Webhook.
 * Verifies SHA-512 cryptographic signature before updating payment & order status.
 * NEVER trusts payment status submitted from the frontend.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      transaction_id,
      payment_type,
      va_numbers,
    } = body;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      return NextResponse.json(
        { error: 'Payload notifikasi Midtrans tidak lengkap' },
        { status: 400 }
      );
    }

    // 1. Verify cryptographic SHA-512 signature from Midtrans Server Key
    const isValidSignature = verifyMidtransSignature({
      orderId: String(order_id),
      statusCode: String(status_code),
      grossAmount: String(gross_amount),
      signatureKey: String(signature_key),
    });

    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Signature key tidak valid (Unauthorized webhook)' },
        { status: 403 }
      );
    }

    // 2. Map Midtrans transaction_status to internal payment_status & order_status
    let newPaymentStatus: PaymentStatus = 'pending';
    let newOrderStatus: OrderStatus | null = null;

    if (transaction_status === 'capture') {
      if (fraud_status === 'accept') {
        newPaymentStatus = 'settlement';
        newOrderStatus = 'confirmed';
      }
    } else if (transaction_status === 'settlement') {
      newPaymentStatus = 'settlement';
      newOrderStatus = 'confirmed';
    } else if (transaction_status === 'cancel') {
      newPaymentStatus = 'cancel';
      newOrderStatus = 'cancelled';
    } else if (transaction_status === 'deny') {
      newPaymentStatus = 'deny';
    } else if (transaction_status === 'expire') {
      newPaymentStatus = 'expire';
      newOrderStatus = 'cancelled';
    } else if (transaction_status === 'refund') {
      newPaymentStatus = 'refund';
      newOrderStatus = 'cancelled';
    }

    const supabaseAdmin = createAdminSupabaseClient();

    // 3. Update payments table
    const vaNumber = Array.isArray(va_numbers) && va_numbers[0]?.va_number ? va_numbers[0].va_number : null;
    const bankName = Array.isArray(va_numbers) && va_numbers[0]?.bank ? va_numbers[0].bank : null;

    const { data: paymentRecord, error: paymentErr } = await supabaseAdmin
      .from('payments')
      .update({
        midtrans_transaction_id: transaction_id || null,
        payment_type: payment_type || null,
        va_number: vaNumber,
        bank: bankName,
        status: newPaymentStatus,
        raw_notification: body,
        paid_at: newPaymentStatus === 'settlement' ? new Date().toISOString() : null,
      })
      .eq('midtrans_order_id', order_id)
      .select('order_id')
      .single();

    if (paymentErr || !paymentRecord) {
      return NextResponse.json(
        { error: 'Data pembayaran pesanan tidak ditemukan' },
        { status: 404 }
      );
    }

    // 4. Transition Order status if payment settled or expired/cancelled
    if (newOrderStatus) {
      await supabaseAdmin
        .from('orders')
        .update({ status: newOrderStatus })
        .eq('id', paymentRecord.order_id);
    }

    return NextResponse.json({ status: 'OK', payment_status: newPaymentStatus });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
