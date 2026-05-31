import { ExamResult, Question } from '@/lib/api';
import { CheckCircle, Home, RotateCcw, Target, Trophy, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ResultViewProps {
  results: ExamResult;
  questions: Question[];
  userAnswers: Record<number, number>;
}

export default function ResultView({ results, questions, userAnswers }: ResultViewProps) {
  const router = useRouter();
  const isOutstanding = results.score >= 80;
  const isGood = results.score >= 60 && results.score < 80;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 max-w-2xl mx-auto shadow-xl transition-colors relative overflow-hidden mt-4">
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