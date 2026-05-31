'use client';

import { useExamShortcuts } from '@/hooks/useExamShortcuts';
import { ExamResult, Question, submitExam } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import ExamControls from './Exam/ExamControls';
import QuestionCard from './Exam/QuestionCard';
import ResultView from './Exam/ResultView';

interface ExamInterfaceProps {
  questions: Question[];
  onSubmitComplete?: () => void;
}

export default function ExamInterface({ questions, onSubmitComplete }: ExamInterfaceProps) {
  const router = useRouter();
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<ExamResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleOptionSelect = useCallback((questionId: number, optionId: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  }, []);

  // 1. Prevent accidental tab close/reload during exam
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

  // 2. Load saved results if the exam was already submitted
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedResult = sessionStorage.getItem('currentExamResult');
        if (savedResult) {
          setResults(JSON.parse(savedResult));
          setSubmitted(true);
          if (onSubmitComplete) onSubmitComplete();
        }
      } catch (e) {}
    }
  }, [onSubmitComplete]);

  // 3. Handle Exam Submission Logic
  const handleSubmit = useCallback(async () => {
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
    } finally {
      setIsLoading(false);
    }
  }, [questions, userAnswers, onSubmitComplete]);

  // 4. Handle Time Up Auto-Submit
  useEffect(() => {
    const handleTimeUp = () => {
      if (!submitted && questions?.length > 0) handleSubmit();
    };
    window.addEventListener('timeUp', handleTimeUp);
    return () => window.removeEventListener('timeUp', handleTimeUp);
  }, [submitted, questions?.length, handleSubmit]);

  // 5. Modular Keyboard Shortcuts Hook (অবশ্যই handleSubmit-এর নিচে থাকতে হবে)
  useExamShortcuts({
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    userAnswers,
    handleOptionSelect,
    handleSubmit,
    submitted,
    isLoading,
  });

  // --- Render Logic ---

  if (submitted && results) {
    return <ResultView results={results} questions={questions} userAnswers={userAnswers} />;
  }

  if (!questions || questions.length === 0) {
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

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      {error && (
        <div className="bg-rose-100 dark:bg-rose-950 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 px-5 py-3 rounded-2xl text-sm font-medium transition-colors">
          {error}
        </div>
      )}

      <QuestionCard 
        question={questions[currentQuestionIndex]}
        currentIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        userAnswers={userAnswers}
        onSelectOption={handleOptionSelect}
      />

      <ExamControls 
        onPrev={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
        onNext={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
        onSubmit={handleSubmit}
        isFirst={currentQuestionIndex === 0}
        isLast={currentQuestionIndex === questions.length - 1}
        isLoading={isLoading}
      />
    </div>
  );
}