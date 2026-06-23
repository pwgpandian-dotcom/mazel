'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';

export default function SetupPage() {
  const { user, loading } = useUser();
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  async function runSetup() {
    setStatus('running');
    const res = await fetch('/api/setup', { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      setStatus('done');
      setMessage(data.message);
      setTimeout(() => { window.location.href = '/admin'; }, 2500);
    } else {
      setStatus('error');
      setMessage(data.error);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Loading…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
        <p className="text-4xl mb-4">⚙️</p>
        <h1 className="text-2xl font-black text-gray-900 mb-2">One-Time Setup</h1>
        <p className="text-gray-500 text-sm mb-6">
          Sets you as admin, creates a demo seller shop, and adds 2 sample products so you can test the full buyer → seller → admin flow.
        </p>

        {!user ? (
          <div>
            <p className="text-amber-600 text-sm font-medium mb-4">Sign in first, then run setup.</p>
            <Link href="/auth/login?next=/setup"
              className="bg-gold text-navy-900 font-bold px-6 py-3 rounded-xl inline-block">
              Sign In
            </Link>
          </div>
        ) : status === 'done' ? (
          <div>
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-4 text-sm font-medium">
              ✓ {message}
            </div>
            <p className="text-gray-400 text-sm">Redirecting to admin dashboard…</p>
          </div>
        ) : status === 'error' ? (
          <div>
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-4 text-sm">
              {message}
            </div>
            <Link href="/admin"
              className="bg-navy-700 text-white font-bold px-6 py-3 rounded-xl inline-block text-sm">
              Go to Admin Dashboard
            </Link>
          </div>
        ) : (
          <div>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left text-sm space-y-1">
              <p className="font-semibold text-gray-700 mb-2">Signed in as:</p>
              <p className="text-gray-600">{user.email}</p>
            </div>

            <div className="text-left bg-navy-50 border border-navy-100 rounded-xl p-4 mb-6 text-sm space-y-2">
              <p className="font-semibold text-navy-700">What setup does:</p>
              <p className="text-gray-600">✦ Promotes your account to <strong>Admin</strong></p>
              <p className="text-gray-600">✦ Creates a <strong>Demo Seller</strong> shop (approved)</p>
              <p className="text-gray-600">✦ Adds <strong>2 sample products</strong> to the homepage</p>
            </div>

            <button
              onClick={runSetup}
              disabled={status === 'running'}
              className="w-full bg-gold hover:bg-gold-600 text-navy-900 font-black py-3 rounded-xl transition-colors disabled:opacity-60">
              {status === 'running' ? 'Setting up…' : 'Run Setup'}
            </button>
            <p className="text-xs text-gray-400 mt-3">Can only be run once (blocked if admin already exists).</p>
          </div>
        )}
      </div>
    </div>
  );
}
