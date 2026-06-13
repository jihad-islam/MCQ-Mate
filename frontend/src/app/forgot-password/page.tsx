'use client';

import { requestPasswordReset } from '@/lib/api';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ForgotPasswordPage() {
  // UPDATE: Added mounted state to prevent hydration mismatch on form fields
  const [mounted, setMounted] = useState(false);
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await requestPasswordReset(email);
      setSuccessMessage(res.message || 'If an account exists, a reset link has been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // UPDATE: Wait for client-side hydration before rendering the form
  if (!mounted) return null;

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 animate-in fade-in duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Reset Password</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
            Enter your registered email and we will send you a link to reset your password.
          </p>
        </div>

        {successMessage ? (
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl text-center font-medium text-sm mb-6 animate-in fade-in">
            {successMessage}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-sm font-medium text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-shadow"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              {isLoading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link href="/login" className="inline-flex items-center text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}