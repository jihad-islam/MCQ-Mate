'use client';

import { FormattedMathText } from '@/components/FormattedMathText';
import { Question } from '@/lib/api';
import { ArrowLeft, CheckCircle, Home, Info, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ReviewData {
  breakdown: Array<{
    question_id: number;
    correct_option_id: number;
    explanation: string | null;
  }>;
  questions: Question[];
  userAnswers: { [questionId: number]: number };
}

export default function ReviewPage() {
  const router = useRouter();
  const [data, setData] = useState<ReviewData | null>(null);

  useEffect(() => {
    const savedData = sessionStorage.getItem('examReview');
    if (!savedData) {
      router.push('/');
      return;
    }
    try {
      setData(JSON.parse(savedData));
    } catch (e) {
      router.push('/');
    }
  }, [router]);

  if (!data) return null;

  const { breakdown, questions, userAnswers } = data;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Review Answers</h1>
        </div>

        <div className="space-y-6">
          {questions.map((question, idx) => {
            const qResult = breakdown?.find((b) => b.question_id === question.id);
            const userSelectedId = userAnswers[question.id];
            const isCorrect = qResult?.correct_option_id === userSelectedId;

            return (
              <div key={question.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm transition-colors">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Question {idx + 1}</span>
                      {!userSelectedId && (
                        <span className="px-2 py-1 text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 rounded-md">Not Answered / Skipped</span>
                      )}
                    </div>
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-2">
                      <FormattedMathText text={question?.text || ""} />
                    </p>
                  </div>
                  {isCorrect ? (
                    <CheckCircle className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-8 h-8 text-rose-500 flex-shrink-0" />
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {question.options.map((option) => {
                    const isUserSelection = option.id === userSelectedId;
                    const isActualCorrect = option.id === qResult?.correct_option_id;

                    let styleClass = "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400";
                    if (isActualCorrect) {
                      styleClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-sm";
                    } else if (isUserSelection && !isActualCorrect) {
                      styleClass = "border-rose-300 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-500/50 text-rose-700 dark:text-rose-300";
                    }

                    return (
                      <div key={option.id} className={`p-4 rounded-xl border-2 transition-colors flex items-center gap-3 ${styleClass}`}>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isActualCorrect ? 'border-emerald-500 bg-emerald-500' : 
                          (isUserSelection ? 'border-rose-500 bg-rose-500' : 'border-slate-300 dark:border-slate-600')
                        }`}>
                          {(isActualCorrect || isUserSelection) && <span className="text-white text-xs font-bold">✓</span>}
                        </div>
                        <span className="font-medium flex-1">
                          <FormattedMathText text={option?.text || ""} />
                        </span>
                        {isActualCorrect && <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex-shrink-0">Correct Answer</span>}
                        {(isUserSelection && !isActualCorrect) && <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest flex-shrink-0">Your Answer</span>}
                      </div>
                    );
                  })}
                </div>

                {qResult?.explanation && (
                  <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-2xl p-5 flex gap-3 text-sky-900 dark:text-sky-200">
                    <Info className="w-6 h-6 flex-shrink-0 mt-0.5 text-sky-600 dark:text-sky-400" />
                    <div>
                      <span className="font-bold block mb-2 text-sky-800 dark:text-sky-300">Explanation</span>
                      <div className="text-sm leading-relaxed">
                        <FormattedMathText text={qResult?.explanation || ""} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-8 flex justify-center pb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto text-lg"
          >
            <Home className="w-6 h-6" />
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
