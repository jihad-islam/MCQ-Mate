'use client';

import { confirmPasswordReset } from '@/lib/api';
import { ArrowRight, KeyRound, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!uid || !token) {
    return (
      <div className="text-center">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invalid Reset Link</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">This link is missing valid secure tokens.</p>
        <Link href="/forgot-password" className="text-violet-600 font-bold hover:underline">Request a new link</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await confirmPasswordReset({ uid, token, new_password: password });
      setIsSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link might be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold">✓</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Password Reset Successful!</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">You will be redirected to login shortly...</p>
        <Link href="/login" className="inline-flex items-center text-white bg-violet-600 hover:bg-violet-700 px-6 py-2.5 rounded-xl font-bold transition-colors">
          Go to Login <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-300">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center mx-auto mb-3">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Create New Password</h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          Almost done! Enter your new password below.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-sm font-medium text-center">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">New Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-shadow"
          placeholder="••••••••"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Confirm Password</label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-shadow"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !password || !confirmPassword}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 mt-2"
      >
        {isLoading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );
}

// Next.js requires useSearchParams to be wrapped in a Suspense boundary
export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
        <Suspense fallback={<div className="text-center py-10 animate-pulse text-slate-400">Loading secure environment...</div>}>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}