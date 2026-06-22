'use client';
import { CartProvider } from '@/context/CartContext';
import { RoleProvider } from '@/context/RoleContext';
import Header from './Header';

export default function Providers({ children }) {
  return (
    <CartProvider>
      <RoleProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-navy-900 text-white py-10 mt-auto">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div>
                  <p className="text-gold font-black text-xl mb-2">✦ Mazel</p>
                  <p className="text-navy-200 text-sm leading-relaxed">Your lucky marketplace. Discover quality products from trusted sellers.</p>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm mb-3">Shop</p>
                  <ul className="space-y-1.5 text-navy-200 text-sm">
                    <li>Groceries</li><li>Clothing</li><li>Electronics</li><li>Handmade</li>
                  </ul>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm mb-3">Sell on Mazel</p>
                  <ul className="space-y-1.5 text-navy-200 text-sm">
                    <li>Become a Seller</li><li>Seller Dashboard</li><li>8% Commission</li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-navy-800 pt-6 text-center">
                <p className="text-navy-400 text-xs">© 2024 Mazel. Tamil Nadu's homegrown marketplace. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </RoleProvider>
    </CartProvider>
  );
}
