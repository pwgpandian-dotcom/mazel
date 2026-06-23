'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName, phone: form.phone },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (authError) {
      setErrorMsg(authError.message || 'Signup failed. Please try again.');
      setLoading(false);
      return;
    }
    setDone(true);
    setTimeout(() => router.push('/'), 2000);
  }

  if (done) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md text-center">
        <p className="text-4xl mb-4">🎉</p>
        <h2 className="text-xl font-black text-gray-900 mb-2">Account created!</h2>
        <p className="text-gray-500 text-sm">Redirecting to home…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black text-navy-700">✦ Mazel</Link>
          <p className="text-gray-500 text-sm mt-2">Create your account</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-5 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full Name',     key: 'fullName',  type: 'text',     placeholder: 'Ananya Krishnan' },
            { label: 'Phone Number',  key: 'phone',     type: 'tel',      placeholder: '9876543210' },
            { label: 'Email',         key: 'email',     type: 'email',    placeholder: 'you@example.com' },
            { label: 'Password',      key: 'password',  type: 'password', placeholder: 'Min 6 characters' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f.label}</label>
              <input
                type={f.type}
                value={form[f.key]}
                onChange={set(f.key)}
                placeholder={f.placeholder}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold hover:bg-gold-600 text-navy-900 font-black py-3 rounded-xl transition-colors mt-2 disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-gold-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
