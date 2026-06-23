'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';

export default function BecomeSellerPage() {
  const { user, profile, loading } = useUser();
  const router = useRouter();
  const [existing, setExisting] = useState(null);
  const [form, setForm] = useState({ shopName: '', shopAddress: '', gstNumber: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login?next=/become-seller');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    createClient().from('sellers').select('*').eq('id', user.id).single()
      .then(({ data }) => setExisting(data ?? null));
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSubmitting(true);
    const supabase = createClient();
    const { error: e1 } = await supabase.from('sellers').insert({
      id: user.id,
      shop_name: form.shopName,
      shop_address: form.shopAddress,
      gst_number: form.gstNumber || null,
      status: 'approved',
    });
    if (e1) { setError(e1.message); setSubmitting(false); return; }
    await supabase.from('profiles').update({ role: 'seller' }).eq('id', user.id);
    router.push('/seller');
    router.refresh();
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading…</p></div>;

  if (existing) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <p className="text-4xl mb-4">🏪</p>
      <h1 className="text-2xl font-black text-gray-900 mb-2">{existing.shop_name}</h1>
      <p className="text-gray-500 mb-4">
        Status: <span className={`font-semibold ${existing.status === 'approved' ? 'text-green-600' : existing.status === 'rejected' ? 'text-red-500' : 'text-amber-600'}`}>
          {existing.status}
        </span>
      </p>
      {existing.status === 'approved' && (
        <Link href="/seller" className="bg-gold text-navy-900 font-bold px-6 py-3 rounded-xl inline-block">Go to Dashboard</Link>
      )}
      {existing.status === 'pending' && (
        <p className="text-sm text-gray-400">Your application is under review. We'll notify you once approved.</p>
      )}
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <p className="text-3xl mb-2">🏪</p>
          <h1 className="text-2xl font-black text-gray-900">Start Selling on Mazel</h1>
          <p className="text-gray-500 text-sm mt-2">Tell us about your shop. We'll review and approve within 24 hours.</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-5 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Shop Name *</label>
            <input type="text" value={form.shopName} onChange={e => setForm(f => ({ ...f, shopName: e.target.value }))}
              placeholder="e.g. Senthil Stores" required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Shop Address *</label>
            <textarea value={form.shopAddress} onChange={e => setForm(f => ({ ...f, shopAddress: e.target.value }))}
              placeholder="Full address of your shop or warehouse" required rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">GST Number <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="text" value={form.gstNumber} onChange={e => setForm(f => ({ ...f, gstNumber: e.target.value }))}
              placeholder="22AAAAA0000A1Z5"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" />
          </div>

          <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-700 mb-1">Mazel Seller Terms</p>
            <p>• Platform commission: <strong>8%</strong> per sale</p>
            <p>• Payouts processed weekly</p>
            <p>• You handle shipping and returns</p>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full bg-gold hover:bg-gold-600 text-navy-900 font-black py-3 rounded-xl transition-colors disabled:opacity-60">
            {submitting ? 'Submitting…' : 'Apply to Sell'}
          </button>
        </form>
      </div>
    </div>
  );
}
