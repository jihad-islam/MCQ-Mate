import { Question } from '@/lib/api';
import Image from 'next/image';
import { FormattedMathText } from '../ui/FormattedMathText';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  userAnswers: Record<number, number>;
  onSelectOption: (questionId: number, optionId: number) => void;
}

export default function QuestionCard({ question, currentIndex, totalQuestions, userAnswers, onSelectOption }: QuestionCardProps) {
  if (!question) return null;

  return (
    /* Tailwind Responsive Magic: 
      Moblie-এ background transparent, border-b এবং rounded-none থাকবে (Clean Sheet Look)।
      Desktop (md)-এ এটি সুন্দর rounded-3xl white card এবং shadow-sm বক্সে রূপান্তর হবে।
    */
    <div className="bg-transparent md:bg-white dark:bg-transparent md:dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800/60 md:border md:border-slate-200 md:dark:border-slate-700 rounded-none md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-none md:shadow-sm transition-colors min-h-0 flex flex-col">
      <div className="mb-6 md:mb-8 flex-shrink-0">
        
        {/* 1. DESKTOP ONLY: Progress Bar & Status (Hidden on Mobile) */}
        <div className="hidden md:block">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Question {currentIndex + 1} of {totalQuestions}
            </h3>
            <div className="text-sm font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-3 py-1 rounded-lg">
              {Object.keys(userAnswers).length} Answered
            </div>
          </div>
          
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 mb-8 overflow-hidden">
            <div 
              className="bg-violet-600 dark:bg-violet-500 h-full rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* 2. MOBILE ONLY: Minimal Subtle Badge (Hidden on Desktop) */}
        <div className="md:hidden flex items-center gap-2 mb-3">
          <span className="text-xs font-black text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-500/10 px-2.5 py-1 rounded-md tracking-wide uppercase">
            MCQ #{currentIndex + 1}
          </span>
        </div>

        {/* Question Text */}
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-50 leading-relaxed">
          <FormattedMathText text={question.text || ""} />
          {question.board_reference && (
            <span className="ml-3 inline-block align-middle text-xs font-semibold text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-700/50 px-2.5 py-1 rounded-md">
              {question.board_reference}
            </span>
          )}
        </p>

        {/* Optimized Image */}
        {question.image_url && (
          <div className="mt-4 md:mt-6 mb-2 flex justify-center sm:justify-start">
            <Image 
              src={question.image_url} 
              alt="Question visual" 
              width={600}
              height={350}
              style={{ objectFit: 'contain' }}
              className="max-w-full max-h-[300px] md:max-h-[400px] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Options Grid/List */}
      <div className="space-y-3.5 md:space-y-4 flex-grow">
        {(question.options || []).map((option) => (
          <button
            key={option.id}
            onClick={() => onSelectOption(question.id, option.id)}
            className={`w-full text-left p-4 md:p-5 rounded-xl md:rounded-2xl border-2 transition-all duration-200 font-medium ${
              userAnswers[question.id] === option.id
                ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10 dark:border-violet-500 text-violet-900 dark:text-violet-200 shadow-sm ring-1 ring-violet-500/50'
                : 'border-slate-200 dark:border-slate-700/60 md:border-slate-200 dark:md:border-slate-600 bg-white dark:bg-slate-800 md:dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 md:dark:hover:bg-slate-600'
            }`}
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div
                className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  userAnswers[question.id] === option.id
                    ? 'border-violet-500 bg-violet-500 dark:bg-violet-500'
                    : 'border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-600'
                }`}
              >
                {userAnswers[question.id] === option.id && (
                  <span className="text-white font-bold text-xs md:text-sm">✓</span>
                )}
              </div>
              <span className="text-base md:text-lg"><FormattedMathText text={option?.text || ""} /></span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}