import Razorpay from 'razorpay';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return Response.json({ error: 'Razorpay not configured' }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { amount } = await request.json();

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100), // paise
    currency: 'INR',
    receipt: `mazel_${Date.now()}`,
  });

  return Response.json({ razorpayOrderId: order.id, amount: order.amount });
}
