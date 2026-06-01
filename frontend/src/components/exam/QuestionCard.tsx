'use client';

import { Question, submitFeedback, toggleBookmark } from '@/lib/api';
import { AlertTriangle, Bookmark, Eye, EyeOff, X } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FormattedMathText } from '../ui/FormattedMathText';

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
  
  // States for Bookmark & Report
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportIssueType, setReportIssueType] = useState('wrong_option');
  const [reportMessage, setReportMessage] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    const savedState = sessionStorage.getItem('showChapterTag');
    if (savedState === 'true') {
      setShowChapter(true);
    }
  }, []);

  const toggleChapter = () => {
    const newState = !showChapter;
    setShowChapter(newState);
    sessionStorage.setItem('showChapterTag', String(newState));
  };

  const handleToggleBookmark = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return; // User not logged in, silently ignore or show toast
      
      // Optimistic UI update
      setIsBookmarked(!isBookmarked);
      await toggleBookmark(token, question.id);
    } catch (error) {
      console.error("Failed to bookmark", error);
      setIsBookmarked(!isBookmarked); // Revert on failure
    }
  };

  const handleReportSubmit = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      
      setIsSubmittingReport(true);
      await submitFeedback(token, {
        question: question.id,
        issue_type: reportIssueType,
        message: reportMessage
      });
      setReportSuccess(true);
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSuccess(false);
        setReportMessage('');
      }, 2000);
    } catch (error) {
      console.error("Failed to submit report", error);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (!question) return null;

  // Action Buttons Component (To keep code DRY and clean)
  const ActionButtons = () => (
    <div className="flex items-center gap-3">
      <button 
        onClick={handleToggleBookmark}
        className="text-slate-400 hover:text-violet-500 transition-colors tooltip-trigger"
        title="Bookmark Question"
      >
        <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-violet-500 text-violet-500' : ''}`} />
      </button>
      <button 
        onClick={() => setIsReportModalOpen(true)}
        className="text-slate-400 hover:text-rose-500 transition-colors tooltip-trigger"
        title="Report Error"
      >
        <AlertTriangle className="w-5 h-5" />
      </button>
    </div>
  );

  return (
    <>
      <div className="bg-transparent md:bg-white dark:bg-transparent md:dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800/60 md:border md:border-slate-200 md:dark:border-slate-700 rounded-none md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-none md:shadow-sm transition-colors min-h-0 flex flex-col relative">
        <div className="mb-6 md:mb-8 flex-shrink-0">
          
          {/* DESKTOP ONLY: Header */}
          <div className="hidden md:block">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Question {currentIndex + 1} of {totalQuestions}
              </h3>
              
              <div className="flex items-center gap-5">
                <ActionButtons />
                <div className="text-sm font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-3 py-1 rounded-lg">
                  {Object.keys(userAnswers).length} Answered
                </div>
              </div>
            </div>
            
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 mb-8 overflow-hidden">
              <div 
                className="bg-violet-600 dark:bg-violet-500 h-full rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* MOBILE ONLY: Header */}
          <div className="md:hidden flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-black text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-500/10 px-2.5 py-1 rounded-md tracking-wide uppercase">
              MCQ #{currentIndex + 1}
            </span>
            <ActionButtons />
          </div>

          {/* Question Text & Tags */}
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-50 leading-relaxed">
            <FormattedMathText text={question.text || ""} />
            
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

        {/* Options */}
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

      {/* Report Modal - Clean and Minimal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700">
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" /> Report Issue
              </h3>
              <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">✓</div>
                <p className="font-bold text-slate-900 dark:text-white">Report Submitted!</p>
                <p className="text-sm text-slate-500">Thank you for helping us improve.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Issue Type</label>
                  <select 
                    value={reportIssueType}
                    onChange={(e) => setReportIssueType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
                  >
                    <option value="wrong_option">Wrong Options</option>
                    <option value="typo">Typo or Spelling Error</option>
                    <option value="unclear">Question is Unclear</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Details (Optional)</label>
                  <textarea 
                    value={reportMessage}
                    onChange={(e) => setReportMessage(e.target.value)}
                    placeholder="Briefly describe the issue..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[100px] resize-none"
                  />
                </div>

                <button 
                  onClick={handleReportSubmit}
                  disabled={isSubmittingReport}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 mt-2"
                >
                  {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}