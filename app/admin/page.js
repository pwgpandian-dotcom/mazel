'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import StatusBadge from '@/components/StatusBadge';

function formatPrice(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default function AdminDashboardPage() {
  const { user, profile, loading: authLoading } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/auth/login?next=/admin'); return; }
    if (profile && profile.role !== 'admin') { router.push('/'); return; }
    const supabase = createClient();
    Promise.all([
      supabase.from('orders').select('total_amount, platform_commission, order_status'),
      supabase.from('sellers').select('id, status'),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'buyer'),
      supabase.from('orders').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(6),
      supabase.from('sellers').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(5),
    ]).then(([{ data: orders }, { data: sellerList }, { count: prodCount }, { count: buyerCount }, { data: recentOrders }, { data: recentSellers }]) => {
      const totalRevenue = (orders ?? []).reduce((s, o) => s + parseFloat(o.total_amount ?? 0), 0);
      const totalCommission = (orders ?? []).reduce((s, o) => s + parseFloat(o.platform_commission ?? 0), 0);
      setStats({
        totalOrders: (orders ?? []).length,
        totalRevenue,
        totalCommission,
        totalSellers: (sellerList ?? []).length,
        pendingSellers: (sellerList ?? []).filter(s => s.status === 'pending').length,
        totalProducts: prodCount ?? 0,
        totalBuyers: buyerCount ?? 0,
      });
      setOrders(recentOrders ?? []);
      setSellers(recentSellers ?? []);
      setLoading(false);
    });
  }, [user, profile, authLoading, router]);

  if (authLoading || loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
      <div className="grid grid-cols-4 gap-4 mb-8">{[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}</div>
    </div>
  );

  const kpis = [
    { label: 'Total Orders', value: stats?.totalOrders ?? 0, icon: '🧾', sub: 'All time' },
    { label: 'Platform Revenue', value: formatPrice(stats?.totalRevenue ?? 0), icon: '💰', sub: 'Gross sales' },
    { label: 'Commission (8%)', value: formatPrice(stats?.totalCommission ?? 0), icon: '✓', sub: 'Net earnings' },
    { label: 'Active Sellers', value: stats?.totalSellers ?? 0, icon: '🏪', sub: `${stats?.pendingSellers ?? 0} pending` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-gold font-semibold">Admin Panel</p>
          <h1 className="text-2xl font-black text-gray-900">✦ Mazel Dashboard</h1>
        </div>
        {(stats?.pendingSellers ?? 0) > 0 && (
          <Link href="/admin/sellers" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-sm">
            ⏳ {stats.pendingSellers} Seller{stats.pendingSellers > 1 ? 's' : ''} Pending
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map(k => (
          <div key={k.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-2xl mb-2">{k.icon}</p>
            <p className="text-2xl font-black text-gray-900">{k.value}</p>
            <p className="text-sm font-medium text-gray-600 mt-0.5">{k.label}</p>
            <p className="text-xs text-gray-400">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-navy-700 rounded-2xl p-6 mb-8 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-navy-200 text-sm mb-1">Total Platform Revenue</p>
            <p className="text-4xl font-black text-gold">{formatPrice(stats?.totalRevenue ?? 0)}</p>
            <p className="text-navy-200 text-xs mt-2">{stats?.totalOrders} orders · {stats?.totalProducts} products · {stats?.totalSellers} sellers · {stats?.totalBuyers} buyers</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Avg Order', formatPrice(stats?.totalOrders ? (stats.totalRevenue / stats.totalOrders) : 0)],
              ['Commission Rate', '8%'],
              ['Net Earned', formatPrice(stats?.totalCommission ?? 0)],
              ['Pending Sellers', stats?.pendingSellers ?? 0],
            ].map(([label, val]) => (
              <div key={label} className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-gold font-black text-sm">{val}</p>
                <p className="text-navy-200 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-gold-600 font-semibold hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {orders.map(o => (
              <div key={o.id} className="p-4 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-800">#{o.id}</span>
                    <StatusBadge status={o.order_status} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{o.profiles?.full_name ?? o.shipping_name} · {o.payment_method}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gold-600 text-sm">{formatPrice(o.total_amount)}</p>
                  <p className="text-xs text-green-600">+{formatPrice(o.platform_commission)} commission</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h2 className="font-bold text-gray-900 mb-3">Quick Actions</h2>
            {[
              { href: '/admin/sellers', label: 'Approve Sellers', icon: '✓', color: 'bg-amber-500' },
              { href: '/admin/categories', label: 'Manage Categories', icon: '📂', color: 'bg-blue-500' },
              { href: '/admin/orders', label: 'All Orders', icon: '📦', color: 'bg-green-500' },
            ].map(a => (
              <Link key={a.href} href={a.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className={`w-8 h-8 ${a.color} rounded-lg flex items-center justify-center text-white text-sm`}>{a.icon}</div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 flex-1">{a.label}</span>
                <span className="text-gray-300 group-hover:text-gray-500">›</span>
              </Link>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h2 className="font-bold text-gray-900 mb-3">Recent Sellers</h2>
            {sellers.map(s => (
              <div key={s.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 rounded-full bg-navy-700 text-white flex items-center justify-center font-bold text-xs">{s.shop_name[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{s.shop_name}</p>
                  <p className="text-xs text-gray-400">{s.profiles?.full_name}</p>
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
