'use client';

import { Rocket } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-8 h-8" strokeWidth={2} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Unlock Premium</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            You&apos;ve reached a premium chapter! Upgrade to unlock all chapters, unlimited exams, and detailed analytics.
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push('/checkout')}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm active:scale-95"
          >
            Upgrade to Premium
          </button>
          <button
            onClick={onClose}
            className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold py-3.5 px-4 rounded-xl transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
