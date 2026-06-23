'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';

export default function AdminCategoriesPage() {
  const { user, loading: authLoading } = useUser();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (authLoading || !user) return;
    createClient().from('categories').select('*').order('name')
      .then(({ data }) => { setCategories(data ?? []); setLoading(false); });
  }, [user, authLoading]);

  async function addCategory() {
    if (!newName.trim()) { setError('Name is required'); return; }
    const slug = newName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (categories.some(c => c.slug === slug)) { setError('Category already exists'); return; }
    const { data, error: e } = await createClient().from('categories').insert({ name: newName.trim(), slug }).select().single();
    if (e) { setError(e.message); return; }
    setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    setNewName(''); setError('');
  }

  async function deleteCategory(id) {
    await createClient().from('categories').delete().eq('id', id);
    setCategories(prev => prev.filter(c => c.id !== id));
    setDeleteId(null);
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse"><div className="h-8 bg-gray-200 rounded w-32 mb-6" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <p className="text-sm text-gray-400">Admin</p>
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Add New Category</h2>
        <div className="flex gap-3">
          <input value={newName} onChange={e => { setNewName(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && addCategory()}
            placeholder="e.g. Sports & Fitness"
            className={`flex-1 border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold/40 ${error ? 'border-red-300' : 'border-gray-200 focus:border-gold'}`} />
          <button onClick={addCategory} className="bg-gold hover:bg-gold-600 text-navy-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors flex-shrink-0">+ Add</button>
        </div>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        {newName && (
          <div className="mt-3">
            <p className="text-xs text-gray-400 mb-1">Preview</p>
            <span className="inline-flex items-center gap-1.5 bg-gold-50 border border-gold-200 text-gold-700 font-semibold text-sm px-3 py-1 rounded-full">
              {newName.trim()}
            </span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{categories.length} Categories</p>
        </div>
        <div className="divide-y divide-gray-50">
          {categories.map(cat => (
            <div key={cat.id} className="p-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{cat.name}</p>
                <p className="text-xs text-gray-400">slug: {cat.slug}</p>
              </div>
              <button onClick={() => setDeleteId(cat.id)}
                className="text-xs text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-semibold transition-colors">
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <p className="text-xl font-black text-gray-900 mb-2">Delete "{categories.find(c => c.id === deleteId)?.name}"?</p>
            <p className="text-sm text-gray-500 mb-5">Products in this category will lose their category tag.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
              <button onClick={() => deleteCategory(deleteId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
