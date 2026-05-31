import { Question } from '@/lib/api';
import Image from 'next/image';
import { FormattedMathText } from '../FormattedMathText';

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
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm transition-colors min-h-[400px] flex flex-col">
      <div className="mb-8 flex-shrink-0">
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

        <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 leading-relaxed min-h-[4rem]">
          <FormattedMathText text={question.text || ""} />
          {question.board_reference && (
            <span className="ml-3 inline-block align-middle text-xs font-semibold text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-700 px-2.5 py-1 rounded-md">
              {question.board_reference}
            </span>
          )}
        </p>

        {question.image_url && (
          <div className="mt-6 mb-4 flex justify-center sm:justify-start">
            <Image 
              src={question.image_url} 
              alt="Question visual" 
              width={600}
              height={350}
              style={{ objectFit: 'contain' }}
              className="max-w-full max-h-[400px] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
            />
          </div>
        )}
      </div>

      <div className="space-y-4 flex-grow">
        {(question.options || []).map((option) => (
          <button
            key={option.id}
            onClick={() => onSelectOption(question.id, option.id)}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 font-medium ${
              userAnswers[question.id] === option.id
                ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10 dark:border-violet-500 text-violet-900 dark:text-violet-200 shadow-md ring-1 ring-violet-500/50'
                : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  userAnswers[question.id] === option.id
                    ? 'border-violet-500 bg-violet-500 dark:bg-violet-500'
                    : 'border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-600'
                }`}
              >
                {userAnswers[question.id] === option.id && (
                  <span className="text-white font-bold text-sm">✓</span>
                )}
              </div>
              <span className="text-lg"><FormattedMathText text={option?.text || ""} /></span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}