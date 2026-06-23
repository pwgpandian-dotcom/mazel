'use client';
import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import ProductCard from '@/components/ProductCard';

function normalize(p) {
  return {
    id: p.id,
    name: p.name,
    price: parseFloat(p.price),
    description: p.description,
    stock: p.stock,
    image: p.images?.[0] ?? `https://placehold.co/400x280/1B2A4A/ffffff?text=${encodeURIComponent(p.name.split(' ').slice(0,2).join('+')+'')}`,
    category: p.categories?.slug ?? '',
    categoryLabel: p.categories?.name ?? '',
    sellerId: p.seller_id,
    shopName: p.sellers?.shop_name ?? 'Unknown Store',
    rating: 4.5,
    reviews: 0,
  };
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from('products')
        .select('*, sellers(shop_name), categories(name,slug)')
        .eq('status', 'active')
        .order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]).then(([{ data: prods }, { data: cats }]) => {
      setProducts((prods ?? []).map(normalize));
      setCategories(cats ?? []);
      setLoadingData(false);
    });
  }, []);

  const filtered = useMemo(() => products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.shopName.toLowerCase().includes(q);
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    return matchSearch && matchCat;
  }), [products, search, activeCategory]);

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
              <input type="text" placeholder="Search products, shops…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 px-3 py-2.5 text-gray-900 placeholder-gray-400 bg-transparent outline-none text-sm" />
              {search && <button onClick={() => setSearch('')} className="text-gray-400 px-2 text-lg">✕</button>}
              <button className="bg-gold hover:bg-gold-600 text-navy-900 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors flex-shrink-0">Search</button>
            </div>
          </div>
          <div className="flex justify-center gap-8 mt-10">
            {[[products.length + '+', 'Products'], ['Verified', 'Sellers'], [categories.length, 'Categories']].map(([num, label]) => (
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
            <button onClick={() => setActiveCategory('all')}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${activeCategory === 'all' ? 'bg-navy-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              All
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.slug)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${activeCategory === cat.slug ? 'bg-gold text-navy-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {cat.name}
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
              {activeCategory === 'all' ? 'All Products' : categories.find(c => c.slug === activeCategory)?.name}
            </h2>
            <p className="text-sm text-gray-400">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {loadingData ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-3.5 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-500 text-lg font-medium">No products found</p>
            <button onClick={() => { setSearch(''); setActiveCategory('all'); }}
              className="mt-4 text-gold-600 font-semibold text-sm hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>
    </>
  );
}
