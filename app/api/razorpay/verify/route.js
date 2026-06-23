import crypto from 'crypto';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { razorpayOrderId, razorpayPaymentId, signature, items, shipping } = await request.json();

  // Verify signature
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expected !== signature) {
    return Response.json({ error: 'Invalid payment signature' }, { status: 400 });
  }

  const admin = createAdminClient();
  const totalAmount = items.reduce((s, i) => s + i.price * i.qty, 0);
  const commission = parseFloat((totalAmount * 0.08).toFixed(2));

  const { data: order, error } = await admin.from('orders').insert({
    buyer_id: user.id,
    total_amount: totalAmount,
    platform_commission: commission,
    payment_method: 'online',
    payment_status: 'paid',
    order_status: 'placed',
    shipping_name: shipping.name,
    shipping_phone: shipping.phone,
    shipping_address: shipping.address,
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
  }).select().single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  for (const item of items) {
    await admin.from('order_items').insert({
      order_id: order.id,
      product_id: Number(item.id),
      seller_id: item.sellerId,
      quantity: item.qty,
      price_at_order: item.price,
    });
    const { data: prod } = await admin.from('products').select('stock').eq('id', item.id).single();
    if (prod) {
      await admin.from('products').update({ stock: Math.max(0, prod.stock - item.qty) }).eq('id', item.id);
    }
  }

  return Response.json({ orderId: order.id, success: true });
}
