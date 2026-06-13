'use client';

import { Question, toggleBookmark } from '@/lib/api';
import { Bookmark, Eye, EyeOff, Info } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FormattedMathText } from '../ui/FormattedMathText';
import ReportModal from './ReportModal'; // UPDATE: Modular Import

// UPDATE: Improved Helper to Strip CKEditor tags & Entities (&nbsp;)
const cleanHTML = (html: string) => {
  if (!html) return '';
  return html
    .replace(/<\/?p[^>]*>/gi, '') // Remove <p> tags
    .replace(/&nbsp;/g, ' ')      // Replace non-breaking space with normal space
    .replace(/&amp;/g, '&')       // Replace other entities if needed
    .trim();
};

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  userAnswers: Record<number, number>;
  onSelectOption: (questionId: number, optionId: number) => void;
}

export default function QuestionCard({ question, currentIndex, totalQuestions, userAnswers, onSelectOption }: QuestionCardProps) {
  const searchParams = useSearchParams();
  const chapterIds = searchParams.get('chapterIds') || '';
  const isBoardExam = chapterIds.split(',').some(id => parseInt(id.trim()) >= 100000);

  const [showChapter, setShowChapter] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const savedState = sessionStorage.getItem('showChapterTag');
      if (savedState === 'true') setShowChapter(true);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleChapter = () => {
    const newState = !showChapter;
    setShowChapter(newState);
    sessionStorage.setItem('showChapterTag', String(newState));
  };

  const handleToggleBookmark = async () => {
    setIsDropdownOpen(false); 
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      setIsBookmarked(!isBookmarked);
      await toggleBookmark(token, question.id);
    } catch {
      setIsBookmarked(!isBookmarked);
    }
  };

  const renderOptionsDropdown = () => (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`p-1.5 rounded-full transition-all duration-200 ${
          isDropdownOpen 
            ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400' 
            : 'text-violet-600/40 dark:text-violet-400/40 hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400'
        }`}
      >
        <Info className="w-5 h-5" strokeWidth={2.5} />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
          <button 
            onClick={handleToggleBookmark}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-violet-500 text-violet-500' : 'text-slate-400'}`} />
            {isBookmarked ? 'Saved' : 'Save'}
          </button>
          <button 
            onClick={() => { setIsDropdownOpen(false); setIsReportModalOpen(true); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
          >
            <Info className="w-4 h-4" /> Report Issue
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="bg-transparent md:bg-white dark:bg-transparent md:dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800/60 md:border md:border-slate-200 md:dark:border-slate-700 rounded-none md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-none md:shadow-sm transition-colors min-h-0 flex flex-col relative">
        <div className="mb-6 md:mb-8 flex-shrink-0">
          <div className="hidden md:block">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Question {currentIndex + 1} of {totalQuestions}
              </h3>
              <div className="flex items-center gap-4">
                <div className="text-sm font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-3 py-1.5 rounded-lg">
                  {Object.keys(userAnswers).length} Answered
                </div>
                {renderOptionsDropdown()}
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 mb-8 overflow-hidden">
              <div 
                className="bg-violet-600 dark:bg-violet-500 h-full rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          <div className="md:hidden flex items-center justify-between mb-3">
            <span className="text-xs font-black text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-500/10 px-2.5 py-1.5 rounded-md tracking-wide uppercase">
              MCQ #{currentIndex + 1}
            </span>
            {renderOptionsDropdown()}
          </div>

          <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-50 leading-relaxed">
            {/* UPDATE: cleanHTML applied here */}
            <FormattedMathText text={cleanHTML(question.text || "")} />
            
            {!isBoardExam && question.board_reference && (
              <span className="ml-3 inline-block align-middle text-xs font-semibold text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-700/50 px-2.5 py-1 rounded-md">
                {question.board_reference}
              </span>
            )}

            {isBoardExam && question.chapter_name && (
              <span 
                onClick={toggleChapter}
                className="ml-3 inline-flex items-center gap-1.5 align-middle text-xs font-bold text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-500/10 px-2.5 py-1.5 rounded-md border border-violet-200 dark:border-violet-500/20 cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-all active:scale-95"
              >
                {showChapter ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span className="max-w-[150px] truncate">{question.chapter_name}</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    Show Chapter
                  </>
                )}
              </span>
            )}
          </div>

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
                {/* UPDATE: cleanHTML applied here */}
                <span className="text-base md:text-lg">
                  <FormattedMathText text={cleanHTML(option?.text || "")} />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* UPDATE: Use Modular Report Modal */}
      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        questionId={question.id} 
      />
    </>
  );
}