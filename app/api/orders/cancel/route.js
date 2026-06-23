import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { orderId } = await request.json();
  const admin = createAdminClient();

  const { data: order } = await admin
    .from('orders')
    .select('id, buyer_id, order_status, order_items(product_id, quantity)')
    .eq('id', orderId)
    .single();

  if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });
  if (order.buyer_id !== user.id) return Response.json({ error: 'Forbidden' }, { status: 403 });
  if (order.order_status !== 'placed') return Response.json({ error: 'Only placed orders can be cancelled' }, { status: 400 });

  await admin.from('orders').update({ order_status: 'cancelled' }).eq('id', orderId);

  for (const item of order.order_items ?? []) {
    const { data: prod } = await admin.from('products').select('stock').eq('id', item.product_id).single();
    if (prod) {
      await admin.from('products').update({ stock: prod.stock + item.quantity }).eq('id', item.product_id);
    }
  }

  return Response.json({ success: true });
}
