'use client';
import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CATEGORIES, PRODUCTS, CURRENT_SELLER, formatPrice } from '@/lib/mockData';

function AddProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const existing = editId ? PRODUCTS.find(p => p.id === editId) : null;

  const [form, setForm] = useState({
    name: existing?.name ?? '',
    description: existing?.description ?? '',
    price: existing?.price ?? '',
    stock: existing?.stock ?? '',
    category: existing?.category ?? '',
  });
  const [imagePreview, setImagePreview] = useState(existing?.image ?? null);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const fileRef = useRef(null);

  function setField(k, v) {
    setForm(prev => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: '' }));
  }

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Enter a valid price';
    if (!form.stock || isNaN(form.stock) || Number(form.stock) < 0) e.stock = 'Enter a valid stock quantity';
    if (!form.category) e.category = 'Select a category';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setSaved(true);
    setTimeout(() => router.push('/seller/products'), 1200);
  }

  const Input = ({ label, field, type = 'text', placeholder, hint }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[field]}
        onChange={e => setField(field, e.target.value)}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-300 outline-none transition-colors focus:ring-2 focus:ring-gold/40 ${
          errors[field] ? 'border-red-300' : 'border-gray-200 focus:border-gold'
        }`}
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
    </div>
  );

  const emojis = ['🛒', '👗', '💻', '🏠', '✨', '🎨', '🍽️', '📚', '🌿', '💎'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/seller/products" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-3 w-fit">
          ← Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{editId ? 'Edit Product' : 'Add New Product'}</h1>
        <p className="text-sm text-gray-400 mt-1">{CURRENT_SELLER.shopName}</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-5 flex items-center gap-2 font-semibold text-sm">
          ✓ Product {editId ? 'updated' : 'added'} successfully! Redirecting…
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Image upload */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4">Product Image</h2>
          <div className="flex gap-5 items-start">
            <div
              onClick={() => fileRef.current?.click()}
              className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-200 hover:border-gold transition-colors cursor-pointer flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0"
            >
              {imagePreview
                ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                : <div className="text-center p-3">
                    <p className="text-2xl">📷</p>
                    <p className="text-xs text-gray-400 mt-1">Click to upload</p>
                  </div>
              }
            </div>
            <div className="flex-1">
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
              <p className="text-sm font-medium text-gray-700 mb-1">Upload product photo</p>
              <p className="text-xs text-gray-400 mb-3">JPG, PNG. Recommended: 800×800px square. Max 5MB.</p>
              <button type="button" onClick={() => fileRef.current?.click()} className="text-xs bg-navy-700 hover:bg-navy-800 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
                Choose File
              </button>
              {imagePreview && (
                <button type="button" onClick={() => setImagePreview(null)} className="ml-2 text-xs text-red-400 hover:text-red-600 font-medium">
                  Remove
                </button>
              )}
              <p className="text-xs text-amber-600 mt-2">⚠ Image preview only — no real upload in demo</p>
            </div>
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-gray-900">Product Details</h2>
          <Input label="Product Name" field="name" placeholder="e.g. Organic Turmeric Powder 500g" />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => setField('description', e.target.value)}
              placeholder="Describe your product — key features, materials, size, usage instructions…"
              rows={4}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-300 outline-none transition-colors focus:ring-2 focus:ring-gold/40 resize-none ${
                errors.description ? 'border-red-300' : 'border-gray-200 focus:border-gold'
              }`}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={e => setField('category', e.target.value)}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white outline-none transition-colors focus:ring-2 focus:ring-gold/40 ${
                errors.category ? 'border-red-300' : 'border-gray-200 focus:border-gold'
              }`}
            >
              <option value="">Select a category…</option>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>
        </div>

        {/* Pricing & stock */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4">Pricing & Inventory</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Price (₹)" field="price" type="number" placeholder="250" hint="Mazel charges 8% commission per sale" />
            <Input label="Stock Quantity" field="stock" type="number" placeholder="50" hint="Number of units available" />
          </div>

          {form.price && !isNaN(form.price) && Number(form.price) > 0 && (
            <div className="mt-4 bg-gold-50 border border-gold-200 rounded-xl p-3 text-sm">
              <p className="font-semibold text-gray-700 mb-1">Earnings breakdown</p>
              <div className="text-gray-600 space-y-0.5 text-xs">
                <div className="flex justify-between">
                  <span>Selling price</span><span className="font-medium">{formatPrice(Number(form.price))}</span>
                </div>
                <div className="flex justify-between text-red-500">
                  <span>Mazel commission (8%)</span><span>− {formatPrice(Number(form.price) * 0.08)}</span>
                </div>
                <div className="flex justify-between font-bold text-green-700 pt-1 border-t border-gold-200">
                  <span>You receive</span><span>{formatPrice(Number(form.price) * 0.92)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/seller/products" className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-center hover:bg-gray-50 transition-colors text-sm">
            Cancel
          </Link>
          <button
            type="submit"
            className="flex-1 bg-gold hover:bg-gold-600 text-navy-900 font-black py-3 rounded-xl transition-colors text-sm shadow-lg shadow-gold/20"
          >
            {editId ? 'Save Changes' : 'Publish Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AddProductPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-xl w-48" />
          <div className="h-48 bg-gray-200 rounded-2xl" />
          <div className="h-32 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    }>
      <AddProductForm />
    </Suspense>
  );
}
