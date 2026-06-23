'use client';
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/hooks/useUser';

function formatPrice(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function Stars({ rating, size = 'md', interactive = false, onChange }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <span
          key={s}
          onClick={interactive ? () => onChange(s) : undefined}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : ''} transition-transform ${size === 'sm' ? 'text-base' : 'text-xl'} ${s <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
        >★</span>
      ))}
    </span>
  );
}

export default function ProductPage({ params }) {
  const { id } = use(params);
  const { addItem } = useCart();
  const { user, profile } = useUser();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  useEffect(() => {
    createClient()
      .from('products')
      .select('*, sellers(shop_name, status), categories(name,slug)')
      .eq('id', id)
      .single()
      .then(({ data }) => { setProduct(data); setLoading(false); });
  }, [id]);

  useEffect(() => {
    createClient()
      .from('reviews')
      .select('*')
      .eq('product_id', id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setReviews(data ?? []));
  }, [id]);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase.from('order_items')
      .select('id, orders!inner(buyer_id, order_status)')
      .eq('product_id', id)
      .eq('orders.buyer_id', user.id)
      .eq('orders.order_status', 'delivered')
      .then(({ data }) => setCanReview(!!(data?.length)));

    supabase.from('reviews')
      .select('*')
      .eq('product_id', id)
      .eq('buyer_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setMyReview(data);
          setReviewForm({ rating: data.rating, comment: data.comment ?? '' });
        }
      });
  }, [user, id]);

  async function submitReview(e) {
    e.preventDefault();
    if (!user) return;
    setSubmittingReview(true);
    setReviewMsg('');
    const supabase = createClient();
    const { error } = await supabase.from('reviews').upsert({
      product_id: parseInt(id),
      buyer_id: user.id,
      reviewer_name: profile?.full_name || 'Anonymous',
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim(),
    }, { onConflict: 'product_id,buyer_id' });

    if (error) {
      setReviewMsg('Failed: ' + error.message);
      setSubmittingReview(false);
      return;
    }
    setReviewMsg('Review submitted!');
    setShowReviewForm(false);
    const { data } = await supabase.from('reviews').select('*').eq('product_id', id).order('created_at', { ascending: false });
    setReviews(data ?? []);
    const myR = (data ?? []).find(r => r.buyer_id === user.id);
    if (myR) setMyReview(myR);
    setSubmittingReview(false);
  }

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="h-80 bg-gray-200 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-10 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-96 flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">😕</p>
        <p className="text-gray-600 font-medium">Product not found</p>
        <Link href="/" className="mt-4 inline-block text-gold-600 font-semibold hover:underline">← Back to home</Link>
      </div>
    </div>
  );

  const imgs = product.images?.length ? product.images : [`https://placehold.co/400x320/1B2A4A/ffffff?text=${encodeURIComponent(product.name)}`];
  const normalized = {
    id: product.id, name: product.name, price: parseFloat(product.price),
    description: product.description, stock: product.stock, image: imgs[0],
    category: product.categories?.slug, sellerId: product.seller_id, shopName: product.sellers?.shop_name,
  };

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;

  function handleAdd() {
    addItem(normalized, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow() {
    addItem(normalized, qty);
    router.push('/checkout');
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-gold-600">Home</Link>
        <span>›</span>
        <span className="text-gray-700 font-medium">{product.categories?.name}</span>
        <span>›</span>
        <span className="text-gray-500 truncate max-w-48">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <img src={imgs[activeImg]} alt={product.name} className="w-full aspect-[4/3] object-cover" />
          </div>
          {imgs.length > 1 && (
            <div className="flex gap-2">
              {imgs.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${activeImg === i ? 'border-gold' : 'border-gray-200'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <span className="inline-block bg-gold-100 text-gold-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            {product.categories?.name}
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Stars rating={Math.round(avgRating)} />
              <span className="text-sm font-semibold text-gray-700">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </div>
          )}

          <div className="flex items-baseline gap-2 mb-5">
            <span className="text-3xl font-black text-gold-600">{formatPrice(product.price)}</span>
          </div>
          <p className="text-gray-600 leading-relaxed mb-5">{product.description}</p>

          {/* Seller */}
          <div className="flex items-center gap-3 p-3 bg-navy-50 rounded-xl mb-5">
            <div className="w-9 h-9 rounded-full bg-navy-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {(product.sellers?.shop_name || 'S')[0]}
            </div>
            <div>
              <p className="text-xs text-gray-400">Sold by</p>
              <p className="font-semibold text-navy-700 text-sm">{product.sellers?.shop_name}</p>
            </div>
            {product.sellers?.status === 'approved' && (
              <span className="ml-auto text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Verified</span>
            )}
          </div>

          <p className="text-sm mb-4">
            <span className={`font-semibold ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-500'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </p>

          <div className="flex items-center gap-4 mb-5">
            <span className="text-sm font-medium text-gray-700">Qty</span>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold text-lg">−</button>
              <span className="w-12 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold text-lg">+</button>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleAdd} disabled={product.stock === 0}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${added ? 'bg-green-500 text-white' : 'bg-navy-700 hover:bg-navy-800 text-white'}`}>
              {added ? '✓ Added!' : 'Add to Cart'}
            </button>
            <button onClick={handleBuyNow} disabled={product.stock === 0}
              className="flex-1 bg-gold hover:bg-gold-600 text-navy-900 font-bold text-sm py-3 rounded-xl transition-colors disabled:opacity-50">
              Buy Now
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-100">
            {[['🚚', 'Free Delivery', 'Orders ₹500+'], ['↩️', '7-day Return', 'Easy returns'], ['✓', 'Verified', 'Quality assured']].map(([icon, t, s]) => (
              <div key={t} className="text-center">
                <p className="text-xl mb-0.5">{icon}</p>
                <p className="text-xs font-semibold text-gray-700">{t}</p>
                <p className="text-xs text-gray-400">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <Stars rating={Math.round(avgRating)} />
                <span className="text-sm text-gray-500">{avgRating.toFixed(1)} out of 5 · {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          {canReview && !myReview && !showReviewForm && (
            <button onClick={() => setShowReviewForm(true)}
              className="bg-navy-700 hover:bg-navy-800 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
              Write a Review
            </button>
          )}
        </div>

        {/* Rating distribution */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
            <div className="flex flex-col sm:flex-row gap-5 items-center">
              <div className="text-center flex-shrink-0">
                <p className="text-5xl font-black text-gray-900">{avgRating.toFixed(1)}</p>
                <Stars rating={Math.round(avgRating)} size="md" />
                <p className="text-xs text-gray-400 mt-1">{reviews.length} reviews</p>
              </div>
              <div className="flex-1 w-full space-y-1.5">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviews.filter(r => r.rating === star).length;
                  const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-12 text-right text-gray-500">{star} ★</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-6 text-gray-400">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Write Review Form */}
        {showReviewForm && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gold-200 mb-5">
            <h3 className="font-bold text-gray-900 mb-4">Your Review</h3>
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating *</label>
                <Stars rating={reviewForm.rating} size="md" interactive onChange={r => setReviewForm(f => ({ ...f, rating: r }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Comment</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  rows={3}
                  placeholder="Share your experience with this product…"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/40 resize-none"
                />
              </div>
              {reviewMsg && <p className={`text-sm ${reviewMsg.includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>{reviewMsg}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowReviewForm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submittingReview}
                  className="flex-1 bg-gold hover:bg-gold-600 text-navy-900 font-bold py-2.5 rounded-xl text-sm disabled:opacity-60">
                  {submittingReview ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* My existing review */}
        {myReview && !showReviewForm && (
          <div className="bg-gold-50 border border-gold-200 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Stars rating={myReview.rating} size="sm" />
                <span className="text-xs font-semibold text-gray-700">Your review</span>
              </div>
              <button onClick={() => { setShowReviewForm(true); setReviewMsg(''); }}
                className="text-xs text-navy-600 hover:text-navy-900 font-semibold">Edit</button>
            </div>
            {myReview.comment && <p className="text-sm text-gray-600">{myReview.comment}</p>}
          </div>
        )}

        {/* Reviews list */}
        {reviews.filter(r => r.buyer_id !== user?.id).length > 0 ? (
          <div className="space-y-3">
            {reviews.filter(r => r.buyer_id !== user?.id).map(review => (
              <div key={review.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {(review.reviewer_name || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{review.reviewer_name || 'Anonymous'}</p>
                      <Stars rating={review.rating} size="sm" />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                {review.comment && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{review.comment}</p>}
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
            <p className="text-3xl mb-3">⭐</p>
            <p className="text-gray-500 font-medium">No reviews yet</p>
            <p className="text-xs text-gray-400 mt-1">Be the first to review this product</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
