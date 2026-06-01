'use client';

import { Chapter } from '@/lib/api';
import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface MultiSelectDropdownProps {
  chapters: Chapter[];
  selectedIds: number[];
  onChange: (selectedIds: number[]) => void;
  disabled?: boolean;
}

export default function MultiSelectDropdown({ chapters, selectedIds, onChange, disabled }: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // বাইরে ক্লিক করলে যেন ড্রপডাউন বন্ধ হয়ে যায় তার লজিক
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSelection = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(item => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectAll = () => onChange(chapters.map(c => c.id));
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
                return (
                  <div
                    key={chapter.id}
                    onClick={() => toggleSelection(chapter.id)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                  >
                    <div className={`w-5 h-5 flex-shrink-0 rounded flex items-center justify-center border-2 transition-colors ${
                      isSelected 
                        ? 'bg-violet-600 border-violet-600 dark:bg-violet-500 dark:border-violet-500' 
                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 group-hover:border-violet-400'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-semibold ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                        {chapter.name}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {chapter.total_mcqs} MCQs available
                      </span>
                    </div>
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