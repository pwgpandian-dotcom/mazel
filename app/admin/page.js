'use client';
import Link from 'next/link';
import { ADMIN_STATS, MOCK_ORDERS, SELLERS, formatPrice } from '@/lib/mockData';
import StatusBadge from '@/components/StatusBadge';

const stats = [
  { label: 'Total Orders', value: ADMIN_STATS.totalOrders, icon: '🧾', color: 'bg-blue-50 text-blue-700', sub: `₹${(ADMIN_STATS.totalRevenue / 100000).toFixed(1)}L gross revenue` },
  { label: 'Platform Commission', value: formatPrice(ADMIN_STATS.totalCommission), icon: '💰', color: 'bg-green-50 text-green-700', sub: '8% of all transactions' },
  { label: 'Active Sellers', value: ADMIN_STATS.approvedSellers, icon: '🏪', color: 'bg-purple-50 text-purple-700', sub: `${ADMIN_STATS.pendingSellers} awaiting approval` },
  { label: 'Total Buyers', value: ADMIN_STATS.totalBuyers, icon: '👥', color: 'bg-amber-50 text-amber-700', sub: 'Registered accounts' },
];

const quickLinks = [
  { href: '/admin/sellers', label: 'Approve Sellers', icon: '✓', badge: SELLERS.filter(s => s.status === 'pending').length, color: 'bg-amber-500' },
  { href: '/admin/categories', label: 'Manage Categories', icon: '📂', badge: null, color: 'bg-blue-500' },
  { href: '/admin/orders', label: 'All Orders', icon: '📦', badge: MOCK_ORDERS.length, color: 'bg-green-500' },
];

export default function AdminDashboardPage() {
  const recentOrders = [...MOCK_ORDERS].sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-gold font-semibold">Admin Panel</p>
          <h1 className="text-2xl font-black text-gray-900">✦ Mazel Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Platform overview — all-time statistics</p>
        </div>
        <div className="flex gap-2">
          {SELLERS.filter(s => s.status === 'pending').length > 0 && (
            <Link href="/admin/sellers" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2">
              ⏳ {SELLERS.filter(s => s.status === 'pending').length} Seller{SELLERS.filter(s => s.status === 'pending').length > 1 ? 's' : ''} Pending
            </Link>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${stat.color} text-xl mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            <p className="text-sm font-medium text-gray-600 mt-0.5">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue highlight */}
      <div className="bg-navy-700 rounded-2xl p-6 mb-8 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-navy-200 text-sm mb-1">Total Platform Revenue (All-Time)</p>
            <p className="text-4xl font-black text-gold">{formatPrice(ADMIN_STATS.totalRevenue)}</p>
            <p className="text-navy-200 text-xs mt-2">Across {ADMIN_STATS.totalOrders} orders · {ADMIN_STATS.totalProducts} products · {ADMIN_STATS.totalSellers} sellers</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Avg Order', value: formatPrice(Math.round(ADMIN_STATS.totalRevenue / ADMIN_STATS.totalOrders)) },
              { label: 'Commission Rate', value: '8%' },
              { label: 'Net Commission', value: formatPrice(ADMIN_STATS.totalCommission) },
              { label: 'Growth', value: '+24%' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-gold font-black text-sm">{kpi.value}</p>
                <p className="text-navy-200 text-xs mt-0.5">{kpi.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-gold-600 font-semibold hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.map(order => (
              <div key={order.id} className="p-4 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-800">{order.id}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {order.buyerName} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gold-600 text-sm">{formatPrice(order.total)}</p>
                  <p className="text-xs text-green-600">+{formatPrice(order.commission)} commission</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links + Seller status */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h2 className="font-bold text-gray-900 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {quickLinks.map(link => (
                <Link key={link.href} href={link.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className={`w-8 h-8 ${link.color} rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0`}>
                    {link.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 flex-1">{link.label}</span>
                  {link.badge != null && (
                    <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full">{link.badge}</span>
                  )}
                  <span className="text-gray-300 group-hover:text-gray-500">›</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Seller breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h2 className="font-bold text-gray-900 mb-3">Sellers</h2>
            {SELLERS.map(seller => (
              <div key={seller.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 rounded-full bg-navy-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {seller.shopName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{seller.shopName}</p>
                  <p className="text-xs text-gray-400">{seller.location}</p>
                </div>
                <StatusBadge status={seller.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
