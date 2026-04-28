'use client';

import ExamInterface from '@/components/ExamInterface';
import { ThemeToggle } from '@/components/ThemeToggle';
import Timer from '@/components/Timer';
import { fetchQuestionsByChapter, Question } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

// Main content wrapper to handle data fetching and UI state
function ExamPageContent() {
  const router = useRouter(); // For programmatic navigation (e.g., returning home on error)
  const searchParams = useSearchParams(); // To extract chapterId, mcqCount, and timeLimit from URL

  // State management for the exam data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Extract parameters from the URL
  const chapterIdStr = searchParams.get('chapterId');
  const chapterId = chapterIdStr ? parseInt(chapterIdStr) : null;
  const mcqCount = parseInt(searchParams.get('mcqCount') || '10');
  const timeLimit = parseInt(searchParams.get('timeLimit') || '30');

  useEffect(() => {
    // Check if exam was already submitted (survive reloads) ensuring state persistence
    if (typeof window !== 'undefined' && sessionStorage.getItem('currentExamResult')) {
      setIsSubmitted(true);
    }

    // Async function to fetch exam questions from the Django backend
    const loadQuestions = async () => {
      try {
        if (!chapterId) {
          setError('Chapter ID is missing');
          setLoading(false);
          return;
        }

        setLoading(true);
        const data = await fetchQuestionsByChapter(chapterId, mcqCount);
        
        // Handle varying API responses to gracefully extract the questions list
        const fetchedQuestions = (data as any)?.results ? (data as any).results : data;
        setQuestions(Array.isArray(fetchedQuestions) ? fetchedQuestions : []);
      } catch (err: any) {
        // Log errors to the UI for user visibility
        setError(err.message || 'Failed to load questions');
      } finally {
        setLoading(false); // Stop loading indicator regardless of success or failure
      }
    };

    loadQuestions();
  }, [chapterId, mcqCount]);

  // Render a responsive loading state while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-colors">
        <div className="text-center p-6 sm:p-10">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-4 border-violet-600 dark:border-violet-400 mx-auto mb-4 sm:mb-6"></div>
          <p className="text-xl sm:text-2xl text-slate-800 dark:text-slate-100 font-bold animate-pulse">Initializing MCQMate...</p>
        </div>
      </div>
    );
  }

  // Render error UI with a safety return button if API fails
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-colors p-4">
       <div className="p-6 sm:p-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300 rounded-3xl shadow-xl text-center max-w-md w-full">
         <div className="w-12 h-12 sm:w-16 sm:h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
           <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
         </div>
         <h2 className="text-xl sm:text-2xl font-black mb-2 text-slate-900 dark:text-white">Failed to Load Content</h2>
         <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 sm:mb-8 leading-relaxed">We encountered an issue while loading the exam questions. Please try again or return to the home page.</p>
         <button 
           onClick={() => router.push('/')}
           className="w-full py-3 sm:py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all shadow-[0_8px_30px_rgb(124,58,237,0.2)] focus:ring-4 focus:ring-violet-500/20"
         >
           Return to Safety
         </button>
       </div>
      </div>
    );
  }

  // The main exam view
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 transition-colors flex flex-col">
      {/* Changed max-w-4xl to max-w-3xl to perfectly align with the question card */}
      <div className="max-w-3xl mx-auto w-full flex-grow flex flex-col">
        <div className="flex justify-end mb-6 sm:mb-8 flex-shrink-0">
          <ThemeToggle />
        </div>

        {/* Timer Header - Strictly conditionally rendered to avoid rendering post-submit */}
        {!isSubmitted && questions.length > 0 && (
          <div className="mb-4 sm:mb-6 flex-shrink-0 sticky top-2 sm:top-4 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 p-3 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50">
            <Timer timeLimit={timeLimit} questions={questions} />
          </div>
        )}

        {/* Exam Interface Component manages individual questions and submission */}
        <div className="flex-grow">
          <ExamInterface questions={questions} onSubmitComplete={() => setIsSubmitted(true)} />
        </div>
      </div>
    </div>
  );
}

// NextJS 13+ best practice: wrap pages containing useSearchParams in Suspense
export default function ExamPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-colors">
          <div className="text-center p-6 sm:p-10">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-4 border-violet-600 dark:border-violet-400 mx-auto mb-4 sm:mb-6"></div>
            <p className="text-xl sm:text-2xl text-slate-800 dark:text-slate-100 font-bold animate-pulse">Loading Parameters...</p>
          </div>
        </div>
      }
    >
      <ExamPageContent />
    </Suspense>
  );
}