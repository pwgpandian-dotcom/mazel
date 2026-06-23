'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';

function formatPrice(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default function SellerProductsPage() {
  const { user, loading: authLoading } = useUser();
  const [products, setProducts] = useState([]);
  const [sellerStatus, setSellerStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (authLoading || !user) return;
    const supabase = createClient();
    Promise.all([
      supabase.from('products').select('*, categories(name)').eq('seller_id', user.id).order('created_at', { ascending: false }),
      supabase.from('sellers').select('status').eq('id', user.id).single(),
    ]).then(([{ data: prods }, { data: seller }]) => {
      setProducts(prods ?? []);
      setSellerStatus(seller?.status ?? null);
      setLoading(false);
    });
  }, [user, authLoading]);

  async function confirmDelete(id) {
    await createClient().from('products').delete().eq('id', id);
    setProducts(p => p.filter(x => x.id !== id));
    setDeleteId(null);
  }

  if (authLoading || loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-32 mb-6" />
      <div className="h-64 bg-gray-100 rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        {sellerStatus === 'approved' && (
          <Link href="/seller/products/add" className="bg-gold hover:bg-gold-600 text-navy-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
            + Add Product
          </Link>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[['Total', products.length], ['In Stock', products.filter(p => p.stock > 0).length], ['Low Stock', products.filter(p => p.stock > 0 && p.stock <= 5).length]].map(([l, v]) => (
          <div key={l} className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <p className="text-2xl font-black text-gray-900">{v}</p>
            <p className="text-xs text-gray-400 mt-0.5">{l}</p>
          </div>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-4xl mb-4">📦</p>
          <p className="font-semibold text-gray-700 mb-4">No products yet</p>
          {sellerStatus === 'approved'
            ? <Link href="/seller/products/add" className="bg-gold text-navy-900 font-bold px-6 py-3 rounded-xl inline-block">Add First Product</Link>
            : <p className="text-sm text-amber-600">Waiting for admin approval before you can add products.</p>
          }
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-right p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="text-right p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="text-right p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] ?? `https://placehold.co/40x40/E0A500/ffffff?text=${p.name[0]}`}
                          alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        <p className="font-medium text-gray-900 line-clamp-1">{p.name}</p>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">{p.categories?.name}</span>
                    </td>
                    <td className="p-4 text-right font-bold text-gold-600">{formatPrice(p.price)}</td>
                    <td className="p-4 text-right">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.stock === 0 ? 'bg-red-100 text-red-600' : p.stock <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/seller/products/add?edit=${p.id}`}
                          className="text-xs font-semibold text-navy-700 bg-navy-50 hover:bg-navy-100 px-3 py-1.5 rounded-lg transition-colors">Edit</Link>
                        <button onClick={() => setDeleteId(p.id)}
                          className="text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <p className="text-xl font-black text-gray-900 mb-2">Delete Product?</p>
            <p className="text-sm text-gray-500 mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
              <button onClick={() => confirmDelete(deleteId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
