import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

interface ItemPayload {
  id?: string;
  product_id?: string | null;
  deal_id?: string | null;
  name?: string;
  qty: number;
  price: number;
}

type RouteParams = {
  params: { id: string };
};

function parseNumber(value: unknown, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const orderId = params.id;
  const body = await request.json().catch(() => ({}));
  const payloadItems: ItemPayload[] = Array.isArray(body.items) ? body.items : [];

  if (!payloadItems.length) {
    return NextResponse.json({ error: 'At least one item is required' }, { status: 400 });
  }

  const normalizedItems = payloadItems.map((item) => {
    const trimmedName =
      typeof item.name === 'string' ? item.name.trim() : undefined;
    return {
      id: item.id || undefined,
      product_id: item.product_id || null,
      deal_id: item.deal_id || null,
      name: trimmedName,
      qty: Math.max(0, Math.round(Number(item.qty) || 0)),
      price: parseNumber(item.price, 0),
    };
  });

  // ensure no zero qty
  if (normalizedItems.some((item) => item.qty <= 0)) {
    return NextResponse.json({ error: 'Quantity must be greater than zero' }, { status: 400 });
  }
  if (
    normalizedItems.some(
      (item) =>
        !item.product_id &&
        (!item.name || item.name.length === 0)
    )
  ) {
    return NextResponse.json(
      { error: 'Custom items require a name' },
      { status: 400 }
    );
  }

  const { data: existingItems, error: existingError } = await supabaseAdmin
    .from('order_items')
    .select('id')
    .eq('order_id', orderId);

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  const existingIds = new Set((existingItems || []).map((item) => item.id));
  const incomingIds = new Set(normalizedItems.filter((item) => item.id).map((item) => item.id!));

  const deleteIds = Array.from(existingIds).filter((id) => !incomingIds.has(id));
  if (deleteIds.length) {
    const { error } = await supabaseAdmin.from('order_items').delete().in('id', deleteIds);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  for (const item of normalizedItems) {
    if (item.id && existingIds.has(item.id)) {
      const updatePayload: Record<string, unknown> = {
        product_id: item.product_id,
        deal_id: item.deal_id,
        qty: item.qty,
        price: item.price,
      };
      if (typeof item.name === 'string') {
        updatePayload.item_name = item.name;
      }
      const { error } = await supabaseAdmin
        .from('order_items')
        .update(updatePayload)
        .eq('id', item.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const itemName =
        typeof item.name === 'string' && item.name.length > 0 ? item.name : null;
      const { error } = await supabaseAdmin.from('order_items').insert({
        order_id: orderId,
        product_id: item.product_id,
        deal_id: item.deal_id,
        qty: item.qty,
        price: item.price,
        item_name: itemName,
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  const refreshedItemsResponse = await supabaseAdmin
    .from('order_items')
    .select('id, product_id, deal_id, qty, price, item_name, order_id')
    .eq('order_id', orderId);

  if (refreshedItemsResponse.error) {
    return NextResponse.json({ error: refreshedItemsResponse.error.message }, { status: 500 });
  }

  const updatedItems = refreshedItemsResponse.data || [];
  const subTotal = updatedItems.reduce(
    (sum, item) => sum + parseNumber(item.price, 0) * parseNumber(item.qty, 0),
    0
  );

  const discountAmount = parseNumber(body.discount_amount);
  const taxAmount = parseNumber(body.tax_amount);
  const deliveryFee = parseNumber(body.delivery_fee);

  const gross = Math.max(subTotal - discountAmount, 0);
  const totalPrice = Math.max(gross + taxAmount + deliveryFee, 0);

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('amount_paid')
    .eq('id', orderId)
    .single();

  const amountPaid = parseNumber(order?.amount_paid);
  const amountDue = Math.max(totalPrice - amountPaid, 0);
  const now = new Date().toISOString();

  const { data: updatedOrder, error: orderUpdateError } = await supabaseAdmin
    .from('orders')
    .update({
      sub_total: subTotal,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      delivery_fee: deliveryFee,
      total_price: totalPrice,
      amount_due: amountDue,
      last_invoice_edit_at: now,
    })
    .eq('id', orderId)
    .select(
      'id, sub_total, discount_amount, tax_amount, delivery_fee, total_price, amount_paid, amount_due, invoice_status, last_invoice_edit_at'
    )
    .single();

  if (orderUpdateError) {
    return NextResponse.json({ error: orderUpdateError.message }, { status: 500 });
  }

  return NextResponse.json({
    order: updatedOrder,
    items: updatedItems,
  });
}
