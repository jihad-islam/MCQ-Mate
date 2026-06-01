'use client';

import { CheckCircle2, Hash, Lock, Mail, Phone, ShieldCheck, Sparkles, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CheckoutPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: '',
    email: '',
    password: '',
    bkash_number: '',
    trx_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const API_BASE_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL}/api`;

      const response = await fetch(`${API_BASE_URL}/users/checkout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Registration successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        const errorMessages = Object.values(data).flat().join(' ');
        setError(errorMessages || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const inputWrapperClasses = "relative group flex items-center";
  const inputIconClasses = "absolute left-4 text-slate-400 group-focus-within:text-violet-500 transition-colors w-5 h-5";
  const inputClasses = "w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:border-violet-500 dark:focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all placeholder:font-normal placeholder:text-slate-400";

  return (
    <div className="min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Side: Benefits & Trust Building */}
        <div className="lg:col-span-5 flex flex-col gap-8 lg:sticky lg:top-24">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 text-sm font-bold mb-4">
              <Sparkles className="w-4 h-4" />
              Premium Access
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4 tracking-tight">
              Unlock your full <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">potential.</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
              Join thousands of students and get unlimited access to all chapters, exams, and detailed analytics.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {[
              "Access to all SSC chapters & subjects",
              "Unlimited MCQ exam generation",
              "Detailed result analytics & tracking",
              "Save & review your mistakes",
              "Priority support for premium members"
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" strokeWidth={2.5} />
                <span className="text-slate-700 dark:text-slate-300 font-semibold">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Payment & Form */}
        <div className="lg:col-span-7 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50">
          
          {/* Payment Instructions */}
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border-2 border-violet-100 dark:border-violet-500/20 rounded-2xl p-5 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              <h3 className="text-lg font-bold text-violet-900 dark:text-violet-100">Secure bKash Payment</h3>
            </div>
            <p className="text-sm text-violet-700 dark:text-violet-300 font-medium mb-3">
              Send exactly <span className="font-bold text-lg">৳500</span> to the number below.
            </p>
            <div className="bg-white dark:bg-slate-900 py-3 px-4 rounded-xl border border-violet-100 dark:border-violet-500/30 text-center mb-3">
              <span className="text-2xl font-black tracking-widest text-slate-800 dark:text-slate-100">017XX-XXXXXX</span>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Personal Number (Send Money)</p>
            </div>
          </div>

          {message && (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 border border-emerald-200 dark:border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
              {message}
            </div>
          )}

          {error && (
            <div className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 border border-rose-200 dark:border-rose-500/20">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2">Full Name</label>
                <div className={inputWrapperClasses}>
                  <User className={inputIconClasses} />
                  <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} className={inputClasses} placeholder="Rakib Hasan" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2">Email Address</label>
                <div className={inputWrapperClasses}>
                  <Mail className={inputIconClasses} />
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className={inputClasses} placeholder="rakib@example.com" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2">Password</label>
              <div className={inputWrapperClasses}>
                <Lock className={inputIconClasses} />
                <input type="password" name="password" required value={formData.password} onChange={handleChange} className={inputClasses} placeholder="••••••••" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2">bKash Number</label>
                <div className={inputWrapperClasses}>
                  <Phone className={inputIconClasses} />
                  <input type="text" name="bkash_number" required value={formData.bkash_number} onChange={handleChange} className={inputClasses} placeholder="01XXXXXXXXX" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2">Transaction ID</label>
                <div className={inputWrapperClasses}>
                  <Hash className={inputIconClasses} />
                  <input type="text" name="trx_id" required value={formData.trx_id} onChange={handleChange} className={inputClasses} placeholder="8A7B6C5D4E" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-400 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg active:scale-[0.98] mt-4 flex items-center justify-center gap-2 ${
                loading ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              {loading ? 'Processing...' : 'Complete Purchase'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}