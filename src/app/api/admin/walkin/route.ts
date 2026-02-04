import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

type ServiceType = 'walk_in' | 'dine_in' | 'takeaway';

interface PosItemPayload {
  product_id?: string;
  deal_id?: string | null;
  qty: number;
  price: number;
  name: string;
}

function generateReceiptNumber() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `INV-${year}${random}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items: PosItemPayload[] = Array.isArray(body.items) ? body.items : [];
    if (!items.length) {
      return NextResponse.json({ error: 'At least one item is required' }, { status: 400 });
    }

    const sanitizeText = (value: unknown, fallback = '') =>
      typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;

    const requestedService = sanitizeText(body.service_type, 'walk_in');
    const allowedServices = new Set<ServiceType>(['walk_in', 'dine_in', 'takeaway']);
    const serviceType = allowedServices.has(requestedService as ServiceType)
      ? (requestedService as ServiceType)
      : 'walk_in';
    const orderChannel =
      serviceType === 'dine_in' ? 'dine_in' : serviceType === 'takeaway' ? 'takeaway' : 'walk_in';
    const serviceMode =
      serviceType === 'dine_in' ? 'dine_in' : serviceType === 'takeaway' ? 'pickup' : 'pickup';

    const subTotal = Number(body.sub_total ?? 0);
    const discountAmount = Number(body.discount_amount ?? 0);
    const taxAmount = Number(body.tax_amount ?? 0);
    const deliveryFee = Number(body.delivery_fee ?? 0);
    const totalPrice = Number(body.total_price ?? 0);
    const amountPaid = Number(body.amount_paid ?? 0);
    const amountDue = Math.max(totalPrice - amountPaid, 0);
    const dueAt =
      typeof body.due_at === 'string' && body.due_at
        ? new Date(body.due_at).toISOString()
        : null;

    const invoiceTimestamp = new Date().toISOString();
    const orderPayload = {
      status: 'new',
      customer_name: sanitizeText(body.customer_name, 'Walk-in Guest'),
      phone: sanitizeText(body.phone, '') || null,
      address: sanitizeText(body.address, 'On-premise order'),
      notes: sanitizeText(body.notes, '') || null,
      total_price: totalPrice,
      discount_amount: discountAmount,
      sub_total: subTotal,
      tax_amount: taxAmount,
      delivery_fee: deliveryFee,
      amount_paid: amountPaid,
      amount_due: amountDue,
      due_at: dueAt,
      order_channel: orderChannel,
      service_mode: serviceMode,
      table_number: sanitizeText(body.table_number, '') || null,
      token_number: sanitizeText(body.token_number, '') || null,
      receipt_number: generateReceiptNumber(),
      receipt_issued_at: invoiceTimestamp,
      invoice_status: 'issued',
      last_invoice_edit_at: invoiceTimestamp,
    };

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert(orderPayload)
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id ?? null,
      deal_id: item.deal_id ?? null,
      qty: item.qty,
      price: item.price,
      item_name: item.name,
    }));

    const { error: orderItemsError } = await supabaseAdmin.from('order_items').insert(orderItems);
    if (orderItemsError) {
      throw orderItemsError;
    }

    const paymentMethod = sanitizeText(body.payment_method, 'cash');
    if (amountPaid > 0) {
      const paymentTimestamp = new Date().toISOString();
      await supabaseAdmin.from('order_payments').insert({
        order_id: order.id,
        amount: amountPaid,
        method: paymentMethod,
        paid_at: paymentTimestamp,
        channel: 'pos',
        notes: sanitizeText(body.payment_notes, '') || null,
      });
    }

    return NextResponse.json({ id: order.id }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to create walk-in order';
    const status =
      err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === '23514'
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
