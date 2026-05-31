'use client';

import { Question } from '@/lib/api';
import { useEffect, useState } from 'react';

interface TimerProps {
  timeLimit: number; // in minutes
  questions: Question[];
}

export default function Timer({ timeLimit, questions }: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(timeLimit * 60); // convert to seconds
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    if (timeLimit <= 0) return;

    // Set up a flag in localStorage to signal exam submission
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsTimeUp(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLimit]);

  useEffect(() => {
    if (isTimeUp && timeLimit > 0 && timeRemaining <= 0) {
      // Trigger auto-submit by dispatching a custom event
      window.dispatchEvent(new CustomEvent('timeUp'));
    }
  }, [isTimeUp, timeLimit, timeRemaining]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isLowTime = timeRemaining < 60; // Less than 1 minute

  return (
    <div className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 p-5 flex justify-between items-center shadow-sm transition-colors">
      <div className="flex items-center gap-6 flex-1">
        <div className="text-center">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Time Remaining</p>
          <p className={`text-3xl font-black font-mono ${isLowTime ? 'text-rose-600 dark:text-rose-400' : 'text-violet-600 dark:text-violet-400'}`}>
            {formattedTime}
          </p>
        </div>
        {isLowTime && <div className="text-rose-600 dark:text-rose-400 font-bold text-sm animate-pulse">⚠️ Time running out!</div>}
      </div>

      <div className="text-right">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Questions</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{questions.length}</p>
      </div>
    </div>
  );
}


