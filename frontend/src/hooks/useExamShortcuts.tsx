import { Question } from '@/lib/api';
import { useEffect } from 'react';

interface UseExamShortcutsProps {
  questions: Question[];
  currentQuestionIndex: number;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  userAnswers: Record<number, number>;
  handleOptionSelect: (questionId: number, optionId: number) => void;
  handleSubmit: () => void; // নতুন prop
  submitted: boolean;
  isLoading: boolean;
}

export const useExamShortcuts = ({
  questions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  userAnswers,
  handleOptionSelect,
  handleSubmit, // নতুন prop
  submitted,
  isLoading,
}: UseExamShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (submitted || isLoading) return;

      // Arrow keys এবং Enter চাপলে যেন পেজ স্ক্রল বা রিলোড না হয়
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowRight') {
        setCurrentQuestionIndex((prev) => (prev < questions.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft') {
        setCurrentQuestionIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        // Enter বাটনের লজিক
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1); // Next question-এ যাবে
        } else {
          handleSubmit(); // লাস্ট প্রশ্নে থাকলে Submit হবে
        }
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion || !currentQuestion.options) return;

        const options = currentQuestion.options;
        const currentSelectedId = userAnswers[currentQuestion.id];
        const selectedIndex = options.findIndex((opt) => opt.id === currentSelectedId);

        let newIndex;
        if (e.key === 'ArrowDown') {
          newIndex = selectedIndex === -1 ? 0 : (selectedIndex + 1) % options.length;
        } else if (e.key === 'ArrowUp') {
          newIndex = selectedIndex === -1 ? options.length - 1 : (selectedIndex - 1 + options.length) % options.length;
        }

        if (newIndex !== undefined) {
          handleOptionSelect(currentQuestion.id, options[newIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [questions, currentQuestionIndex, submitted, isLoading, userAnswers, handleOptionSelect, setCurrentQuestionIndex, handleSubmit]);
};