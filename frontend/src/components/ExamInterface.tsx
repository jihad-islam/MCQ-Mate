'use client';

import { ExamResult, Question, submitExam } from '@/lib/api';
import { ArrowLeft, ArrowRight, CheckCircle, Home, RotateCcw, Target, Trophy, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { FormattedMathText } from './FormattedMathText';

import { useRouter } from 'next/navigation';

interface ExamInterfaceProps {
  questions: Question[];
  onSubmitComplete?: () => void;
}

interface UserAnswers {
  [questionId: number]: number;
}

export default function ExamInterface({ questions, onSubmitComplete }: ExamInterfaceProps) {
  const router = useRouter();
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<ExamResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Prevent accidental exit during exam
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!submitted) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [submitted]);

  // Strict check for persisted results on reload
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedResult = sessionStorage.getItem('currentExamResult');
        if (savedResult) {
          setResults(JSON.parse(savedResult));
          setSubmitted(true);
          if (onSubmitComplete) onSubmitComplete(); // Force sync with parent page
        }
      } catch (e) {
        // Silently failed to parse saved exam result
      }
    }
  }, [onSubmitComplete]);

  useEffect(() => {
    const handleTimeUp = () => {
      if (!submitted) handleSubmit();
    };
    window.addEventListener('timeUp', handleTimeUp);
    return () => window.removeEventListener('timeUp', handleTimeUp);
  }, [userAnswers, submitted]);

  const handleOptionSelect = useCallback((questionId: number, optionId: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const answers = questions.map((question) => ({
        question_id: question.id,
        selected_option_id: userAnswers[question.id] || null,
      }));

      const served_question_ids = questions.map((q) => q.id);

      const backendResults = await submitExam({ served_question_ids, answers });
      setResults(backendResults);
      setSubmitted(true);
      sessionStorage.setItem('currentExamResult', JSON.stringify(backendResults));
      
      if (onSubmitComplete) onSubmitComplete();
    } catch (err) {
      setError('Failed to submit exam. Please try again.');
      // Console log removed for cleaner production build
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (submitted && results) {
    const isOutstanding = results.score >= 80;
    const isGood = results.score >= 60 && results.score < 80;
    
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 max-w-2xl mx-auto shadow-xl transition-colors relative overflow-hidden mt-4">
        {/* Subtle background decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/10 dark:bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-600/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center relative z-10 space-y-8">
          <div className="flex flex-col items-center gap-3">
            <div className={`p-4 rounded-full ${isOutstanding ? 'bg-amber-100 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400' : isGood ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400'}`}>
              <Trophy className="w-10 h-10" strokeWidth={1.5} />
            </div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50">
              {isOutstanding ? "Outstanding Performance! 🏆" : isGood ? "Good Job! Keep it up! 🎯" : "Keep Practicing! 💪"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase text-sm">Exam Complete</p>
          </div>

          <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl transition-colors shadow-inner flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 dark:from-violet-500/10 dark:to-indigo-500/10 pointer-events-none"></div>
            <p className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 mb-2 relative z-10">{results.score}%</p>
            <p className="text-sm font-bold tracking-widest text-slate-400 uppercase relative z-10">Final Score</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 transition-colors">
              <CheckCircle className="w-6 h-6 text-emerald-500 dark:text-emerald-400" strokeWidth={2} />
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{results.correct_answers}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-500">Correct</p>
            </div>
            <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 transition-colors">
              <XCircle className="w-6 h-6 text-rose-500 dark:text-rose-400" strokeWidth={2} />
              <p className="text-3xl font-black text-rose-600 dark:text-rose-400">{results.wrong_answers}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-600/70 dark:text-rose-500">Wrong</p>
            </div>
            <div className="bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 transition-colors">
              <Target className="w-6 h-6 text-violet-500 dark:text-violet-400" strokeWidth={2} />
              <p className="text-3xl font-black text-violet-600 dark:text-violet-400">{results.total_questions}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-violet-600/70 dark:text-violet-500">Total</p>
            </div>
          </div>

          <button
            onClick={() => {
              sessionStorage.setItem('examReview', JSON.stringify({ breakdown: results.breakdown, questions, userAnswers }));
              router.push('/review');
            }}
            className="mt-8 w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-sm"
          >
            Review Answers
          </button>

          <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center items-center mt-4">
            {/* FIX: Return to Home uses router.push to securely navigate */}
            <button
              onClick={() => {
                sessionStorage.removeItem('currentExamResult');
                router.push('/');
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              <Home className="w-5 h-5" strokeWidth={2} />
              Return to Home
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem('currentExamResult');
                window.location.reload();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 font-bold py-3.5 px-8 rounded-xl transition-all duration-200 shadow-sm focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              <RotateCcw className="w-5 h-5" strokeWidth={2} />
              Retake Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!questions) return null;

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center mt-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-2xl mx-auto shadow-sm p-12">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">No questions found!</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-2">There are no MCQs available for this chapter yet.</p>
        <button 
          onClick={() => router.push('/')} 
          className="mt-6 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all shadow-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      {error && (
        <div className="bg-rose-100 dark:bg-rose-950 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 px-5 py-3 rounded-2xl text-sm font-medium transition-colors">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm transition-colors min-h-[400px] flex flex-col">
        <div className="mb-8 flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h3>
            <div className="text-sm font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-3 py-1 rounded-lg">
              {Object.keys(userAnswers).length} Answered
            </div>
          </div>
          
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 mb-8 overflow-hidden">
            <div 
              className="bg-violet-600 dark:bg-violet-500 h-full rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 leading-relaxed min-h-[4rem]">
            <FormattedMathText text={currentQuestion?.text || ""} />
          </p>
        </div>

        <div className="space-y-4 flex-grow">
          {(currentQuestion?.options || []).map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 font-medium ${
                userAnswers[currentQuestion.id] === option.id
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10 dark:border-violet-500 text-violet-900 dark:text-violet-200 shadow-md ring-1 ring-violet-500/50'
                  : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    userAnswers[currentQuestion.id] === option.id
                      ? 'border-violet-500 bg-violet-500 dark:bg-violet-500'
                      : 'border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-600'
                  }`}
                >
                  {userAnswers[currentQuestion.id] === option.id && (
                    <span className="text-white font-bold text-sm">✓</span>
                  )}
                </div>
                <span className="text-lg"><FormattedMathText text={option?.text || ""} /></span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Footer: Side-by-side strictly on all views (mobile & desktop) */}
      <div className="flex flex-row justify-between items-center gap-2 sm:gap-4 w-full mt-6">
        <button
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          className="flex items-center justify-center gap-1 sm:gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold py-2 px-3 sm:py-3 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-base">Previous</span>
        </button>
        
        {currentQuestionIndex === questions.length - 1 ? (
           <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-grow bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-3 sm:py-3 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-200 shadow-[0_8px_30px_rgb(5,150,105,0.2)] hover:shadow-[0_8px_30px_rgb(5,150,105,0.4)] disabled:shadow-none min-w-[120px] sm:min-w-[150px] max-w-[200px] sm:max-w-[250px]"
          >
            <span className="text-xs sm:text-base">{isLoading ? 'Submitting...' : 'Submit Exam'}</span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center justify-center gap-1 sm:gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 font-bold py-2 px-3 sm:py-3 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-200 shadow-sm"
          >
            <span className="text-xs sm:text-base">Next</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>
    </div>
  );
}