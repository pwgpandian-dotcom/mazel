'use client';
import { useState } from 'react';
import Link from 'next/link';
import { BUYER_ORDERS, formatPrice, getCategoryLabel } from '@/lib/mockData';
import StatusBadge from '@/components/StatusBadge';

export default function MyOrdersPage() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-400 mt-1">Track and manage your purchases</p>
      </div>

      {BUYER_ORDERS.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-gray-600 font-medium text-lg mb-2">No orders yet</p>
          <Link href="/" className="inline-block bg-gold text-navy-900 font-bold px-6 py-3 rounded-xl mt-2">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {BUYER_ORDERS.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Order header */}
              <div className="p-4 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm">{order.id}</span>
                    <StatusBadge status={order.status} />
                    <span className="text-xs text-gray-400">{new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''} · Payment: {order.paymentMethod}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Order Total</p>
                    <p className="font-black text-gold-600 text-lg">{formatPrice(order.total)}</p>
                  </div>
                  <button
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    className="text-sm font-semibold text-navy-700 hover:text-navy-900 transition-colors flex items-center gap-1"
                  >
                    {expanded === order.id ? 'Hide' : 'Details'}
                    <span className={`transition-transform ${expanded === order.id ? 'rotate-180' : ''}`}>▾</span>
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {expanded === order.id && (
                <div className="border-t border-gray-100 bg-gray-50 p-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Items */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Items Ordered</p>
                      <div className="space-y-2">
                        {order.items.map(item => (
                          <div key={item.productId} className="flex items-center gap-2 bg-white rounded-xl p-3">
                            <div className="w-8 h-8 rounded-lg bg-gold-100 flex items-center justify-center text-gold-700 font-bold text-xs flex-shrink-0">
                              {item.qty}×
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                              <p className="text-xs text-gray-400">{formatPrice(item.price)} each</p>
                            </div>
                            <span className="text-sm font-bold text-gray-700">{formatPrice(item.price * item.qty)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery info */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Delivery Info</p>
                      <div className="bg-white rounded-xl p-3 text-sm space-y-2">
                        <div className="flex gap-2">
                          <span className="text-gray-400 flex-shrink-0">📦</span>
                          <div>
                            <p className="font-medium text-gray-700">Delivering to</p>
                            <p className="text-gray-500 text-xs">{order.address}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-gray-400">💳</span>
                          <div>
                            <p className="font-medium text-gray-700">Payment</p>
                            <p className="text-gray-500 text-xs">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid Online'}</p>
                          </div>
                        </div>

                        {/* Status timeline */}
                        <div className="pt-2 border-t border-gray-100">
                          <p className="font-medium text-gray-700 mb-2">Order Progress</p>
                          {['placed', 'shipped', 'delivered'].map((s, i) => {
                            const statuses = ['placed', 'shipped', 'delivered'];
                            const currentIdx = statuses.indexOf(order.status);
                            const reached = i <= currentIdx;
                            return (
                              <div key={s} className="flex items-center gap-2 mb-1">
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${reached ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                                  {reached ? '✓' : ''}
                                </div>
                                <span className={`text-xs capitalize ${reached ? 'font-semibold text-gray-800' : 'text-gray-400'}`}>{s}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-gold-600 font-semibold hover:underline">
          ← Continue Shopping
        </Link>
      </div>
    </div>
  );
}
