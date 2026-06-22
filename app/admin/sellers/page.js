'use client';
import { useState } from 'react';
import Link from 'next/link';
import { SELLERS, formatPrice } from '@/lib/mockData';
import StatusBadge from '@/components/StatusBadge';

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState(SELLERS);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);

  function updateStatus(id, status) {
    setSellers(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    setToast({ id, status });
    setTimeout(() => setToast(null), 2500);
  }

  const filtered = filter === 'all' ? sellers : sellers.filter(s => s.status === filter);
  const counts = { all: sellers.length, approved: sellers.filter(s => s.status === 'approved').length, pending: sellers.filter(s => s.status === 'pending').length, rejected: sellers.filter(s => s.status === 'rejected').length };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-white font-semibold text-sm transition-all ${
          toast.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.status === 'approved' ? '✓ Seller approved!' : '✗ Seller rejected'}
        </div>
      )}

      <div className="mb-6">
        <p className="text-sm text-gray-400">Admin</p>
        <h1 className="text-2xl font-bold text-gray-900">Sellers</h1>
      </div>

      {/* Stat chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5">
        {[
          { key: 'all', label: 'All' },
          { key: 'approved', label: 'Approved' },
          { key: 'pending', label: 'Pending' },
          { key: 'rejected', label: 'Rejected' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              filter === f.key ? 'bg-navy-700 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {f.label}
            <span className={`text-xs rounded-full px-1.5 ${filter === f.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{counts[f.key]}</span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(seller => (
          <div key={seller.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex flex-wrap items-start gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-navy-700 text-white flex items-center justify-center font-black text-lg flex-shrink-0">
                {seller.shopName[0]}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-gray-900">{seller.shopName}</h3>
                  <StatusBadge status={seller.status} />
                </div>
                <p className="text-sm text-gray-500">{seller.name} · {seller.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">📍 {seller.location} · 📞 {seller.phone}</p>
                <p className="text-xs text-gray-400 mt-0.5">Joined: {new Date(seller.joinedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                {seller.description && (
                  <p className="text-xs text-gray-500 mt-2 italic">"{seller.description}"</p>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-4 text-center">
                <div>
                  <p className="font-black text-gray-900 text-lg">{seller.totalOrders}</p>
                  <p className="text-xs text-gray-400">Orders</p>
                </div>
                <div>
                  <p className="font-black text-gold-600 text-lg">{formatPrice(seller.totalSales)}</p>
                  <p className="text-xs text-gray-400">Revenue</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
              {seller.status !== 'approved' && (
                <button
                  onClick={() => updateStatus(seller.id, 'approved')}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  ✓ Approve Seller
                </button>
              )}
              {seller.status !== 'rejected' && (
                <button
                  onClick={() => updateStatus(seller.id, 'rejected')}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  ✕ Reject
                </button>
              )}
              {seller.status === 'approved' && (
                <button
                  onClick={() => updateStatus(seller.id, 'pending')}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-700 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  ⏸ Suspend
                </button>
              )}
              {seller.status === 'approved' && (
                <span className="ml-auto text-xs text-gray-400 self-center">
                  Commission earned: {formatPrice(seller.totalSales * 0.08)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
