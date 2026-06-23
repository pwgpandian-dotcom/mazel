'use client';
import { useState, useRef, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';

function formatPrice(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function AddProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const { user } = useUser();

  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', categoryId: '' });
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]); // { file, preview, existing }[]
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.from('categories').select('*').order('name').then(({ data }) => setCategories(data ?? []));
    if (editId) {
      supabase.from('products').select('*').eq('id', editId).single().then(({ data }) => {
        if (!data) return;
        setForm({ name: data.name, description: data.description ?? '', price: data.price, stock: data.stock, categoryId: data.category_id });
        setImages((data.images ?? []).map(url => ({ existing: url, preview: url })));
      });
    }
  }, [editId]);

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: '' })); }

  function handleFiles(e) {
    const files = Array.from(e.target.files).slice(0, 3 - images.length);
    files.forEach(file => {
      const preview = URL.createObjectURL(file);
      setImages(prev => [...prev, { file, preview }]);
    });
  }

  function removeImage(i) { setImages(prev => prev.filter((_, idx) => idx !== i)); }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Valid price needed';
    if (!form.stock || isNaN(form.stock) || Number(form.stock) < 0) e.stock = 'Valid stock needed';
    if (!form.categoryId) e.categoryId = 'Select a category';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (!user) return;
    setSaving(true);

    const supabase = createClient();
    const uploadedUrls = [];

    for (const img of images) {
      if (img.existing && !img.file) { uploadedUrls.push(img.existing); continue; }
      const ext = img.file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage.from('products').upload(path, img.file, { upsert: true });
      if (error) { alert('Image upload failed: ' + error.message); setSaving(false); return; }
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(data.path);
      uploadedUrls.push(publicUrl);
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      category_id: parseInt(form.categoryId),
      images: uploadedUrls,
      status: 'active',
    };

    if (editId) {
      const { error } = await supabase.from('products').update(payload).eq('id', editId);
      if (error) { alert('Update failed: ' + error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('products').insert({ ...payload, seller_id: user.id });
      if (error) {
        alert(error.message.includes('policy') ? 'Your seller account must be approved before adding products.' : 'Failed: ' + error.message);
        setSaving(false);
        return;
      }
    }

    setSaved(true);
    setTimeout(() => router.push('/seller/products'), 1000);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/seller/products" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-3 w-fit">← Back</Link>
        <h1 className="text-2xl font-bold text-gray-900">{editId ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-5 text-sm font-semibold">
          ✓ {editId ? 'Updated' : 'Published'} successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Images */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4">Product Images <span className="text-gray-400 font-normal text-sm">(up to 3)</span></h2>
          <div className="flex gap-3 flex-wrap">
            {images.map((img, i) => (
              <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                <img src={img.preview} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">✕</button>
              </div>
            ))}
            {images.length < 3 && (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 hover:border-gold flex flex-col items-center justify-center text-gray-400 transition-colors">
                <span className="text-2xl">📷</span>
                <span className="text-xs mt-1">Add</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
          <p className="text-xs text-gray-400 mt-2">Images upload to Supabase Storage. JPG/PNG, max 5MB each.</p>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-gray-900">Product Details</h2>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name *</label>
            <input value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. Organic Turmeric Powder"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold/40 ${errors.name ? 'border-red-300' : 'border-gray-200 focus:border-gold'}`} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setField('description', e.target.value)} rows={4} placeholder="Describe your product…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/40 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category *</label>
            <select value={form.categoryId} onChange={e => setField('categoryId', e.target.value)}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-gold/40 ${errors.categoryId ? 'border-red-300' : 'border-gray-200 focus:border-gold'}`}>
              <option value="">Select a category…</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4">Pricing & Inventory</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[['Price (₹) *', 'price', 'number', '250'], ['Stock Quantity *', 'stock', 'number', '50']].map(([label, field, type, placeholder]) => (
              <div key={field}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                <input type={type} value={form[field]} onChange={e => setField(field, e.target.value)} placeholder={placeholder}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold/40 ${errors[field] ? 'border-red-300' : 'border-gray-200 focus:border-gold'}`} />
                {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
              </div>
            ))}
          </div>
          {form.price && !isNaN(form.price) && Number(form.price) > 0 && (
            <div className="mt-4 bg-gold-50 border border-gold-200 rounded-xl p-3 text-xs space-y-1">
              <div className="flex justify-between text-gray-600"><span>Selling price</span><span>{formatPrice(Number(form.price))}</span></div>
              <div className="flex justify-between text-red-500"><span>Commission (8%)</span><span>− {formatPrice(Number(form.price) * 0.08)}</span></div>
              <div className="flex justify-between font-bold text-green-700 pt-1 border-t border-gold-200"><span>You receive</span><span>{formatPrice(Number(form.price) * 0.92)}</span></div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Link href="/seller/products" className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-center hover:bg-gray-50 text-sm">Cancel</Link>
          <button type="submit" disabled={saving}
            className="flex-1 bg-gold hover:bg-gold-600 text-navy-900 font-black py-3 rounded-xl text-sm transition-colors disabled:opacity-60">
            {saving ? 'Saving…' : editId ? 'Save Changes' : 'Publish Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AddProductPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-8 animate-pulse"><div className="h-8 bg-gray-200 rounded w-48 mb-6" /><div className="h-64 bg-gray-100 rounded-2xl" /></div>}>
      <AddProductForm />
    </Suspense>
  );
}
