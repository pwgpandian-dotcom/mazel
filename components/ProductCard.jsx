'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { getCategoryLabel, formatPrice } from '@/lib/mockData';

export default function ProductCard({ product }) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  const inCart = items.some(i => i.id === product.id);

  function handleAdd(e) {
    e.preventDefault();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col border border-gray-100">

      {/* Image */}
      <Link href={`/product/${product.id}`} className="block relative overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Category pill */}
        <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full text-gray-700 shadow-sm">
          {getCategoryLabel(product.category)}
        </span>
        {/* Hover overlay with quick-add */}
        <div className="absolute inset-0 bg-navy-900/0 group-hover:bg-navy-900/10 transition-colors duration-300" />
      </Link>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1">
        <Link href={`/product/${product.id}`} className="flex-1 block">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1 group-hover:text-navy-700 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-gray-400 mb-2 font-medium">{product.shopName}</p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <svg key={i} className={`w-3 h-3 ${i <= Math.floor(product.rating) ? 'text-gold' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs font-semibold text-gray-600">{product.rating}</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400">{product.reviews} reviews</span>
          </div>
        </Link>

        {/* Price + Cart */}
        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
          <div>
            <span className="text-gold-600 font-black text-base">{formatPrice(product.price)}</span>
          </div>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200 ${
              added
                ? 'bg-green-500 text-white'
                : inCart
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-navy-700 hover:bg-navy-800 text-white'
            }`}
          >
            {added ? (
              <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Added</>
            ) : inCart ? (
              'In Cart'
            ) : (
              <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Cart</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
