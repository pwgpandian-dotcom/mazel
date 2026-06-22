'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useRole } from '@/context/RoleContext';

const ROLES = [
  { id: 'buyer',  label: 'Buyer',  icon: '🛍️', desc: 'Browse & buy products' },
  { id: 'seller', label: 'Seller', icon: '🏪', desc: 'Manage your shop' },
  { id: 'admin',  label: 'Admin',  icon: '⚙️', desc: 'Platform dashboard' },
];

const NAV = {
  buyer:  [{ href: '/',       label: 'Home' }, { href: '/orders', label: 'My Orders' }],
  seller: [{ href: '/seller', label: 'Dashboard' }, { href: '/seller/products', label: 'Products' }, { href: '/seller/orders', label: 'Orders' }],
  admin:  [{ href: '/admin',  label: 'Dashboard' }, { href: '/admin/sellers', label: 'Sellers' }, { href: '/admin/categories', label: 'Categories' }, { href: '/admin/orders', label: 'Orders' }],
};

const ROLE_HOME = { buyer: '/', seller: '/seller', admin: '/admin' };

export default function Header() {
  const { count } = useCart();
  const { role, setRole } = useRole();
  const router = useRouter();
  const pathname = usePathname();
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function switchRole(r) {
    setRole(r);
    setDropOpen(false);
    setMobileOpen(false);
    router.push(ROLE_HOME[r]);
  }

  const currentRole = ROLES.find(r => r.id === role);
  const navLinks = NAV[role];

  return (
    <header className="sticky top-0 z-50 bg-navy-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16 gap-6">

          {/* Logo */}
          <Link href={ROLE_HOME[role]} className="flex items-center gap-2 flex-shrink-0">
            <span className="text-gold text-xl font-black tracking-tight">✦ Mazel</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-gold text-navy-900 font-semibold'
                    : 'text-navy-100 hover:text-white hover:bg-navy-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3 ml-auto">

            {/* Role Switcher */}
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen(v => !v)}
                className="flex items-center gap-2 bg-navy-600 hover:bg-navy-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-navy-500"
              >
                <span>{currentRole.icon}</span>
                <span className="hidden sm:block">{currentRole.label}</span>
                <svg className={`w-3.5 h-3.5 transition-transform ${dropOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden py-1">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Demo role</p>
                  </div>
                  {ROLES.map(r => (
                    <button
                      key={r.id}
                      onClick={() => switchRole(r.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gold-50 transition-colors ${role === r.id ? 'bg-gold-50' : ''}`}
                    >
                      <span className="text-xl">{r.icon}</span>
                      <div>
                        <p className={`text-sm font-semibold ${role === r.id ? 'text-gold-600' : 'text-gray-800'}`}>
                          {r.label} {role === r.id && '✓'}
                        </p>
                        <p className="text-xs text-gray-400">{r.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart (buyer only) */}
            {role === 'buyer' && (
              <Link
                href="/cart"
                className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gold hover:bg-gold-600 text-navy-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {count}
                  </span>
                )}
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden text-white p-1.5"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-navy-600 py-3 pb-4 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  pathname === link.href
                    ? 'bg-gold text-navy-900 font-semibold'
                    : 'text-navy-100 hover:text-white hover:bg-navy-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
