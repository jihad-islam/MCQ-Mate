'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, systemTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-14 h-8" />;
  }

  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative flex items-center w-14 h-8 rounded-full bg-slate-200 dark:bg-slate-700 p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      aria-label="Toggle theme"
      role="switch"
      aria-checked={isDark}
    >
      {/* Track Icons */}
      <div className="absolute inset-x-0 flex justify-between px-1.5 pointer-events-none">
        <Sun className="w-4 h-4 text-amber-500/80 dark:text-slate-500" strokeWidth={2.5} />
        <Moon className="w-4 h-4 text-slate-400 dark:text-amber-300/80" strokeWidth={2.5} />
      </div>

      {/* Sliding Thumb */}
      <div
        className={`relative z-10 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transform transition-transform duration-300 ease-in-out ${
          isDark ? 'translate-x-6' : 'translate-x-0'
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-slate-800" strokeWidth={3} />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" strokeWidth={3} />
        )}
      </div>
    </button>
  );
}
