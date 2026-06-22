'use client';
import { useState } from 'react';
import { CURRENT_SELLER, getSellerOrders, formatPrice } from '@/lib/mockData';
import StatusBadge from '@/components/StatusBadge';

const STATUS_FLOW = { placed: 'shipped', shipped: 'delivered' };
const NEXT_LABEL = { placed: '🚚 Mark as Shipped', shipped: '✅ Mark as Delivered' };

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState(getSellerOrders(CURRENT_SELLER.id));
  const [filter, setFilter] = useState('all');

  function advanceStatus(id) {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const next = STATUS_FLOW[o.status];
      return next ? { ...o, status: next } : o;
    }));
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const counts = { all: orders.length, placed: 0, shipped: 0, delivered: 0 };
  orders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <p className="text-sm text-gray-400">Seller — {CURRENT_SELLER.shopName}</p>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5">
        {['all', 'placed', 'shipped', 'delivered'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              filter === f ? 'bg-navy-700 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="capitalize">{f === 'all' ? 'All Orders' : f}</span>
            <span className={`text-xs rounded-full px-1.5 py-0.5 ${filter === f ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{counts[f]}</span>
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
          {filtered.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header row */}
              <div className="p-4 border-b border-gray-50 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm">{order.id}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.placedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {' · '}Payment: {order.paymentMethod}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-black text-gold-600">{formatPrice(order.total)}</p>
                    <p className="text-xs text-gray-400">You earn: {formatPrice(order.total * 0.92)}</p>
                  </div>

                  {STATUS_FLOW[order.status] && (
                    <button
                      onClick={() => advanceStatus(order.id)}
                      className="bg-navy-700 hover:bg-navy-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                    >
                      {NEXT_LABEL[order.status]}
                    </button>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 grid md:grid-cols-2 gap-4">
                {/* Items */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Items</p>
                  <div className="space-y-1.5">
                    {order.items.map(item => (
                      <div key={item.productId} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.name} <span className="text-gray-400">× {item.qty}</span></span>
                        <span className="font-medium text-gray-800">{formatPrice(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buyer & shipping */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Buyer & Delivery</p>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p className="font-semibold">{order.buyerName}</p>
                    <p className="text-gray-400 text-xs">{order.buyerPhone}</p>
                    <p className="text-gray-500 text-xs">{order.address}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Revenue summary */}
      <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-3">Revenue Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="text-xl font-black text-gray-900">{formatPrice(orders.reduce((s, o) => s + o.total, 0))}</p>
            <p className="text-gray-400 text-xs mt-0.5">Gross Revenue</p>
          </div>
          <div>
            <p className="text-xl font-black text-red-500">− {formatPrice(orders.reduce((s, o) => s + o.commission, 0))}</p>
            <p className="text-gray-400 text-xs mt-0.5">Mazel Commission (8%)</p>
          </div>
          <div>
            <p className="text-xl font-black text-green-600">{formatPrice(orders.reduce((s, o) => s + (o.total - o.commission), 0))}</p>
            <p className="text-gray-400 text-xs mt-0.5">Net Earnings</p>
          </div>
        </div>
      </div>
    </div>
  );
}
