'use client';

import { LogOut, Menu, ShieldCheck, User, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Auth status চেক করার ফাংশন
    const checkAuthStatus = () => {
      const token = localStorage.getItem('access_token');
      setIsLoggedIn(!!token);
    };

    // প্রথমবার রেন্ডার হওয়ার সময় চেক করবে
    checkAuthStatus();

    // আমাদের তৈরি করা কাস্টম 'auth-change' ইভেন্টটি লিসেন করবে
    window.addEventListener('auth-change', checkAuthStatus);
    
    // পেজ চেঞ্জ হলে মোবাইল মেনু বন্ধ করে দেবে
    setIsMobileMenuOpen(false); 

    // ক্লিনআপ ফাংশন
    return () => {
      window.removeEventListener('auth-change', checkAuthStatus);
    };
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    setIsLoggedIn(false);
    
    // লগ-আউট হওয়ার পরও গ্লোবাল ইভেন্ট ফায়ার করবে
    window.dispatchEvent(new Event('auth-change'));
    router.push('/login');
  };

  // Exam interface-এ Navbar দেখানো হবে না
  if (pathname === '/exam') return null;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              MCQ<span className="text-violet-600 dark:text-violet-500">Mate</span>
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-6">
            <ThemeToggle />
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>

            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  <User className="w-4 h-4" strokeWidth={2.5} />
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10"
                >
                  <LogOut className="w-4 h-4" strokeWidth={2.5} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link 
                  href="/login" 
                  className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href="/checkout" 
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  <ShieldCheck className="w-4 h-4" strokeWidth={2.5} />
                  Get Full Access
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 sm:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="sm:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl animate-in slide-in-from-top-2">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {isLoggedIn ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <User className="w-5 h-5" />
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="block px-4 py-3 rounded-xl text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href="/checkout" 
                  className="flex items-center justify-center gap-2 mt-4 bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-3 rounded-xl transition-colors"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Get Full Access
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}