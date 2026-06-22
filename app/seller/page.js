'use client';
import Link from 'next/link';
import { CURRENT_SELLER, getSellerProducts, getSellerOrders, formatPrice } from '@/lib/mockData';
import StatusBadge from '@/components/StatusBadge';

export default function SellerDashboardPage() {
  const products = getSellerProducts(CURRENT_SELLER.id);
  const orders = getSellerOrders(CURRENT_SELLER.id);
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const recentOrders = [...orders].sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt)).slice(0, 4);

  const stats = [
    { label: 'Total Products', value: products.length, icon: '📦', color: 'bg-blue-50 text-blue-700', sub: `${products.filter(p => p.stock > 0).length} in stock` },
    { label: 'Total Orders', value: orders.length, icon: '🧾', color: 'bg-amber-50 text-amber-700', sub: `${orders.filter(o => o.status === 'placed').length} pending` },
    { label: 'Revenue Earned', value: formatPrice(totalRevenue), icon: '💰', color: 'bg-green-50 text-green-700', sub: 'after 8% commission' },
    { label: 'Avg Order Value', value: orders.length ? formatPrice(totalRevenue / orders.length) : '₹0', icon: '📈', color: 'bg-purple-50 text-purple-700', sub: 'per order' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-gray-400 font-medium">Seller Dashboard</p>
          <h1 className="text-2xl font-black text-gray-900">{CURRENT_SELLER.shopName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={CURRENT_SELLER.status} />
            <span className="text-xs text-gray-400">{CURRENT_SELLER.location}</span>
          </div>
        </div>
        <Link href="/seller/products/add" className="bg-gold hover:bg-gold-600 text-navy-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2">
          + Add Product
        </Link>
      </div>

      {/* Stats */}
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <Link href="/seller/orders" className="text-sm text-gold-600 font-semibold hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.length === 0 && (
              <p className="p-5 text-sm text-gray-400 text-center">No orders yet</p>
            )}
            {recentOrders.map(order => (
              <div key={order.id} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center text-navy-700 font-bold text-xs flex-shrink-0">
                  #{order.id.slice(-3)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{order.buyerName}</p>
                  <p className="text-xs text-gray-400">{order.items.length} item{order.items.length !== 1 ? 's' : ''} · {new Date(order.placedAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gold-600">{formatPrice(order.total)}</p>
                  <StatusBadge status={order.status} className="mt-0.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Your Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Your Products</h2>
            <Link href="/seller/products" className="text-sm text-gold-600 font-semibold hover:underline">Manage →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {products.slice(0, 5).map(product => (
              <div key={product.id} className="p-3 flex items-center gap-3">
                <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                  <p className="text-xs text-gray-400">Stock: {product.stock} units</p>
                </div>
                <span className="text-sm font-bold text-gold-600 flex-shrink-0">{formatPrice(product.price)}</span>
              </div>
            ))}
            {products.length > 5 && (
              <div className="p-3 text-center">
                <Link href="/seller/products" className="text-xs text-gold-600 font-semibold hover:underline">
                  +{products.length - 5} more products
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick tips */}
      <div className="mt-6 bg-navy-700 rounded-2xl p-5 text-white">
        <h3 className="font-bold mb-3">💡 Seller Tips</h3>
        <div className="grid sm:grid-cols-3 gap-3 text-sm text-navy-200">
          <p>🖼 Add clear product photos to increase conversions by up to 40%</p>
          <p>✍️ Write detailed descriptions with key features and dimensions</p>
          <p>📦 Ship within 24 hours of an order to earn a Fast Shipper badge</p>
        </div>
      </div>
    </div>
  );
}
