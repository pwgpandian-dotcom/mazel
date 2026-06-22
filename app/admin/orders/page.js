'use client';
import { useState } from 'react';
import { MOCK_ORDERS, SELLERS, formatPrice } from '@/lib/mockData';
import StatusBadge from '@/components/StatusBadge';

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const filtered = filter === 'all' ? MOCK_ORDERS : MOCK_ORDERS.filter(o => o.status === filter);
  const counts = { all: MOCK_ORDERS.length, placed: 0, shipped: 0, delivered: 0 };
  MOCK_ORDERS.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });

  const totalRevenue = MOCK_ORDERS.reduce((s, o) => s + o.total, 0);
  const totalCommission = MOCK_ORDERS.reduce((s, o) => s + o.commission, 0);

  function getShopName(sellerId) {
    return SELLERS.find(s => s.id === sellerId)?.shopName ?? sellerId;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <p className="text-sm text-gray-400">Admin</p>
        <h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
        <p className="text-sm text-gray-400 mt-1">Read-only view across all sellers</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Orders', value: MOCK_ORDERS.length, icon: '📦' },
          { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: '💰' },
          { label: 'Commission (8%)', value: formatPrice(totalCommission), icon: '✓' },
          { label: 'Avg Order Value', value: formatPrice(Math.round(totalRevenue / MOCK_ORDERS.length)), icon: '📊' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-lg mb-1">{s.icon}</p>
            <p className="font-black text-gray-900 text-base">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5">
        {[
          { key: 'all', label: 'All Orders' },
          { key: 'placed', label: 'Placed' },
          { key: 'shipped', label: 'Shipped' },
          { key: 'delivered', label: 'Delivered' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              filter === f.key ? 'bg-navy-700 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {f.label}
            <span className={`text-xs rounded-full px-1.5 ${filter === f.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{counts[f.key]}</span>
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Buyer</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Seller</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                <th className="text-right p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="text-right p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Commission</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-center p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="text-right p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(order => (
                <>
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-gray-800 text-xs">{order.id}</span>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <p className="font-medium text-gray-700">{order.buyerName}</p>
                      <p className="text-xs text-gray-400">{order.buyerPhone}</p>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="text-xs font-medium text-navy-700 bg-navy-50 px-2 py-0.5 rounded-full">
                        {getShopName(order.sellerId)}
                      </span>
                    </td>
                    <td className="p-4 hidden sm:table-cell text-xs text-gray-500">
                      {new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-right font-bold text-gold-600">{formatPrice(order.total)}</td>
                    <td className="p-4 text-right hidden md:table-cell">
                      <span className="text-xs font-semibold text-green-600">+{formatPrice(order.commission)}</span>
                    </td>
                    <td className="p-4"><StatusBadge status={order.status} /></td>
                    <td className="p-4 text-center">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${order.paymentMethod === 'COD' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                        className="text-xs text-navy-600 hover:text-navy-900 font-semibold"
                      >
                        {expanded === order.id ? '↑ Hide' : '↓ Items'}
                      </button>
                    </td>
                  </tr>
                  {expanded === order.id && (
                    <tr key={order.id + '-exp'}>
                      <td colSpan={9} className="bg-gray-50 px-4 pb-3 pt-0">
                        <div className="pl-4 border-l-2 border-gold-200 py-2">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Order Items</p>
                          <div className="space-y-1">
                            {order.items.map(item => (
                              <div key={item.productId} className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="w-5 h-5 bg-navy-100 text-navy-700 rounded text-center flex items-center justify-center font-bold">{item.qty}</span>
                                <span className="flex-1">{item.name}</span>
                                <span className="font-semibold">{formatPrice(item.price * item.qty)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-400">
                            Deliver to: {order.address}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center mt-4">
        Showing {filtered.length} of {MOCK_ORDERS.length} total orders · Admin read-only view
      </p>
    </div>
  );
}
