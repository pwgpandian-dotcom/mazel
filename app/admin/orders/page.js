'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import StatusBadge from '@/components/StatusBadge';

function formatPrice(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default function AdminOrdersPage() {
  const { user, loading: authLoading } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (authLoading || !user) return;
    createClient()
      .from('orders')
      .select('*, profiles(full_name), order_items(quantity, price_at_order, item_status, products(name))')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data ?? []); setLoading(false); });
  }, [user, authLoading]);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.order_status === filter);
  const counts = { all: orders.length, placed: 0, shipped: 0, delivered: 0, cancelled: 0 };
  orders.forEach(o => { if (counts[o.order_status] !== undefined) counts[o.order_status]++; });
  const totalRevenue = orders.reduce((s, o) => s + parseFloat(o.total_amount ?? 0), 0);
  const totalCommission = orders.reduce((s, o) => s + parseFloat(o.platform_commission ?? 0), 0);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-32 mb-6" />
      <div className="h-64 bg-gray-100 rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <p className="text-sm text-gray-400">Admin</p>
        <h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          ['Orders', orders.length, '📦'],
          ['Revenue', formatPrice(totalRevenue), '💰'],
          ['Commission', formatPrice(totalCommission), '✓'],
          ['Avg Order', formatPrice(orders.length ? totalRevenue / orders.length : 0), '📊'],
        ].map(([l, v, i]) => (
          <div key={l} className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <p className="text-lg mb-1">{i}</p>
            <p className="font-black text-gray-900">{v}</p>
            <p className="text-xs text-gray-400">{l}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5">
        {['all', 'placed', 'shipped', 'delivered', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all capitalize ${filter === f ? 'bg-navy-700 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            {f === 'all' ? 'All' : f}
            <span className={`text-xs rounded-full px-1.5 ${filter === f ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{counts[f]}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Order ID', 'Buyer', 'Date', 'Total', 'Commission', 'Payment', 'Status', ''].map(h => (
                  <th key={h} className={`p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider ${h === '' || h === 'Total' || h === 'Commission' ? 'text-right' : 'text-left'} ${['Buyer', 'Date', 'Commission'].includes(h) ? 'hidden md:table-cell' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(o => (
                <>
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-gray-800 text-xs">#{o.id}</td>
                    <td className="p-4 hidden md:table-cell">
                      <p className="font-medium text-gray-700">{o.profiles?.full_name ?? o.shipping_name}</p>
                      <p className="text-xs text-gray-400">{o.shipping_phone}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell text-xs text-gray-500">
                      {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-right font-bold text-gold-600">{formatPrice(o.total_amount)}</td>
                    <td className="p-4 text-right hidden md:table-cell">
                      <span className="text-xs font-semibold text-green-600">+{formatPrice(o.platform_commission)}</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${o.payment_method === 'cod' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                        {o.payment_method?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4"><StatusBadge status={o.order_status} /></td>
                    <td className="p-4 text-right">
                      <button onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                        className="text-xs text-navy-600 hover:text-navy-900 font-semibold">
                        {expanded === o.id ? '↑' : '↓'} Items
                      </button>
                    </td>
                  </tr>
                  {expanded === o.id && (
                    <tr key={`${o.id}-exp`}>
                      <td colSpan={8} className="bg-gray-50 px-6 pb-3 pt-0">
                        <div className="pl-4 border-l-2 border-gold-200 py-2 space-y-1">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Items · {o.shipping_address}</p>
                          {o.order_items?.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                              <span className="w-5 h-5 bg-navy-100 text-navy-700 rounded text-center flex items-center justify-center font-bold">{item.quantity}</span>
                              <span className="flex-1">{item.products?.name}</span>
                              <StatusBadge status={item.item_status} />
                              <span className="font-semibold">{formatPrice(parseFloat(item.price_at_order) * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="p-8 text-center text-gray-400 text-sm">No orders found</p>}
      </div>
    </div>
  );
}
