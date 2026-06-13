'use client';

import { submitFeedback } from '@/lib/api';
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: number;
}

export default function ReportModal({ isOpen, onClose, questionId }: ReportModalProps) {
  const [reportIssueType, setReportIssueType] = useState('wrong_option');
  const [reportMessage, setReportMessage] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleReportSubmit = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      
      setIsSubmittingReport(true);
      await submitFeedback(token, {
        question: questionId,
        issue_type: reportIssueType,
        message: reportMessage
      });
      setReportSuccess(true);
      setTimeout(() => {
        onClose();
        setReportSuccess(false);
        setReportMessage('');
      }, 2000);
    } catch {
      setReportSuccess(false);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" /> Report Issue
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
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
  );
}