'use client';
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/context/CartContext';

function formatPrice(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default function ProductPage({ params }) {
  const { id } = use(params);
  const { addItem } = useCart();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    createClient()
      .from('products')
      .select('*, sellers(shop_name, status), categories(name,slug)')
      .eq('id', id)
      .single()
      .then(({ data }) => { setProduct(data); setLoading(false); });
  }, [id]);

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
    id: product.id,
    name: product.name,
    price: parseFloat(product.price),
    description: product.description,
    stock: product.stock,
    image: imgs[0],
    category: product.categories?.slug,
    sellerId: product.seller_id,
    shopName: product.sellers?.shop_name,
  };

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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h1>
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

          {/* Qty */}
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
    </div>
  );
}
