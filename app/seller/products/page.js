'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CURRENT_SELLER, PRODUCTS, getCategoryLabel, formatPrice } from '@/lib/mockData';

export default function SellerProductsPage() {
  const [products, setProducts] = useState(PRODUCTS.filter(p => p.sellerId === CURRENT_SELLER.id));
  const [deleteId, setDeleteId] = useState(null);

  function confirmDelete(id) {
    setProducts(prev => prev.filter(p => p.id !== id));
    setDeleteId(null);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-400">Seller — {CURRENT_SELLER.shopName}</p>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        </div>
        <Link href="/seller/products/add" className="bg-gold hover:bg-gold-600 text-navy-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
          + Add Product
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total', value: products.length },
          { label: 'In Stock', value: products.filter(p => p.stock > 0).length },
          { label: 'Low Stock', value: products.filter(p => p.stock > 0 && p.stock <= 10).length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <p className="text-2xl font-black text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Products table */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-4xl mb-4">📦</p>
          <p className="font-semibold text-gray-700 mb-4">No products yet</p>
          <Link href="/seller/products/add" className="bg-gold text-navy-900 font-bold px-6 py-3 rounded-xl inline-block">Add Your First Product</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Product</th>
                  <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-right p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Price</th>
                  <th className="text-right p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Stock</th>
                  <th className="text-right p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Rating</th>
                  <th className="text-right p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-400 md:hidden">{getCategoryLabel(product.category)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                        {getCategoryLabel(product.category)}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-gold-600">{formatPrice(product.price)}</td>
                    <td className="p-4 text-right">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        product.stock === 0 ? 'bg-red-100 text-red-600' :
                        product.stock <= 10 ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-gold text-xs">★</span>
                      <span className="text-xs font-medium text-gray-700 ml-0.5">{product.rating}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/seller/products/add?edit=${product.id}`}
                          className="text-xs font-semibold text-navy-700 hover:text-navy-900 bg-navy-50 hover:bg-navy-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteId(product.id)}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <p className="text-xl font-black text-gray-900 mb-2">Delete Product?</p>
            <p className="text-sm text-gray-500 mb-5">This will remove the product from your shop. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">Cancel</button>
              <button onClick={() => confirmDelete(deleteId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
