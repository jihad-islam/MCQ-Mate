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
      <div className="space-y-6 sm:space-y-8 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="bg-slate-200 dark:bg-slate-800 h-28 rounded-3xl"></div>)}
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-700/50">
            <div className="w-11 h-11 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            <div>
              <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded-md mb-2"></div>
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => <div key={i} className="bg-slate-100 dark:bg-slate-900/50 h-24 rounded-2xl"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-5 transition-shadow hover:shadow-md">
          <div className="p-4 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-2xl">
            <Trophy className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Avg. Score</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{stats?.avg_score ? Math.round(stats.avg_score) : 0}%</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-5 transition-shadow hover:shadow-md">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <Target className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Exams</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{stats?.total_exams || 0}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-5 transition-shadow hover:shadow-md">
          <div className="p-4 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
            <CheckCircle className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Solved</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{stats?.total_questions || 0}</p>
          </div>
        </div>
      </div>

      {/* Main History Card - Header perfectly aligned with Bookmarks/Overview */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
        
        {/* PERFECTLY UNIFORM HEADER */}
        <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
              <History className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Recent Activity</h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Your past exam records</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {history.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
              <History className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No exams taken yet</h4>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm">Your exam history will appear here once you start practicing. Let's solve some MCQs!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {history.map((exam) => {
              const isExcellent = exam.score >= 80;
              const isGood = exam.score >= 50 && exam.score < 80;
              const badgeClass = isExcellent 
                ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30' 
                : isGood 
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                  : 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30';

              return (
                <div key={exam.id} className="bg-slate-50 dark:bg-slate-900/50 p-5 sm:p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-colors hover:border-violet-200 dark:hover:border-violet-500/30 group">
                  
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                      <Calendar className="w-4 h-4" />
                      {new Date(exam.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(exam.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm font-bold">
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-transparent shadow-sm">
                        <CheckCircle className="w-4 h-4" strokeWidth={2.5} /> {exam.correct_answers} Correct
                      </span>
                      <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 bg-white dark:bg-rose-500/10 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-transparent shadow-sm">
                        <XCircle className="w-4 h-4" strokeWidth={2.5} /> {exam.wrong_answers} Wrong
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700 pt-4 sm:pt-0 sm:pl-6 mt-2 sm:mt-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:mb-2">Final Score</p>
                    <div className={`px-4 py-2 rounded-xl border-2 font-black text-xl tracking-tight shadow-sm transition-transform group-hover:scale-105 ${badgeClass}`}>
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
  );
}