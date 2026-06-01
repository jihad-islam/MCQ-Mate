'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Class বা Subject-এর ডেটা স্ট্রাকচার
interface Option {
  id: number;
  name: string;
}

interface SingleSelectDropdownProps {
  options: Option[];
  value: number | '';
  onChange: (value: number | '') => void;
  placeholder: string;
  disabled?: boolean;
}

export default function SingleSelectDropdown({ options, value, onChange, placeholder, disabled }: SingleSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // বাইরে ক্লিক করলে ড্রপডাউন বন্ধ হওয়ার লজিক
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: number) => {
    onChange(id);
    setIsOpen(false); // সিলেক্ট করার পর ড্রপডাউন বন্ধ হয়ে যাবে
  };

  const selectedOption = options.find(opt => opt.id === value);
  const displayText = selectedOption ? selectedOption.name : placeholder;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 bg-slate-50 dark:bg-slate-900 border-2 rounded-xl text-sm font-semibold transition-all overflow-hidden ${
          disabled 
            ? 'opacity-60 cursor-not-allowed border-slate-200 dark:border-slate-700 text-slate-400' 
            : 'cursor-pointer border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 hover:border-violet-300 dark:hover:border-violet-700 focus:outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10'
        } ${isOpen ? 'border-violet-500 dark:border-violet-500 ring-4 ring-violet-500/10' : ''}`}
      >
        <span className="truncate flex-1 min-w-0 text-left pr-4">{displayText}</span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="max-h-60 overflow-y-auto p-2 scroll-smooth">
            {options.length === 0 ? (
              <div className="p-4 text-sm text-center text-slate-500">No options available</div>
            ) : (
              options.map((option) => (
                <div
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className={`flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    value === option.id
                      ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-semibold'
                  }`}
                >
                  {option.name}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}