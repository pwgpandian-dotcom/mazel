'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import StatusBadge from '@/components/StatusBadge';

function formatPrice(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default function SellerDashboardPage() {
  const { user, profile, loading: authLoading } = useUser();
  const router = useRouter();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/auth/login?next=/seller'); return; }
    if (profile && profile.role !== 'seller' && profile.role !== 'admin') { router.push('/become-seller'); return; }
    const supabase = createClient();
    Promise.all([
      supabase.from('sellers').select('*').eq('id', user.id).single(),
      supabase.from('products').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }),
      supabase.from('order_items').select('*, orders(*)').eq('seller_id', user.id).order('id', { ascending: false }).limit(10),
    ]).then(([{ data: s }, { data: p }, { data: o }]) => {
      setSeller(s); setProducts(p ?? []); setOrders(o ?? []);
      setLoading(false);
    });
  }, [user, profile, authLoading, router]);

  if (authLoading || loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
      <div className="grid grid-cols-4 gap-4 mb-8">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}</div>
    </div>
  );

  if (!seller) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <p className="text-4xl mb-4">🏪</p>
      <p className="text-gray-600 mb-4">Seller profile not found.</p>
      <Link href="/become-seller" className="bg-gold text-navy-900 font-bold px-6 py-3 rounded-xl inline-block">Apply to Sell</Link>
    </div>
  );

  const revenue = orders.reduce((s, o) => s + parseFloat(o.price_at_order ?? 0) * (o.quantity ?? 1), 0);
  const stats = [
    { label: 'Products', value: products.length, icon: '📦', sub: `${products.filter(p => p.stock > 0).length} in stock` },
    { label: 'Orders', value: orders.length, icon: '🧾', sub: 'Recent 10' },
    { label: 'Revenue', value: formatPrice(revenue), icon: '💰', sub: 'Gross sales' },
    { label: 'Status', value: seller.status, icon: seller.status === 'approved' ? '✅' : '⏳', sub: 'Shop status' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {seller.status === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
          ⏳ Your shop is pending admin approval. Products cannot be added until your account is approved.
        </div>
      )}
      {seller.status === 'rejected' && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
          ✗ Your seller application was rejected. Contact support for more information.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-gray-400">Seller Dashboard</p>
          <h1 className="text-2xl font-black text-gray-900">{seller.shop_name}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{seller.shop_address}</p>
        </div>
        {seller.status === 'approved' && (
          <Link href="/seller/products/add" className="bg-gold hover:bg-gold-600 text-navy-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
            + Add Product
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-2xl mb-2">{s.icon}</p>
            <p className="text-2xl font-black text-gray-900">{s.value}</p>
            <p className="text-sm font-medium text-gray-600 mt-0.5">{s.label}</p>
            <p className="text-xs text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <Link href="/seller/orders" className="text-sm text-gold-600 font-semibold hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {orders.length === 0 && <p className="p-5 text-sm text-gray-400 text-center">No orders yet</p>}
            {orders.map(o => (
              <div key={o.id} className="p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">Order #{o.order_id}</p>
                  <p className="text-xs text-gray-400">×{o.quantity} units</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gold-600">{formatPrice(parseFloat(o.price_at_order) * o.quantity)}</p>
                  <StatusBadge status={o.item_status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Your Products</h2>
            <Link href="/seller/products" className="text-sm text-gold-600 font-semibold hover:underline">Manage →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {products.slice(0, 6).map(p => (
              <div key={p.id} className="p-3 flex items-center gap-3">
                <img src={p.images?.[0] ?? `https://placehold.co/40x40/E0A500/ffffff?text=${p.name[0]}`}
                  alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">Stock: {p.stock}</p>
                </div>
                <span className="text-sm font-bold text-gold-600">{formatPrice(p.price)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
