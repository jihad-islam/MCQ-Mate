'use client';

import { Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const API_BASE_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL}/api`;

      const response = await fetch(`${API_BASE_URL}/users/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // BUG FIX: Token-এর নাম backend-এর সাথে ম্যাচ করে access_token রাখা হয়েছে
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Global Auth Event Dispatch করা হচ্ছে যাতে Navbar সাথে সাথে আপডেট হয়
        window.dispatchEvent(new Event('auth-change'));
        
        // Dashboard-এ রিডাইরেক্ট
        router.push('/dashboard');
      } else {
        setError(data.error || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const inputWrapperClasses = "relative group flex items-center";
  const inputIconClasses = "absolute left-4 text-slate-400 group-focus-within:text-violet-500 transition-colors w-5 h-5";
  const inputClasses = "w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:border-violet-500 dark:focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all placeholder:font-normal placeholder:text-slate-400";

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-10 px-4 relative overflow-hidden">
      
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 dark:bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Please log in to your account to continue.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-xl mb-6 text-sm font-bold text-center border border-rose-200 dark:border-rose-500/20 flex items-center justify-center gap-2 animate-in fade-in zoom-in-95 duration-200">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2">Email Address</label>
            <div className={inputWrapperClasses}>
              <Mail className={inputIconClasses} strokeWidth={2.5} />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={inputClasses}
                placeholder="rakib@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2">Password</label>
            <div className={inputWrapperClasses}>
              <Lock className={inputIconClasses} strokeWidth={2.5} />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className={inputClasses}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-400 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgb(124,58,237,0.39)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.23)] active:scale-[0.98] mt-2 ${
              loading ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/60 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
          Don't have an account?{' '}
          <Link href="/checkout" className="text-violet-600 dark:text-violet-400 font-bold hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
            Upgrade to Premium
          </Link>
        </div>
      </div>
    </div>
  );
}