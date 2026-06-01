import { Question } from '@/lib/api';

interface DesktopTimerProps {
  formattedTime: string;
  isLowTime: boolean;
  questions: Question[];
}

export default function DesktopTimer({ formattedTime, isLowTime, questions }: DesktopTimerProps) {
  return (
    <div className="hidden md:flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 justify-between items-center shadow-sm transition-colors w-full mb-2 animate-in fade-in duration-200">
      <div className="flex items-center gap-6 flex-1">
        <div className="text-left">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Time Remaining</p>
          <p className={`text-3xl font-black font-mono tracking-tight ${isLowTime ? 'text-rose-600 dark:text-rose-400' : 'text-violet-600 dark:text-violet-500'}`}>
            {formattedTime}
          </p>
        </div>
        {isLowTime && (
          <div className="text-rose-600 dark:text-rose-400 font-bold text-sm bg-rose-50 dark:bg-rose-500/10 px-3 py-1 rounded-xl animate-pulse">
            ⚠️ Time running out!
          </div>
        )}
      </div>

      <div className="text-right">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Total Questions</p>
        <p className="text-2xl font-black text-slate-800 dark:text-slate-200">{questions?.length || 0}</p>
      </div>
    </div>
  );
}