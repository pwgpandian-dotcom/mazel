'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import StatusBadge from '@/components/StatusBadge';

function formatPrice(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    createClient()
      .from('orders')
      .select('*, order_items(*, products(name, images))')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data ?? []); setLoading(false); });
  }, [user, authLoading]);

  if (authLoading || loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="h-8 bg-gray-200 rounded w-32 mb-6 animate-pulse" />
      {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-2xl mb-4 animate-pulse border border-gray-100" />)}
    </div>
  );

  if (!user) return (
    <div className="min-h-96 flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">🔐</p>
        <p className="text-gray-600 mb-4 font-medium">Please sign in to see your orders</p>
        <Link href="/auth/login?next=/orders" className="bg-gold text-navy-900 font-bold px-6 py-3 rounded-xl inline-block">Sign In</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-400 mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-gray-600 font-medium text-lg mb-2">No orders yet</p>
          <Link href="/" className="inline-block bg-gold text-navy-900 font-bold px-6 py-3 rounded-xl mt-2">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm">#{order.id}</span>
                    <StatusBadge status={order.order_status} />
                    <span className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {order.order_items?.length} item{order.order_items?.length !== 1 ? 's' : ''} · {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
                    {order.payment_status === 'paid' && <span className="ml-1 text-green-600">✓ Paid</span>}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="font-black text-gold-600 text-lg">{formatPrice(order.total_amount)}</p>
                  </div>
                  <button onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    className="text-sm font-semibold text-navy-700 hover:text-navy-900 flex items-center gap-1">
                    {expanded === order.id ? 'Hide' : 'Details'}
                    <span className={`transition-transform ${expanded === order.id ? 'rotate-180' : ''}`}>▾</span>
                  </button>
                </div>
              </div>

              {expanded === order.id && (
                <div className="border-t border-gray-100 bg-gray-50 p-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Items</p>
                      <div className="space-y-2">
                        {order.order_items?.map(item => (
                          <div key={item.id} className="flex items-center gap-2 bg-white rounded-xl p-2.5">
                            <img src={item.products?.images?.[0] ?? '/placeholder.png'} alt={item.products?.name}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{item.products?.name}</p>
                              <p className="text-xs text-gray-400">×{item.quantity} @ {formatPrice(item.price_at_order)}</p>
                            </div>
                            <span className="text-sm font-bold">{formatPrice(item.price_at_order * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Delivery</p>
                      <div className="bg-white rounded-xl p-3 text-sm space-y-2">
                        <p className="font-semibold text-gray-700">{order.shipping_name}</p>
                        <p className="text-gray-400 text-xs">{order.shipping_phone}</p>
                        <p className="text-gray-500 text-xs">{order.shipping_address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
