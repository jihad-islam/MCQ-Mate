import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ExamControlsProps {
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isFirst: boolean;
  isLast: boolean;
  isLoading: boolean;
}

export default function ExamControls({ onPrev, onNext, onSubmit, isFirst, isLast, isLoading }: ExamControlsProps) {
  return (
    <div className="flex flex-row justify-between items-center gap-4 w-full mt-6">
      <button
        onClick={onPrev}
        disabled={isFirst}
        className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold py-3 px-5 sm:py-4 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-200 shadow-sm"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm sm:text-base">Previous</span>
      </button>
      
      {isLast ? (
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="flex-grow sm:flex-grow-0 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-5 sm:py-4 sm:px-10 rounded-xl sm:rounded-2xl transition-all duration-200 shadow-[0_8px_30px_rgb(5,150,105,0.2)] hover:shadow-[0_8px_30px_rgb(5,150,105,0.4)] disabled:shadow-none"
        >
          <span className="text-sm sm:text-base">{isLoading ? 'Submitting...' : 'Submit Exam'}</span>
        </button>
      ) : (
        <button
          onClick={onNext}
          className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 font-bold py-3 px-5 sm:py-4 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-200 shadow-sm"
        >
          <span className="text-sm sm:text-base">Next</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}