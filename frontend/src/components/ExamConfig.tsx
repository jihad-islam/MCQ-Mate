'use client';

import { useEffect, useState } from 'react';

interface ExamConfigProps {
  onConfigUpdate: (mcqCount: number, timeLimit: number) => void;
  isDisabled: boolean;
}

export default function ExamConfig({ onConfigUpdate, isDisabled }: ExamConfigProps) {
  const [mounted, setMounted] = useState(false);
  const [mcqCount, setMcqCount] = useState<number | ''>(''); // Starts empty
  const [timeLimit, setTimeLimit] = useState<number | ''>(''); // Starts empty

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMcqChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setMcqCount('');
      onConfigUpdate(0, typeof timeLimit === 'number' ? timeLimit : 0);
      return;
    }
    const numValue = Math.max(1, parseInt(value) || 0);
    setMcqCount(numValue);
    onConfigUpdate(numValue, typeof timeLimit === 'number' ? timeLimit : 0);
  };

  const handleTimeLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setTimeLimit('');
      onConfigUpdate(typeof mcqCount === 'number' ? mcqCount : 0, 0);
      return;
    }
    const numValue = Math.max(1, parseInt(value) || 0);
    setTimeLimit(numValue);
    onConfigUpdate(typeof mcqCount === 'number' ? mcqCount : 0, numValue);
  };

  if (!mounted) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 w-full shadow-sm transition-colors flex-grow">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-50 mb-8">Exam Settings</h2>
        <div className="space-y-6">
          <div className="h-14 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse"></div>
          <div className="h-14 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  const inputClasses = "appearance-none w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-slate-900 dark:text-slate-50 font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 w-full shadow-sm transition-colors flex-grow flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Configure Exam</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Adjust your test parameters</p>
      </div>

      <div className="space-y-6 flex-grow">
        {/* Number of MCQs */}
        <div>
          <label className="block text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2">
            Number of Questions
          </label>
          <input
            type="number"
            min="1"
            placeholder="e.g. 10"
            value={mcqCount}
            onChange={handleMcqChange}
            disabled={isDisabled}
            className={inputClasses}
          />
        </div>

        {/* Exam Time */}
        <div>
          <label className="block text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2">
            Time Limit (Minutes)
          </label>
          <input
            type="number"
            min="1"
            placeholder="e.g. 30"
            value={timeLimit}
            onChange={handleTimeLimitChange}
            disabled={isDisabled}
            className={inputClasses}
          />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Exam Summary</span>
          <span className="text-sm font-black text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-3 py-1 rounded-lg">
            {mcqCount || '?'} Qs • {timeLimit || '?'} Min
          </span>
        </div>
      </div>
    </div>
  );
}