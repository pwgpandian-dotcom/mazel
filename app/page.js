'use client';
import { useState, useMemo } from 'react';
import { PRODUCTS, CATEGORIES } from '@/lib/mockData';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = useMemo(() => {
    return PRODUCTS.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.shopName.toLowerCase().includes(q);
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [search, activeCategory]);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-navy-700 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold/10 blur-3xl" />
          <div className="absolute bottom-0 -left-12 w-64 h-64 rounded-full bg-navy-600/50 blur-2xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight leading-tight">
            Discover. Shop.<br />
            <span className="text-gold">Save More.</span>
          </h1>
          <p className="text-navy-200 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Quality products from trusted sellers. Groceries, fashion, electronics, handmade — all in one place.
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="flex bg-white rounded-2xl shadow-2xl overflow-hidden p-1.5">
              <div className="flex items-center pl-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search products, categories, shops…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 px-3 py-2.5 text-gray-900 placeholder-gray-400 bg-transparent outline-none text-sm"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 px-2 text-lg">✕</button>
              )}
              <button className="bg-gold hover:bg-gold-600 text-navy-900 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors flex-shrink-0">
                Search
              </button>
            </div>
          </div>

          <div className="flex justify-center gap-8 mt-10">
            {[['18+', 'Products'], ['3', 'Sellers'], ['6', 'Categories']].map(([num, label]) => (
              <div key={label} className="text-center">
                <p className="text-gold font-black text-2xl">{num}</p>
                <p className="text-navy-200 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category filter */}
      <section className="bg-white border-b border-gray-100 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3">
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                activeCategory === 'all'
                  ? 'bg-navy-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-gold text-navy-900 shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {activeCategory === 'all' ? 'All Products' : CATEGORIES.find(c => c.id === activeCategory)?.label}
            </h2>
            <p className="text-sm text-gray-400">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-500 text-lg font-medium">No products found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search or category</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('all'); }}
              className="mt-4 text-gold-600 font-semibold text-sm hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
