'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import StatusBadge from '@/components/StatusBadge';

export default function AdminSellersPage() {
  const { user, profile, loading: authLoading } = useUser();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (authLoading || !user) return;
    createClient()
      .from('sellers')
      .select('*, profiles(full_name, email, phone)')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setSellers(data ?? []); setLoading(false); });
  }, [user, authLoading]);

  async function updateStatus(id, status) {
    await createClient().from('sellers').update({ status }).eq('id', id);
    setSellers(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    setToast({ status });
    setTimeout(() => setToast(null), 2500);
  }

  const filtered = filter === 'all' ? sellers : sellers.filter(s => s.status === filter);
  const counts = { all: sellers.length, approved: 0, pending: 0, rejected: 0 };
  sellers.forEach(s => { if (counts[s.status] !== undefined) counts[s.status]++; });

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-32 mb-6" />
      <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl" />)}</div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-xl shadow-xl text-white font-semibold text-sm ${toast.status === 'approved' ? 'bg-green-500' : toast.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'}`}>
          {toast.status === 'approved' ? '✓ Seller approved!' : toast.status === 'rejected' ? '✗ Seller rejected' : '⏸ Seller suspended'}
        </div>
      )}

      <div className="mb-6">
        <p className="text-sm text-gray-400">Admin</p>
        <h1 className="text-2xl font-bold text-gray-900">Sellers</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all capitalize ${filter === f ? 'bg-navy-700 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            {f === 'all' ? 'All' : f}
            <span className={`text-xs rounded-full px-1.5 ${filter === f ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{counts[f]}</span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(seller => (
          <div key={seller.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex flex-wrap items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-navy-700 text-white flex items-center justify-center font-black text-lg flex-shrink-0">
                {seller.shop_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-gray-900">{seller.shop_name}</h3>
                  <StatusBadge status={seller.status} />
                </div>
                <p className="text-sm text-gray-500">{seller.profiles?.full_name} · {seller.profiles?.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">📞 {seller.profiles?.phone}</p>
                {seller.shop_address && <p className="text-xs text-gray-400 mt-0.5">📍 {seller.shop_address}</p>}
                {seller.gst_number && <p className="text-xs text-gray-400 mt-0.5">GST: {seller.gst_number}</p>}
                <p className="text-xs text-gray-400 mt-0.5">Joined: {new Date(seller.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
              {seller.status !== 'approved' && (
                <button onClick={() => updateStatus(seller.id, 'approved')}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors">✓ Approve</button>
              )}
              {seller.status !== 'rejected' && (
                <button onClick={() => updateStatus(seller.id, 'rejected')}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors">✕ Reject</button>
              )}
              {seller.status === 'approved' && (
                <button onClick={() => updateStatus(seller.id, 'pending')}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-700 font-semibold text-sm px-4 py-2 rounded-lg transition-colors">⏸ Suspend</button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
            <p className="text-gray-400">No {filter === 'all' ? '' : filter} sellers</p>
          </div>
        )}
      </div>
    </div>
  );
}
