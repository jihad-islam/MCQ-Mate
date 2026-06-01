'use client';

import { ExamHistoryItem, ExamHistoryStats, fetchUserHistory } from '@/lib/api';
import { Calendar, CheckCircle, Target, Trophy, XCircle } from 'lucide-react';
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

  if (loading) return <div className="py-10 text-center font-bold text-slate-500 animate-pulse">Loading exam history...</div>;

  return (
    <div className="space-y-6">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="p-3 bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 rounded-xl">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Avg. Score</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.avg_score ? Math.round(stats.avg_score) : 0}%</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Total Exams</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.total_exams || 0}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Total Solved</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.total_questions || 0} MCQs</p>
          </div>
        </div>
      </div>

      {/* History List */}
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Recent Exams</h3>
      {history.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl text-center border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 font-medium">You haven't taken any exams yet. Start practicing!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {history.map((exam) => (
            <div key={exam.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(exam.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center gap-4 text-sm font-semibold">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><CheckCircle className="w-4 h-4" /> {exam.correct_answers} Correct</span>
                  <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400"><XCircle className="w-4 h-4" /> {exam.wrong_answers} Wrong</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Score</p>
                  <p className={`text-xl font-black ${exam.score >= 80 ? 'text-amber-500' : exam.score >= 50 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {exam.score}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}