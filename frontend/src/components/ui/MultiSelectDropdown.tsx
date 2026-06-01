'use client';

import { Chapter } from '@/lib/api';
import { Check, ChevronDown, Lock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface MultiSelectDropdownProps {
  chapters: Chapter[];
  selectedIds: number[];
  onChange: (selectedIds: number[]) => void;
  disabled?: boolean;
  onLockedClick?: () => void;
  isPremium?: boolean; // নতুন prop অ্যাড করা হলো
}

export default function MultiSelectDropdown({ 
  chapters, 
  selectedIds, 
  onChange, 
  disabled, 
  onLockedClick,
  isPremium = false // ডিফল্টভাবে false থাকবে
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSelection = (chapter: Chapter) => {
    // চ্যাপ্টারটি ফ্রি না হলে এবং ইউজার প্রিমিয়াম না হলেই কেবল লকড থাকবে
    const isLocked = !chapter.is_free && !isPremium;
    
    if (isLocked) {
      if (onLockedClick) onLockedClick();
      return;
    }

    if (selectedIds.includes(chapter.id)) {
      onChange(selectedIds.filter(item => item !== chapter.id));
    } else {
      onChange([...selectedIds, chapter.id]);
    }
  };

  // Select All লজিক আপডেট: প্রিমিয়াম হলে সব সিলেক্ট হবে, না হলে শুধু ফ্রি গুলো
  const selectAll = () => {
    const availableChapterIds = isPremium 
      ? chapters.map(c => c.id) 
      : chapters.filter(c => c.is_free).map(c => c.id);
    onChange(availableChapterIds);
  };
  
  const deselectAll = () => onChange([]);

  // UI টেক্সট জেনারেট করা
  let displayText = "Select your chapters...";
  if (selectedIds.length === 1) {
    displayText = chapters.find(c => c.id === selectedIds[0])?.name || displayText;
  } else if (selectedIds.length > 1) {
    displayText = `${selectedIds.length} Chapters Selected`;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-900 border-2 rounded-xl text-sm font-semibold transition-all ${
          disabled 
            ? 'opacity-60 cursor-not-allowed border-slate-200 dark:border-slate-700 text-slate-400' 
            : 'cursor-pointer border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 hover:border-violet-300 dark:hover:border-violet-700 focus:outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10'
        } ${isOpen ? 'border-violet-500 dark:border-violet-500 ring-4 ring-violet-500/10' : ''}`}
      >
        <span className="truncate pr-4">{displayText}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          
          {/* Action Buttons (Select All / Clear) */}
          {chapters.length > 0 && (
            <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50">
              <button 
                type="button" 
                onClick={selectAll}
                className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
              >
                Select All
              </button>
              <button 
                type="button" 
                onClick={deselectAll}
                className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                Clear
              </button>
            </div>
          )}

          {/* Chapter List */}
          <div className="max-h-60 overflow-y-auto p-2 scroll-smooth">
            {chapters.length === 0 ? (
              <div className="p-4 text-sm text-center text-slate-500">No chapters available</div>
            ) : (
              chapters.map((chapter) => {
                const isSelected = selectedIds.includes(chapter.id);
                // ডাইনামিক লক চেকিং
                const isLocked = !chapter.is_free && !isPremium;
                
                return (
                  <div
                    key={chapter.id}
                    onClick={() => toggleSelection(chapter)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors group ${
                      isLocked ? 'hover:bg-rose-50 dark:hover:bg-rose-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 flex-shrink-0 rounded flex items-center justify-center border-2 transition-colors ${
                        isLocked 
                          ? 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700' 
                          : isSelected 
                            ? 'bg-violet-600 border-violet-600 dark:bg-violet-500 dark:border-violet-500' 
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 group-hover:border-violet-400'
                      }`}>
                        {isSelected && !isLocked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                        {isLocked && <Lock className="w-3 h-3 text-slate-400 dark:text-slate-500" strokeWidth={2.5} />}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-semibold ${
                          isLocked ? 'text-slate-500 dark:text-slate-400' : isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {chapter.name}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          {chapter.total_mcqs} MCQs available
                        </span>
                      </div>
                    </div>
                    
                    {/* Locked Badge */}
                    {isLocked && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10 px-2 py-1 rounded-md">
                        Premium
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}