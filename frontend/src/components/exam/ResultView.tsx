'use client';

import { ExamResult, Question } from '@/lib/api';
import { AlertCircle, CheckCircle, ChevronRight, Home, Lock, RotateCcw, Target, Trophy, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PremiumModal from '../ui/PremiumModal';

interface ResultViewProps {
  results: ExamResult;
  questions: Question[];
  userAnswers: Record<number, number>;
}

export default function ResultView({ results, questions, userAnswers }: ResultViewProps) {
  const router = useRouter();
  const isOutstanding = results.score >= 80;
  const isGood = results.score >= 60 && results.score < 80;
  
  const answeredCount = Object.keys(userAnswers).length;
  const skippedCount = results.total_questions - answeredCount;

  // Premium Access Logic
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    const checkPremiumStatus = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const isActive = user?.subscription_status === 'active' || user?.subscription?.status === 'active';
          setIsPremium(isActive);
        } else {
          setIsPremium(false);
        }
      } catch (e) {
        setIsPremium(false);
      }
    };

    checkPremiumStatus();
    window.addEventListener('auth-change', checkPremiumStatus);
    return () => window.removeEventListener('auth-change', checkPremiumStatus);
  }, []);

  const handleReviewClick = () => {
    if (!isPremium) {
      setShowPremiumModal(true);
      return;
    }
    sessionStorage.setItem('examReview', JSON.stringify({ breakdown: results.breakdown, questions, userAnswers }));
    router.push('/review');
  };

  return (
    <>
      <div className="max-w-4xl mx-auto mt-4 mb-10">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Background Glow Effects */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-violet-500/10 dark:bg-violet-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            {/* Header Section */}
            <div className="flex flex-col items-center text-center mb-10">
              <div className={`p-4 rounded-2xl mb-5 ${isOutstanding ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' : isGood ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                <Trophy className="w-12 h-12" strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                {isOutstanding ? "Outstanding Performance! 🏆" : isGood ? "Good Job! Keep it up! 🎯" : "Keep Practicing! 💪"}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Your exam evaluation is complete. Here is your performance breakdown.</p>
            </div>

            {/* Core Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
              
              {/* Left: Main Score Card */}
              <div className="md:col-span-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 dark:from-violet-500/10 dark:to-indigo-500/10 pointer-events-none group-hover:scale-105 transition-transform duration-500"></div>
                
                <p className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-4 relative z-10">Total Accuracy</p>
                
                <div className="relative w-48 h-48 flex items-center justify-center z-10">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle className="text-slate-200 dark:text-slate-700 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                    <circle 
                      className="text-violet-600 dark:text-violet-500 stroke-current drop-shadow-md transition-all duration-1000 ease-out" 
                      strokeWidth="8" 
                      strokeLinecap="round" 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="transparent" 
                      strokeDasharray="251.2" 
                      strokeDashoffset={251.2 - (251.2 * results.score) / 100}
                    ></circle>
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-slate-900 dark:text-white">{results.score}%</span>
                  </div>
                </div>
              </div>

              {/* Right: Stats Grid */}
              <div className="md:col-span-7 grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                      <CheckCircle className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{results.correct_answers}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Correct Answers</p>
                </div>

                <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl">
                      <XCircle className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{results.wrong_answers}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Wrong Answers</p>
                </div>

                <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
                      <AlertCircle className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{skippedCount}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Skipped</p>
                </div>

                <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                      <Target className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{results.total_questions}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Questions</p>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-2 border-t border-slate-100 dark:border-slate-800/50 pt-8">
              <button
                onClick={handleReviewClick}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-3.5 px-8 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                {!isPremium && <Lock className="w-4 h-4 mr-1" strokeWidth={2.5} />}
                Review Explanations
                <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
              </button>

              <button
                onClick={() => {
                  sessionStorage.removeItem('currentExamResult');
                  window.location.reload();
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 font-bold py-3.5 px-8 rounded-xl transition-all duration-200 shadow-sm"
              >
                <RotateCcw className="w-5 h-5" strokeWidth={2} />
                Retake
              </button>
              
              <button
                onClick={() => {
                  sessionStorage.removeItem('currentExamResult');
                  router.push('/');
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 font-bold py-3.5 px-8 rounded-xl transition-all duration-200 shadow-sm"
              >
                <Home className="w-5 h-5" strokeWidth={2} />
                Home
              </button>
            </div>

          </div>
        </div>
      </div>

      <PremiumModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)} 
      />
    </>
  );
}