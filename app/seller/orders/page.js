'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import StatusBadge from '@/components/StatusBadge';

function formatPrice(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

const NEXT_STATUS = { placed: 'shipped', shipped: 'delivered' };
const NEXT_LABEL = { placed: '🚚 Mark Shipped', shipped: '✅ Mark Delivered' };

export default function SellerOrdersPage() {
  const { user, loading: authLoading } = useUser();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (authLoading || !user) return;
    createClient()
      .from('order_items')
      .select('*, products(name, images), orders(id, shipping_name, shipping_phone, shipping_address, payment_method, created_at)')
      .eq('seller_id', user.id)
      .order('id', { ascending: false })
      .then(({ data }) => { setItems(data ?? []); setLoading(false); });
  }, [user, authLoading]);

  async function advance(id, currentStatus) {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;
    await createClient().from('order_items').update({ item_status: next }).eq('id', id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, item_status: next } : i));
  }

  const filtered = filter === 'all' ? items : items.filter(i => i.item_status === filter);
  const counts = { all: items.length, placed: 0, shipped: 0, delivered: 0 };
  items.forEach(i => { if (counts[i.item_status] !== undefined) counts[i.item_status]++; });

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-32 mb-6" />
      <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl" />)}</div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-400 mt-1">Manage and ship your orders</p>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5">
        {['all', 'placed', 'shipped', 'delivered'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${filter === f ? 'bg-navy-700 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            <span className="capitalize">{f === 'all' ? 'All Orders' : f}</span>
            <span className={`text-xs rounded-full px-1.5 ${filter === f ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{counts[f]}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-gray-500">No {filter === 'all' ? '' : filter} orders</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(item => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 flex flex-wrap items-center gap-3">
                <img src={item.products?.images?.[0] ?? `https://placehold.co/48x48/E0A500/ffffff?text=P`}
                  alt={item.products?.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{item.products?.name}</p>
                  <p className="text-xs text-gray-400">Order #{item.order_id} · ×{item.quantity} units</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={item.item_status} />
                    <span className="text-xs text-gray-400">
                      {item.orders?.payment_method === 'cod' ? '💵 COD' : '💳 Online'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-black text-gold-600">{formatPrice(parseFloat(item.price_at_order) * item.quantity)}</p>
                    <p className="text-xs text-gray-400">You earn: {formatPrice(parseFloat(item.price_at_order) * item.quantity * 0.92)}</p>
                  </div>
                  {NEXT_STATUS[item.item_status] && (
                    <button onClick={() => advance(item.id, item.item_status)}
                      className="bg-navy-700 hover:bg-navy-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
                      {NEXT_LABEL[item.item_status]}
                    </button>
                  )}
                </div>
              </div>
              {item.orders && (
                <div className="border-t border-gray-50 px-4 py-2.5 bg-gray-50">
                  <p className="text-xs text-gray-500">
                    Deliver to: <span className="font-medium text-gray-700">{item.orders.shipping_name}</span> · {item.orders.shipping_phone} · {item.orders.shipping_address}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
