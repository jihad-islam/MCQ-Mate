'use client';

import { BookmarkItem, fetchBookmarks, toggleBookmark } from '@/lib/api';
import { BookmarkMinus, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormattedMathText } from '../ui/FormattedMathText';

export default function BookmarksTab() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const data = await fetchBookmarks(token);
          setBookmarks(data);
        }
      } catch (error) {
        console.error("Failed to load bookmarks", error);
      } finally {
        setLoading(false);
      }
    };
    loadBookmarks();
  }, []);

  const handleRemoveBookmark = async (questionId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await toggleBookmark(token, questionId);
        // UI থেকে সাথে সাথে রিমুভ করে দেওয়া
        setBookmarks(bookmarks.filter(b => b.question.id !== questionId));
      }
    } catch (error) {
      console.error("Failed to remove bookmark", error);
    }
  };

  if (loading) return <div className="py-10 text-center font-bold text-slate-500 animate-pulse">Loading bookmarks...</div>;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Saved Questions</h3>
      
      {bookmarks.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl text-center border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 font-medium">No bookmarked questions found. Save questions during exams to review them later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookmarks.map(({ question }) => {
            const correctOption = question.options.find(opt => opt.is_correct) || question.options[0]; // fallback
            
            return (
              <div key={question.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative group">
                <button 
                  onClick={() => handleRemoveBookmark(question.id)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Remove Bookmark"
                >
                  <BookmarkMinus className="w-5 h-5" />
                </button>
                
                <div className="pr-10">
                  <div className="flex gap-2 mb-3">
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-2.5 py-1 rounded-md">
                      {question.chapter_name || 'General Question'}
                    </span>
                    {question.board_reference && (
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-700/50 px-2.5 py-1 rounded-md">
                        {question.board_reference}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4 leading-relaxed">
                    <FormattedMathText text={question.text} />
                  </p>

                  <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-1">Correct Answer</p>
                      <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                        <FormattedMathText text={correctOption?.text || ""} />
                      </p>
                    </div>
                  </div>
                  
                  {question.explanation && (
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-slate-900 dark:text-white">Explanation: </span>
                      <FormattedMathText text={question.explanation} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}