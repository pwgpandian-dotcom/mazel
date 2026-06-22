'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PRODUCTS, getCategoryLabel, formatPrice } from '@/lib/mockData';
import { useCart } from '@/context/CartContext';
import StatusBadge from '@/components/StatusBadge';

export default function ProductPage({ params }) {
  const { id } = use(params);
  const product = PRODUCTS.find(p => p.id === id);
  const { addItem, items } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <p className="text-gray-600 font-medium">Product not found</p>
          <Link href="/" className="mt-4 inline-block text-gold-600 font-semibold hover:underline">← Back to home</Link>
        </div>
      </div>
    );
  }

  const inCart = items.some(i => i.id === product.id);

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow() {
    addItem(product, qty);
    router.push('/checkout');
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-gold-600 transition-colors">Home</Link>
        <span>›</span>
        <Link href={`/?category=${product.category}`} className="hover:text-gold-600 transition-colors">{getCategoryLabel(product.category)}</Link>
        <span>›</span>
        <span className="text-gray-700 font-medium">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full aspect-[4/3] object-cover"
            />
          </div>
        </div>

        {/* Details */}
        <div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <span className="inline-block bg-gold-100 text-gold-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              {getCategoryLabel(product.category)}
            </span>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {'★★★★★'.split('').map((s, i) => (
                  <span key={i} className={i < Math.floor(product.rating) ? 'text-gold' : 'text-gray-200'}>★</span>
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
              <span className="text-sm text-gray-400">({product.reviews} reviews)</span>
            </div>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-black text-gold-600">{formatPrice(product.price)}</span>
              <span className="text-sm text-gray-400">per unit</span>
            </div>

            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

            {/* Seller info */}
            <div className="flex items-center gap-3 p-3 bg-navy-50 rounded-xl mb-6">
              <div className="w-9 h-9 rounded-full bg-navy-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {product.shopName[0]}
              </div>
              <div>
                <p className="text-xs text-gray-400">Sold by</p>
                <p className="font-semibold text-navy-700 text-sm">{product.shopName}</p>
              </div>
              <div className="ml-auto">
                <StatusBadge status="approved" />
              </div>
            </div>

            {/* Stock */}
            <p className="text-sm text-gray-500 mb-4">
              <span className={`font-semibold ${product.stock > 10 ? 'text-green-600' : 'text-amber-600'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </p>

            {/* Qty selector */}
            <div className="flex items-center gap-4 mb-5">
              <span className="text-sm font-medium text-gray-700">Quantity</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold text-lg transition-colors"
                >−</button>
                <span className="w-12 text-center font-semibold text-gray-900">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold text-lg transition-colors"
                >+</button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                disabled={product.stock === 0}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                  added
                    ? 'bg-green-100 text-green-700'
                    : inCart
                    ? 'bg-navy-50 text-navy-700 border border-navy-200'
                    : 'bg-navy-700 hover:bg-navy-800 text-white'
                }`}
              >
                {added ? '✓ Added to Cart!' : inCart ? '+ Add More' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 bg-gold hover:bg-gold-600 text-navy-900 font-bold text-sm py-3 rounded-xl transition-colors"
              >
                Buy Now
              </button>
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-100">
              {[['🚚', 'Free Delivery', 'On orders ₹500+'], ['↩️', '7-day Return', 'Easy returns'], ['✓', 'Verified Seller', 'Quality assured']].map(([icon, title, sub]) => (
                <div key={title} className="text-center">
                  <p className="text-xl mb-0.5">{icon}</p>
                  <p className="text-xs font-semibold text-gray-700">{title}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
