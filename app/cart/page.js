'use client';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/mockData';

export default function CartPage() {
  const { items, removeItem, updateQty, total, count, clearCart } = useCart();
  const delivery = total >= 500 ? 0 : 49;
  const grand = total + delivery;

  if (items.length === 0) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🛒</p>
          <p className="text-gray-700 font-semibold text-xl mb-2">Your cart is empty</p>
          <p className="text-gray-400 mb-6">Add products from our marketplace to get started</p>
          <Link href="/" className="inline-block bg-gold hover:bg-gold-600 text-navy-900 font-bold px-6 py-3 rounded-xl transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-sm text-gray-400">{count} item{count !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600 font-medium transition-colors">
          Clear all
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm border border-gray-100">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/product/${item.id}`} className="font-semibold text-gray-900 hover:text-navy-700 transition-colors text-sm leading-tight line-clamp-2">
                      {item.name}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">{item.shopName}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 text-lg leading-none"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold transition-colors"
                    >−</button>
                    <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold transition-colors"
                    >+</button>
                  </div>
                  <span className="font-bold text-gold-600">{formatPrice(item.price * item.qty)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-32">
            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm mb-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-gray-600">
                  <span className="truncate mr-2">{item.name} × {item.qty}</span>
                  <span className="font-medium flex-shrink-0">{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className={delivery === 0 ? 'text-green-600 font-medium' : ''}>{delivery === 0 ? 'FREE' : formatPrice(delivery)}</span>
              </div>
              {delivery === 0 && <p className="text-xs text-green-600">🎉 Free delivery on orders above ₹500!</p>}
              {delivery > 0 && <p className="text-xs text-gray-400">Add {formatPrice(500 - total)} more for free delivery</p>}
            </div>

            <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-gold-600">{formatPrice(grand)}</span>
            </div>

            <Link
              href="/checkout"
              className="w-full mt-5 bg-gold hover:bg-gold-600 text-navy-900 font-bold py-3 rounded-xl text-center block transition-colors"
            >
              Proceed to Checkout →
            </Link>

            <Link href="/" className="w-full mt-2 text-center block text-sm text-gray-400 hover:text-gray-600 transition-colors py-2">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
