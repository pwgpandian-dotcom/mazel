'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import StatusBadge from '@/components/StatusBadge';

function formatPrice(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function Stars({ rating, interactive = false, onChange }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s}
          onClick={interactive ? () => onChange(s) : undefined}
          className={`text-xl ${interactive ? 'cursor-pointer hover:scale-110' : ''} transition-transform ${s <= rating ? 'text-yellow-400' : 'text-gray-200'}`}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function MyOrdersPage() {
  const { user, profile, loading: authLoading } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const [cancelling, setCancelling] = useState(null);
  const [reviewModal, setReviewModal] = useState(null); // { productId, productName }
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedItems, setReviewedItems] = useState(new Set());

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

  useEffect(() => {
    if (!user) return;
    createClient()
      .from('reviews')
      .select('product_id')
      .eq('buyer_id', user.id)
      .then(({ data }) => {
        if (data) setReviewedItems(new Set(data.map(r => r.product_id)));
      });
  }, [user]);

  async function cancelOrder(orderId) {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(orderId);
    const res = await fetch('/api/orders/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    const data = await res.json();
    if (data.success) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: 'cancelled' } : o));
    } else {
      alert('Failed: ' + (data.error || 'Unknown error'));
    }
    setCancelling(null);
  }

  async function submitReview(e) {
    e.preventDefault();
    if (!reviewModal || !user) return;
    setSubmittingReview(true);
    const { error } = await createClient().from('reviews').upsert({
      product_id: reviewModal.productId,
      buyer_id: user.id,
      reviewer_name: profile?.full_name || 'Anonymous',
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim(),
    }, { onConflict: 'product_id,buyer_id' });
    setSubmittingReview(false);
    if (error) { alert('Failed: ' + error.message); return; }
    setReviewedItems(prev => new Set([...prev, reviewModal.productId]));
    setReviewModal(null);
    setReviewForm({ rating: 5, comment: '' });
  }

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
      {/* Review modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setReviewModal(null); }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-1">Rate this Product</h3>
            <p className="text-sm text-gray-400 mb-5 truncate">{reviewModal.productName}</p>
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Rating *</label>
                <Stars rating={reviewForm.rating} interactive onChange={r => setReviewForm(f => ({ ...f, rating: r }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Comment</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  rows={3} placeholder="How was the product?"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/40 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setReviewModal(null)}
                  className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submittingReview}
                  className="flex-1 bg-gold hover:bg-gold-600 text-navy-900 font-bold py-2.5 rounded-xl text-sm disabled:opacity-60">
                  {submittingReview ? 'Submitting…' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  <div className="flex items-center gap-2">
                    {order.order_status === 'placed' && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        disabled={cancelling === order.id}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                        {cancelling === order.id ? 'Cancelling…' : 'Cancel'}
                      </button>
                    )}
                    <button onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                      className="text-sm font-semibold text-navy-700 hover:text-navy-900 flex items-center gap-1">
                      {expanded === order.id ? 'Hide' : 'Details'}
                      <span className={`transition-transform ${expanded === order.id ? 'rotate-180' : ''}`}>▾</span>
                    </button>
                  </div>
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
                            <div className="flex-shrink-0 flex flex-col items-end gap-1">
                              <span className="text-sm font-bold">{formatPrice(item.price_at_order * item.quantity)}</span>
                              {order.order_status === 'delivered' && item.product_id && (
                                reviewedItems.has(item.product_id) ? (
                                  <span className="text-xs text-green-600 font-semibold">✓ Rated</span>
                                ) : (
                                  <button
                                    onClick={() => { setReviewModal({ productId: item.product_id, productName: item.products?.name }); setReviewForm({ rating: 5, comment: '' }); }}
                                    className="text-xs text-navy-600 hover:text-navy-900 font-semibold bg-navy-50 hover:bg-navy-100 px-2 py-0.5 rounded-lg transition-colors">
                                    Rate
                                  </button>
                                )
                              )}
                            </div>
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
