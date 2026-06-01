'use client';

import { FormattedMathText } from '@/components/ui/FormattedMathText';
import PdfDownloadButton from '@/components/ui/PdfDownloadButton';
import { Question, submitFeedback, toggleBookmark } from '@/lib/api';
import { AlertTriangle, ArrowLeft, Bookmark, CheckCircle, Home, Info, X, XCircle } from 'lucide-react';
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
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<number>>(new Set());

  // Report Modal States
  const [activeReportQuestionId, setActiveReportQuestionId] = useState<number | null>(null);
  const [reportIssueType, setReportIssueType] = useState('wrong_option');
  const [reportMessage, setReportMessage] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

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

  const handleToggleBookmark = async (questionId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return; // Silent ignore if not logged in
      
      setBookmarkedQuestions(prev => {
        const newSet = new Set(prev);
        if (newSet.has(questionId)) newSet.delete(questionId);
        else newSet.add(questionId);
        return newSet;
      });

      await toggleBookmark(token, questionId);
    } catch (error) {
      console.error("Failed to bookmark", error);
      // Revert optimistic update on error
      setBookmarkedQuestions(prev => {
        const newSet = new Set(prev);
        if (newSet.has(questionId)) newSet.delete(questionId);
        else newSet.add(questionId);
        return newSet;
      });
    }
  };

  const handleReportSubmit = async () => {
    if (!activeReportQuestionId) return;
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      
      setIsSubmittingReport(true);
      await submitFeedback(token, {
        question: activeReportQuestionId,
        issue_type: reportIssueType,
        message: reportMessage
      });
      
      setReportSuccess(true);
      setTimeout(() => {
        setActiveReportQuestionId(null);
        setReportSuccess(false);
        setReportMessage('');
        setReportIssueType('wrong_option');
      }, 2000);
    } catch (error) {
      console.error("Failed to submit report", error);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (!data) return null;

  const { breakdown, questions, userAnswers } = data;

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Header Section with PDF Download Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
            
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 hidden sm:block tracking-tight">
              Review Answers
            </h1>
            
            <div className="w-full sm:w-auto flex justify-end">
              <PdfDownloadButton targetId="pdf-review-content" fileName="MCQMate_Performance_Review.pdf" />
            </div>
          </div>

          {/* Content Area to be Exported as PDF */}
          <div id="pdf-review-content" className="space-y-6 rounded-3xl pb-4">
            
            <div className="hidden print-header mb-8 text-center px-4">
              <h2 className="text-3xl font-black text-slate-800">MCQMate Exam Review</h2>
              <p className="text-slate-500 mt-2 font-medium">Performance and Answer Breakdown</p>
            </div>

            {questions.map((question, idx) => {
              const qResult = breakdown?.find((b) => b.question_id === question.id);
              const userSelectedId = userAnswers[question.id];
              const isCorrect = qResult?.correct_option_id === userSelectedId;
              const isBookmarked = bookmarkedQuestions.has(question.id);

              return (
                <div key={question.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm transition-colors break-inside-avoid relative">
                  
                  {/* Subtle Action Buttons for Bookmark and Report */}
                  <div className="absolute top-6 right-6 flex items-center gap-3">
                    <button 
                      onClick={() => handleToggleBookmark(question.id)}
                      className="text-slate-400 hover:text-violet-500 transition-colors tooltip-trigger print:hidden"
                      title="Bookmark Question"
                    >
                      <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-violet-500 text-violet-500' : ''}`} />
                    </button>
                    <button 
                      onClick={() => setActiveReportQuestionId(question.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors tooltip-trigger print:hidden"
                      title="Report Error"
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-start justify-between gap-4 mb-4 pr-16">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Question {idx + 1}</span>
                        {!userSelectedId && (
                          <span className="px-2 py-1 text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 rounded-md">Not Answered / Skipped</span>
                        )}
                      </div>
                      <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-2">
                        <FormattedMathText text={question?.text || ""} />
                        {question?.board_reference && (
                          <span className="ml-3 inline-block align-middle text-xs font-semibold text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-700 px-2.5 py-1 rounded-md">
                            {question.board_reference}
                          </span>
                        )}
                      </p>
                      {question?.image_url && (
                        <div className="mt-4 mb-2">
                          <img 
                            src={question.image_url} 
                            alt="Question visual" 
                            className="max-w-full max-h-[300px] object-contain rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Indicator showing if user was Correct or Wrong */}
                  <div className="flex items-center gap-2 mb-6 p-3 rounded-xl border bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700 w-fit">
                    {isCorrect ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Your answer was Correct</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-rose-500" />
                        <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{userSelectedId ? 'Your answer was Incorrect' : 'You skipped this question'}</span>
                      </>
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

          <div className="pt-4 flex justify-center pb-8">
            <button
              onClick={() => router.push('/')}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto text-lg focus:ring-4 focus:ring-violet-500/20"
            >
              <Home className="w-6 h-6" />
              Return to Home
            </button>
          </div>
        </div>
      </div>

      {/* Report Modal - Appears when activeReportQuestionId is set */}
      {activeReportQuestionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700">
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" /> Report Issue
              </h3>
              <button 
                onClick={() => {
                  setActiveReportQuestionId(null);
                  setReportSuccess(false);
                }} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">✓</div>
                <p className="font-bold text-slate-900 dark:text-white">Report Submitted!</p>
                <p className="text-sm text-slate-500 mt-1">Thank you for helping us improve MCQMate.</p>
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