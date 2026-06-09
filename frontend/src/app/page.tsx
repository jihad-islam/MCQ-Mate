'use client';

import ExamConfig from '@/components/selection/ExamConfig';
import SelectionFlow from '@/components/selection/SelectionFlow';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const [selectedChapterIds, setSelectedChapterIds] = useState<number[]>([]);
  const [availableMcqs, setAvailableMcqs] = useState<number>(0);
  const [mcqCount, setMcqCount] = useState<number>(0);
  const [timeLimit, setTimeLimit] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const handleSelectionComplete = (chapterIds: number[], mcqs: number) => {
    setSelectedChapterIds(chapterIds);
    setAvailableMcqs(mcqs);
    if (errorMsg) setErrorMsg(null); 
  };

  const handleConfigUpdate = (mcq: number, time: number) => {
    setMcqCount(mcq);
    setTimeLimit(time);
    if (errorMsg) setErrorMsg(null);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 4000);
  };

  const handleStartExam = () => {
    if (selectedChapterIds.length === 0) return showError('⚠️ Please select a Class, Subject, and at least one Chapter.');
    if (mcqCount <= 0) return showError('⚠️ Please enter the Number of Questions you want to answer.');
    if (timeLimit <= 0) return showError('⚠️ Please enter a Time Limit in minutes.');

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('currentExamResult');
      sessionStorage.removeItem('examReview');
    }

    const searchParams = new URLSearchParams({
      chapterIds: selectedChapterIds.join(','),
      mcqCount: mcqCount.toString(),
      timeLimit: timeLimit.toString(),
    });

    router.push(`/exam?${searchParams.toString()}`);
  };

  if (!mounted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-900 pt-4 pb-6 px-4 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-900 pt-4 pb-6 sm:pt-8 sm:pb-10 px-4 sm:px-6 lg:px-8 transition-colors flex flex-col items-center justify-between">
      <div className="max-w-5xl mx-auto w-full">
        
        <div className="text-center mb-8 sm:mb-10 mt-0 sm:mt-2">
          <div className="relative inline-flex items-center justify-center mb-3">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              MCQ<span className="text-violet-600 dark:text-violet-500">Mate</span>
            </h1>
            <span className="absolute left-full ml-3 top-0 sm:top-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 text-[10px] sm:text-xs font-black tracking-wider uppercase border border-violet-200 dark:border-violet-500/20 shadow-sm">
              v1.0
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-base sm:text-lg">Your MCQ practice partner.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          <div className="w-full flex flex-col h-full">
            <SelectionFlow onSelectionComplete={handleSelectionComplete} />
          </div>

          <div className="w-full flex flex-col gap-5 sm:gap-6">
            <ExamConfig onConfigUpdate={handleConfigUpdate} isDisabled={false} availableMcqs={availableMcqs} />

            {errorMsg && (
              <div className="animate-in fade-in slide-in-from-bottom-2 px-4 py-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl text-center shadow-sm">
                <p className="text-sm font-semibold">{errorMsg}</p>
              </div>
            )}

            <button
              onClick={handleStartExam}
              className="w-full bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-400 text-white font-bold py-3 sm:py-4 px-6 rounded-3xl transition-all duration-200 text-base sm:text-lg shadow-[0_8px_30px_rgb(124,58,237,0.2)] hover:shadow-[0_8px_30px_rgb(124,58,237,0.4)] active:scale-[0.98]"
            >
              Start Exam
            </button>
          </div>
        </div>
      </div>

      <footer className="mt-8 sm:mt-12 pb-2 text-center text-sm text-slate-400 dark:text-slate-500 bg-transparent opacity-80 hover:opacity-100 transition-opacity">
        Designed & Developed by{' '}
        <a href="https://jihad-portfolio-pi.vercel.app/" target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 transition-colors">
          Md. Jihad Islam
        </a>
      </footer>
    </div>
  );
}
