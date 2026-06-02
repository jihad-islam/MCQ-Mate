'use client';

import { ExamHistoryItem, ExamHistoryStats, fetchUserHistory } from '@/lib/api';
import { Calendar, CheckCircle, History, Target, Trophy, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ExamHistoryTab() {
  const [history, setHistory] = useState<ExamHistoryItem[]>([]);
  const [stats, setStats] = useState<ExamHistoryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const data = await fetchUserHistory(token);
          setHistory(data.history);
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to load history", error);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex flex-col space-y-6 sm:space-y-8 animate-pulse">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="bg-slate-200 dark:bg-slate-800 h-24 rounded-2xl"></div>)}
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 flex-grow">
          <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-700/50">
            <div className="w-11 h-11 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
            <div>
              <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded-md mb-2"></div>
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="bg-slate-100 dark:bg-slate-900/50 h-20 rounded-2xl"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center transition-shadow hover:shadow-md">
          <div className="p-2.5 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl mb-2">
            <Trophy className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Avg. Score</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none">
            {stats?.avg_score ? Math.round(stats.avg_score) : 0}%
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center transition-shadow hover:shadow-md">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl mb-2">
            <Target className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Exams</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none">
            {stats?.total_exams || 0}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center transition-shadow hover:shadow-md">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl mb-2">
            <CheckCircle className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Solved</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none">
            {stats?.total_questions || 0}
          </p>
        </div>
      </div>

      {/* Main History Card - Removed transition-all */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex-grow flex flex-col transition-shadow hover:shadow-md">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-violet-100 dark:bg-violet-500/20 rounded-2xl">
              <History className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Exam History</h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Your complete past exam records</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow flex flex-col">
          {history.length === 0 ? (
            <div className="h-full py-12 flex flex-col items-center justify-center text-center flex-grow">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                <History className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No exams taken yet</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-[250px]">
                Your exam history will appear here once you start practicing.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 mb-2 overflow-y-auto max-h-[600px] custom-scrollbar pr-2">
              {history.map((exam) => {
                const isExcellent = exam.score >= 80;
                const isGood = exam.score >= 50 && exam.score < 80;
                const badgeClass = isExcellent 
                  ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30' 
                  : isGood 
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                    : 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30';

                return (
                  <div key={exam.id} className="bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4 transition-colors hover:border-violet-200 dark:hover:border-violet-500/30 group">
                    
                    <div className="w-full">
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(exam.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(exam.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-transparent shadow-sm">
                          <CheckCircle className="w-3.5 h-3.5" strokeWidth={2.5} /> {exam.correct_answers} Correct
                        </span>
                        <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 bg-white dark:bg-rose-500/10 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-transparent shadow-sm">
                          <XCircle className="w-3.5 h-3.5" strokeWidth={2.5} /> {exam.wrong_answers} Wrong
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 flex items-center justify-between 2xl:justify-center border-t 2xl:border-t-0 2xl:border-l border-slate-200 dark:border-slate-700 pt-3 2xl:pt-0 2xl:pl-5 mt-1 2xl:mt-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 2xl:hidden">Final Score</p>
                      <div className={`px-3 py-1.5 rounded-xl border-2 font-black text-lg tracking-tight shadow-sm transition-transform group-hover:scale-105 ${badgeClass}`}>
                        {exam.score}%
                      </div>
                    </div>
                    
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}