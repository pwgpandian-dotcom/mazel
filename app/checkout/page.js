'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/mockData';

function generateOrderId() {
  return 'ORD-' + Date.now().toString().slice(-8);
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [step, setStep] = useState('form'); // 'form' | 'success'
  const [payment, setPayment] = useState('cod');
  const [orderId, setOrderId] = useState('');
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ name: '', phone: '', address: '', pincode: '', city: '' });

  const delivery = total >= 500 ? 0 : 49;
  const grand = total + delivery;

  function setField(k, v) {
    setForm(prev => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit mobile number';
    if (!form.address.trim()) e.address = 'Delivery address is required';
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Enter a valid 6-digit pincode';
    if (!form.city.trim()) e.city = 'City is required';
    return e;
  }

  function placeOrder() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    const id = generateOrderId();
    setOrderId(id);
    clearCart();
    setStep('success');
  }

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-gray-600 font-medium mb-4">Your cart is empty</p>
          <Link href="/" className="bg-gold text-navy-900 font-bold px-6 py-3 rounded-xl inline-block">Browse Products</Link>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-500 mb-4">Thank you for shopping on Mazel ✦</p>

          <div className="bg-gold-50 border border-gold-200 rounded-2xl p-4 mb-6">
            <p className="text-xs text-gray-400 mb-1">Order ID</p>
            <p className="text-lg font-black text-navy-700">{orderId}</p>
          </div>

          <div className="text-sm text-left space-y-2 mb-6 text-gray-600 bg-gray-50 rounded-xl p-4">
            <p className="font-semibold text-gray-700 mb-2">What happens next?</p>
            {payment === 'cod'
              ? <><p>• Seller confirms your order within 2 hours</p><p>• Delivery in 3–5 business days</p><p>• Pay {formatPrice(grand)} in cash on delivery</p></>
              : <><p>• Payment confirmed ✓</p><p>• Seller ships within 24 hours</p><p>• Delivery in 3–5 business days</p></>
            }
          </div>

          <div className="flex gap-3">
            <Link href="/orders" className="flex-1 bg-navy-700 hover:bg-navy-800 text-white font-semibold py-3 rounded-xl text-sm text-center transition-colors">
              Track Orders
            </Link>
            <Link href="/" className="flex-1 bg-gold hover:bg-gold-600 text-navy-900 font-bold py-3 rounded-xl text-sm text-center transition-colors">
              Shop More
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const Input = ({ label, field, type = 'text', placeholder }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[field]}
        onChange={e => setField(field, e.target.value)}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-300 outline-none transition-colors focus:ring-2 focus:ring-gold/40 ${
          errors[field] ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gold'
        }`}
      />
      {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Shipping */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-navy-700 text-white rounded-full text-xs flex items-center justify-center font-bold">1</span>
              Delivery Address
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Full Name" field="name" placeholder="Ananya Krishnan" />
              <Input label="Mobile Number" field="phone" type="tel" placeholder="9876543210" />
              <div className="sm:col-span-2">
                <Input label="Full Address" field="address" placeholder="House no, Street, Area, Landmark" />
              </div>
              <Input label="Pincode" field="pincode" placeholder="641012" />
              <Input label="City" field="city" placeholder="Coimbatore" />
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-navy-700 text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
              Payment Method
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { id: 'cod', icon: '💵', title: 'Cash on Delivery', sub: 'Pay when your order arrives' },
                { id: 'online', icon: '💳', title: 'Pay Online', sub: 'UPI / Card / Net Banking (Razorpay)' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setPayment(opt.id)}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    payment === opt.id
                      ? 'border-gold bg-gold-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <div>
                    <p className={`font-semibold text-sm ${payment === opt.id ? 'text-navy-700' : 'text-gray-700'}`}>{opt.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.sub}</p>
                    {opt.id === 'online' && <p className="text-xs text-amber-600 font-medium mt-1">⚠ Test mode — no real payment</p>}
                  </div>
                  {payment === opt.id && <span className="ml-auto text-gold font-bold">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-32">
            <h2 className="font-bold text-gray-900 mb-4">
              <span className="w-6 h-6 bg-navy-700 text-white rounded-full text-xs inline-flex items-center justify-center font-bold mr-2">3</span>
              Review & Pay
            </h2>

            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-2">
                  <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                  </div>
                  <span className="text-xs font-bold text-gray-700">{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery</span>
                <span className={delivery === 0 ? 'text-green-600 font-medium' : ''}>{delivery === 0 ? 'FREE' : formatPrice(delivery)}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-black text-base">
              <span>Total</span>
              <span className="text-gold-600">{formatPrice(grand)}</span>
            </div>

            <button
              onClick={placeOrder}
              className="w-full mt-5 bg-gold hover:bg-gold-600 text-navy-900 font-black py-3.5 rounded-xl transition-colors shadow-lg shadow-gold/20"
            >
              {payment === 'cod' ? '🏠 Place Order (COD)' : '💳 Pay ' + formatPrice(grand)}
            </button>

            <p className="text-xs text-center text-gray-400 mt-3">By placing your order, you agree to Mazel's terms of service</p>
          </div>
        </div>
      </div>
    </div>
  );
}
