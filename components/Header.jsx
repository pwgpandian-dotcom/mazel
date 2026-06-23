'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';

const NAV = {
  buyer:  [{ href: '/', label: 'Home' }, { href: '/orders', label: 'My Orders' }],
  seller: [{ href: '/seller', label: 'Dashboard' }, { href: '/seller/products', label: 'Products' }, { href: '/seller/orders', label: 'Orders' }],
  admin:  [{ href: '/admin', label: 'Dashboard' }, { href: '/admin/sellers', label: 'Sellers' }, { href: '/admin/categories', label: 'Categories' }, { href: '/admin/orders', label: 'Orders' }],
};

const ROLE_BADGE = {
  buyer:  { label: 'Buyer',  color: 'bg-blue-100 text-blue-700' },
  seller: { label: 'Seller', color: 'bg-purple-100 text-purple-700' },
  admin:  { label: 'Admin',  color: 'bg-red-100 text-red-700' },
};

export default function Header() {
  const { count } = useCart();
  const { user, profile, role, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [userOpen, setUserOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function h(e) { if (dropRef.current && !dropRef.current.contains(e.target)) setUserOpen(false); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserOpen(false);
    router.push('/auth/login');
    router.refresh();
  }

  const effectiveRole = role ?? 'buyer';
  const navLinks = NAV[effectiveRole] ?? NAV.buyer;
  const badge = ROLE_BADGE[effectiveRole];

  const homeHref = effectiveRole === 'seller' ? '/seller' : effectiveRole === 'admin' ? '/admin' : '/';

  return (
    <header className="sticky top-0 z-50 bg-navy-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16 gap-6">

          {/* Logo */}
          <Link href={homeHref} className="flex items-center gap-2 flex-shrink-0">
            <span className="text-gold text-xl font-black tracking-tight">✦ Mazel</span>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 flex-1">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-gold text-navy-900 font-semibold'
                      : 'text-navy-100 hover:text-white hover:bg-navy-600'
                  }`}>
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3 ml-auto">

            {loading ? (
              <div className="w-20 h-8 bg-navy-600 rounded-lg animate-pulse" />
            ) : user ? (
              <>
                {/* Cart (buyer/default only) */}
                {effectiveRole !== 'admin' && effectiveRole !== 'seller' && (
                  <Link href="/cart"
                    className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gold hover:bg-gold-600 text-navy-900 transition-colors">
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

                {/* User dropdown */}
                <div className="relative" ref={dropRef}>
                  <button onClick={() => setUserOpen(v => !v)}
                    className="flex items-center gap-2 bg-navy-600 hover:bg-navy-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-navy-500">
                    <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center text-navy-900 font-black text-xs flex-shrink-0">
                      {(profile?.full_name || user.email || '?')[0].toUpperCase()}
                    </div>
                    <span className="hidden sm:block max-w-24 truncate">{profile?.full_name || user.email?.split('@')[0]}</span>
                    <svg className={`w-3.5 h-3.5 transition-transform ${userOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {userOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900 truncate">{profile?.full_name || 'User'}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        <span className={`inline-block mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className="p-1">
                        {effectiveRole === 'buyer' && (
                          <Link href="/become-seller" onClick={() => setUserOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                            🏪 Become a Seller
                          </Link>
                        )}
                        {effectiveRole === 'seller' && (
                          <Link href="/seller" onClick={() => setUserOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                            📊 Seller Dashboard
                          </Link>
                        )}
                        <button onClick={signOut}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                          🚪 Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login"
                  className="text-navy-100 hover:text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-navy-600 transition-colors">
                  Login
                </Link>
                <Link href="/auth/signup"
                  className="bg-gold hover:bg-gold-600 text-navy-900 text-sm font-bold px-4 py-1.5 rounded-lg transition-colors">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen(v => !v)} className="md:hidden text-white p-1.5">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-navy-600 py-3 pb-4 space-y-1">
            {user
              ? navLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium ${pathname === link.href ? 'bg-gold text-navy-900' : 'text-navy-100 hover:bg-navy-600'}`}>
                  {link.label}
                </Link>
              ))
              : <>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-navy-100 text-sm">Login</Link>
                <Link href="/auth/signup" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-gold font-semibold text-sm">Sign Up</Link>
              </>
            }
          </div>
        )}
      </div>
    </header>
  );
}
