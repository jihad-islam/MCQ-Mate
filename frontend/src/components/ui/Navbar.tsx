'use client';

import { Home, LogOut, Menu, ShieldCheck, User, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string>('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        setIsLoggedIn(true);
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const userObj = JSON.parse(userStr);
            const firstName = userObj.name?.split(' ')[0] || 'Dashboard';
            setUserName(firstName);
          }
        } catch (e) {
          setUserName('Dashboard');
        }
      } else {
        setIsLoggedIn(false);
        setUserName('Dashboard');
      }
    };

    checkAuthStatus();
    window.addEventListener('auth-change', checkAuthStatus);
    setIsMobileMenuOpen(false); 

    return () => {
      window.removeEventListener('auth-change', checkAuthStatus);
    };
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    setIsLoggedIn(false);
    window.dispatchEvent(new Event('auth-change'));
    router.push('/login');
  };

  if (pathname === '/exam') return null;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left Side: Home, Theme Toggle & User Greeting */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              href="/" 
              aria-label="Go to Home"
              className="group flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-violet-500/20 hover:text-violet-600 dark:hover:text-violet-400 rounded-xl transition-all duration-300"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
            </Link>
            
            {/* Theme Toggle moved to the left */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* Mild & Modern User Greeting Effect */}
            {isLoggedIn && userName !== 'Dashboard' && (
              <>
                <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700 rounded-full mx-1"></div>
                <div className="hidden sm:flex items-center gap-1.5 px-2 animate-in fade-in slide-in-from-left-2 duration-500">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Hello,</span>
                  <span className="text-sm font-bold bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    {userName}
                  </span>
                  <span className="text-sm leading-none ml-0.5">👋</span>
                </div>
              </>
            )}
          </div>

          {/* Right Side: Desktop Menu */}
          <div className="hidden sm:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <User className="w-4 h-4" strokeWidth={2.5} />
                  <span>Dashboard</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors px-4 py-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10"
                >
                  <LogOut className="w-4 h-4" strokeWidth={2.5} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  href="/login" 
                  className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Login
                </Link>
                <Link 
                  href="/checkout" 
                  className="group flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-[0_4px_14px_0_rgb(124,58,237,0.3)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                  Get Full Access
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-3 sm:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors active:scale-95"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" strokeWidth={2.5} /> : <Menu className="w-5 h-5" strokeWidth={2.5} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="sm:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-top-2">
          <div className="px-4 pt-4 pb-6 space-y-3">
            {isLoggedIn && userName !== 'Dashboard' && (
              <div className="px-4 py-2 mb-2 text-center">
                 <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Welcome back, </span>
                 <span className="text-sm font-bold text-violet-600 dark:text-violet-400">{userName}</span>
              </div>
            )}
            {isLoggedIn ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="flex items-center justify-center gap-3 w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-3 w-full px-4 py-3.5 rounded-xl text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-100 dark:hover:border-rose-500/20"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="flex items-center justify-center w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href="/checkout" 
                  className="flex items-center justify-center gap-2 w-full bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-3.5 rounded-xl transition-colors shadow-md"
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