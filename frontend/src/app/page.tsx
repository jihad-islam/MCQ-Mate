'use client';

import ExamConfig from '@/components/ExamConfig';
import SelectionFlow from '@/components/SelectionFlow';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter(); // Next.js hook for client-side navigation
  const [mounted, setMounted] = useState(false); // Prevents hydration mismatch between server and client
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null); // Stores the user's selected chapter
  const [availableMcqs, setAvailableMcqs] = useState<number | null>(null); // Stores the total MCQs available in the selected chapter
  
  const [mcqCount, setMcqCount] = useState<number>(0); // Stores the number of questions requested by the user
  const [timeLimit, setTimeLimit] = useState<number>(0); // Stores the exam time limit in minutes

  // Ensure component only begins rendering dynamic UI after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Callback to handle when the user finishes selecting Class -> Subject -> Chapter
  const handleSelectionComplete = (chapterId: number | null, mcqs: number | null) => {
    setSelectedChapterId(chapterId);
    setAvailableMcqs(mcqs);
  };

  // Callback to sync exam settings (questions count and time limit) from the config component
  const handleConfigUpdate = (mcq: number, time: number) => {
    setMcqCount(mcq);
    setTimeLimit(time);
  };

  // Validates inputs and routes the user to the exam page via URL query parameters
  const handleStartExam = () => {
    // Basic validation before starting the exam
    if (selectedChapterId === null) {
      alert('⚠️ Please select a Class, Subject, and Chapter to start the exam.');
      return;
    }

    if (mcqCount <= 0) {
      alert('⚠️ Please enter the Number of Questions you want to answer.');
      return;
    }
    if (timeLimit <= 0) {
      alert('⚠️ Please enter a Time Limit in minutes.');
      return;
    }

    // Construct URL search params explicitly to pass state to the exam page cleanly
    const searchParams = new URLSearchParams({
      chapterId: selectedChapterId.toString(),
      mcqCount: mcqCount.toString(),
      timeLimit: timeLimit.toString(),
    });

    // Navigate to the dynamic exam route passing all configurations
    router.push(`/exam?${searchParams.toString()}`);
  };

  if (!mounted) {
    // Show a pulsing skeleton loader while the component mounts on the client
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-6 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-start mb-6 sm:mb-8">
            <div />
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          </div>
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center justify-center mb-4">
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                MCQ<span className="text-violet-600 dark:text-violet-500">Mate</span>
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-base sm:text-lg">Your MCQ practice partner.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 animate-pulse h-80 sm:h-96 border border-slate-100 dark:border-slate-800" />
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 animate-pulse h-80 sm:h-96 border border-slate-100 dark:border-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  // Main UI output once fully mounted
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-6 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-grow">
        {/* Header containing theme toggler */}
        <div className="flex justify-between items-start mb-8 sm:mb-12">
          <div />
          <ThemeToggle />
        </div>
        
        {/* Brand/Hero Section */}
        <div className="text-center mb-10 sm:mb-16">
          {/* Using relative container to center the text perfectly, while floating the badge outside */}
          <div className="relative inline-flex items-center justify-center mb-3">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              MCQ<span className="text-violet-600 dark:text-violet-500">Mate</span>
            </h1>
            {/* Absolute positioning keeps the badge from shifting the main title */}
            <span className="absolute left-full ml-3 top-0 sm:top-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 text-[10px] sm:text-xs font-black tracking-wider uppercase border border-violet-200 dark:border-violet-500/20 shadow-sm">
              v1.0
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-base sm:text-lg">Your MCQ practice partner.</p>
        </div>

        {/* Configuration Columns via Grid: collapses to 1 column on mobile, expands to 2 on lg screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          
          {/* Left Column: Academic Selection */}
          <div className="w-full flex flex-col h-full">
            <SelectionFlow onSelectionComplete={handleSelectionComplete} />
          </div>

          {/* Right Column: Timer Configuration and Start Button */}
          <div className="w-full flex flex-col gap-5 sm:gap-6">
            <ExamConfig
              onConfigUpdate={handleConfigUpdate}
              isDisabled={false} 
              availableMcqs={availableMcqs}
            />

            <button
              onClick={handleStartExam}
              className="w-full bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-400 text-white font-bold py-3 sm:py-4 px-6 rounded-3xl transition-all duration-200 text-base sm:text-lg shadow-[0_8px_30px_rgb(124,58,237,0.2)] hover:shadow-[0_8px_30px_rgb(124,58,237,0.4)] active:scale-[0.98]"
            >
              Start Exam
            </button>

            {selectedChapterId && (
              <div className="px-4 py-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-2xl text-center transition-all animate-in fade-in slide-in-from-bottom-2">
                <p className="text-sm font-bold flex items-center justify-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                  Chapter selected & ready
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}