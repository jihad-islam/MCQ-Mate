'use client';

import { BookmarkItem, fetchBookmarks, toggleBookmark } from '@/lib/api';
import { Bookmark, CheckCircle2, Lightbulb, Trash2 } from 'lucide-react';
import Image from 'next/image';
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
        setBookmarks(bookmarks.filter(b => b.question.id !== questionId));
      }
    } catch (error) {
      console.error("Failed to remove bookmark", error);
    }
  };

  // Uniform Skeleton Loader
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 animate-pulse">
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-700/50">
          <div className="w-11 h-11 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
          <div>
            <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded-md mb-2"></div>
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-slate-100 dark:bg-slate-900/50 h-40 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
      
      {/* PERFECTLY UNIFORM HEADER (Matches DashboardOverview) */}
      <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-violet-100 dark:bg-violet-500/20 rounded-xl">
            <Bookmark className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Saved Questions</h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Review your bookmarked MCQs</p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {bookmarks.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
            <Bookmark className="w-8 h-8 text-slate-400" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No bookmarks yet</h4>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm">Questions you save during exams or reviews will appear here for easy access.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bookmarks.map(({ question }) => {
            const correctOption = question.options.find(opt => opt.is_correct) || question.options[0];
            
            return (
              <div key={question.id} className="bg-slate-50 dark:bg-slate-900/50 p-5 sm:p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 relative group transition-colors hover:border-violet-200 dark:hover:border-violet-500/30">
                
                <button 
                  onClick={() => handleRemoveBookmark(question.id)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 z-10 shadow-sm border border-transparent hover:border-rose-100 dark:hover:border-rose-500/30"
                  title="Remove Bookmark"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                
                <div className="pr-10 sm:pr-12">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-100/50 dark:bg-violet-500/10 px-3 py-1.5 rounded-lg border border-violet-100 dark:border-violet-500/20">
                      {question.chapter_name || 'General Question'}
                    </span>
                    {question.board_reference && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white dark:text-slate-400 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600/50 shadow-sm">
                        {question.board_reference}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-5 leading-relaxed">
                    <FormattedMathText text={question.text} />
                  </div>

                  {question.image_url && (
                    <div className="mb-6">
                      <Image 
                        src={question.image_url} 
                        alt="Question visual" 
                        width={600}
                        height={350}
                        style={{ objectFit: 'contain' }}
                        className="max-w-full max-h-[300px] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800"
                      />
                    </div>
                  )}

                  <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4 rounded-xl flex items-start gap-4 mb-4">
                    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500/80 mb-1">Correct Answer</p>
                      <div className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                        <FormattedMathText text={correctOption?.text || ""} />
                      </div>
                    </div>
                  </div>
                  
                  {question.explanation && (
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-4 rounded-xl flex items-start gap-4 transition-colors hover:border-slate-200 dark:hover:border-slate-600">
                      <div className="p-1.5 bg-amber-50 dark:bg-amber-500/10 rounded-lg flex-shrink-0 mt-0.5">
                        <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Explanation</p>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                          <FormattedMathText text={question.explanation} />
                        </div>
                      </div>
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