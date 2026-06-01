import { Question } from '@/lib/api';
import { Clock } from 'lucide-react';

interface MobileTimerProps {
  formattedTime: string;
  isLowTime: boolean;
  questions: Question[];
}

export default function MobileTimer({ formattedTime, isLowTime, questions }: MobileTimerProps) {
  return (
    <div className="md:hidden fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/80 shadow-lg transition-all opacity-90 hover:opacity-100">
      <Clock className={`w-4 h-4 ${isLowTime ? 'text-rose-500 animate-pulse' : 'text-violet-500'}`} strokeWidth={2.5} />
      
      <span className={`font-mono text-sm font-black ${isLowTime ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
        {formattedTime}
      </span>
      
      {/* Divider line */}
      <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-0.5"></div>
      
      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        Q: {questions?.length || 0}
      </span>
    </div>
  );
}