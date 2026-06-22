'use client';
import { useState } from 'react';
import { CATEGORIES, PRODUCTS } from '@/lib/mockData';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(CATEGORIES);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🏷️');
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  function addCategory() {
    if (!newName.trim()) { setError('Category name is required'); return; }
    if (categories.some(c => c.label.toLowerCase() === newName.trim().toLowerCase())) {
      setError('Category already exists');
      return;
    }
    const id = newName.trim().toLowerCase().replace(/\s+/g, '-');
    setCategories(prev => [...prev, { id, label: newName.trim(), emoji: newEmoji, color: 'E0A500' }]);
    setNewName('');
    setNewEmoji('🏷️');
    setError('');
  }

  function deleteCategory(id) {
    setCategories(prev => prev.filter(c => c.id !== id));
    setDeleteId(null);
  }

  function productCount(id) {
    return PRODUCTS.filter(p => p.category === id).length;
  }

  const emojis = ['🛒', '👗', '💻', '🏠', '✨', '🎨', '🍽️', '📚', '🧸', '🌿', '💎', '🏷️'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <p className="text-sm text-gray-400">Admin</p>
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="text-sm text-gray-400 mt-1">Manage product categories on the marketplace</p>
      </div>

      {/* Add category */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Add New Category</h2>
        <div className="flex flex-wrap gap-3">
          <div className="flex-shrink-0">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Emoji</label>
            <div className="flex gap-1 flex-wrap max-w-xs">
              {emojis.map(e => (
                <button
                  key={e}
                  onClick={() => setNewEmoji(e)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${newEmoji === e ? 'bg-gold text-navy-900 scale-110' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Category Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={e => { setNewName(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && addCategory()}
                placeholder="e.g. Sports & Fitness"
                className={`flex-1 border rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-300 outline-none focus:ring-2 focus:ring-gold/40 ${error ? 'border-red-300' : 'border-gray-200 focus:border-gold'}`}
              />
              <button
                onClick={addCategory}
                className="bg-gold hover:bg-gold-600 text-navy-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors flex-shrink-0"
              >
                + Add
              </button>
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        </div>

        {/* Preview */}
        {newName && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">Preview</p>
            <span className="inline-flex items-center gap-1.5 bg-gold-50 border border-gold-200 text-gold-700 font-semibold text-sm px-4 py-1.5 rounded-full">
              {newEmoji} {newName.trim()}
            </span>
          </div>
        )}
      </div>

      {/* Category list */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{categories.length} Categories</p>
        </div>
        <div className="divide-y divide-gray-50">
          {categories.map(cat => {
            const count = productCount(cat.id);
            return (
              <div key={cat.id} className="p-4 flex items-center gap-4">
                <span className="text-2xl flex-shrink-0">{cat.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{cat.label}</p>
                  <p className="text-xs text-gray-400">{count} product{count !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${count > 0 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {count > 0 ? `${count} products` : 'Empty'}
                  </span>
                  <button
                    onClick={() => setDeleteId(cat.id)}
                    className="text-xs text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete modal */}
      {deleteId && (() => {
        const cat = categories.find(c => c.id === deleteId);
        const count = productCount(deleteId);
        return (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <p className="text-xl font-black text-gray-900 mb-2">Delete "{cat?.label}"?</p>
              {count > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <p className="text-sm text-red-600 font-medium">⚠ This category has {count} product{count !== 1 ? 's' : ''}.</p>
                  <p className="text-xs text-red-500 mt-0.5">Products will remain but lose their category.</p>
                </div>
              )}
              <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">Cancel</button>
                <button onClick={() => deleteCategory(deleteId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">Delete</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
