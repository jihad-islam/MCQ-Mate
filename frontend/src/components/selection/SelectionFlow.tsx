'use client';

import { Chapter, fetchChaptersBySubject, fetchLevels, fetchSubjectsByLevel, Level, Subject } from '@/lib/api';
import { useEffect, useState } from 'react';
import MultiSelectDropdown from '../ui/MultiSelectDropdown';
import PremiumModal from '../ui/PremiumModal';
import SingleSelectDropdown from '../ui/SingleSelectDropdown';

interface SelectionFlowProps {
  onSelectionComplete: (selectedChapterIds: number[], availableMcqs: number) => void;
}

export default function SelectionFlow({ onSelectionComplete }: SelectionFlowProps) {
  const [mounted, setMounted] = useState(false);
  const [levels, setLevels] = useState<Level[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  const [selectedLevel, setSelectedLevel] = useState<number | ''>('');
  const [selectedSubject, setSelectedSubject] = useState<number | ''>('');
  const [selectedChapters, setSelectedChapters] = useState<number[]>([]);

  const [error, setError] = useState<string | null>(null);
  
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    setMounted(true);

    // ইউজারের সাবস্ক্রিপশন স্ট্যাটাস চেক করার ফাংশন
    const checkPremiumStatus = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          // Backend থেকে আসা object structure এর উপর ভিত্তি করে Active স্ট্যাটাস চেক করা হচ্ছে
          const isActive = user?.subscription_status === 'active' || user?.subscription?.status === 'active';
          setIsPremium(isActive);
        } else {
          setIsPremium(false);
        }
      } catch (e) {
        setIsPremium(false);
      }
    };

    // প্রথমবার রেন্ডারে চেক করবে
    checkPremiumStatus();
    // লগ-ইন বা লগ-আউট হলে রিয়েল-টাইমে আপডেট করার জন্য লিসেনার
    window.addEventListener('auth-change', checkPremiumStatus);

    return () => {
      window.removeEventListener('auth-change', checkPremiumStatus);
    };
  }, []);

  // Fetch levels on mount
  useEffect(() => {
    if (!mounted) return;
    const loadLevels = async () => {
      try {
        const data = await fetchLevels();
        setLevels(data);
      } catch (err) {
        setError('Failed to load classes');
      }
    };
    loadLevels();
  }, [mounted]);

  // Fetch subjects when level changes
  useEffect(() => {
    if (selectedLevel === '') {
      setSubjects([]); setSelectedSubject('');
      setChapters([]); setSelectedChapters([]);
      onSelectionComplete([], 0);
      return;
    }
    const loadSubjects = async () => {
      try {
        const data = await fetchSubjectsByLevel(Number(selectedLevel));
        setSubjects(data);
        setSelectedSubject('');
        setChapters([]); setSelectedChapters([]);
        onSelectionComplete([], 0);
      } catch (err) {
        setError('Failed to load subjects');
      }
    };
    loadSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLevel]);

  // Fetch chapters when subject changes
  useEffect(() => {
    if (selectedSubject === '') {
      setChapters([]); setSelectedChapters([]);
      onSelectionComplete([], 0);
      return;
    }
    const loadChapters = async () => {
      try {
        const data = await fetchChaptersBySubject(Number(selectedSubject));
        setChapters(data);
        setSelectedChapters([]);
        onSelectionComplete([], 0);
      } catch (err) {
        setError('Failed to load chapters');
      }
    };
    loadChapters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject]);

  const handleChapterSelect = (selectedIds: number[]) => {
    setSelectedChapters(selectedIds);
    
    if (selectedIds.length === 0) {
      onSelectionComplete([], 0);
      return;
    }

    const totalAvailable = chapters
      .filter(c => selectedIds.includes(c.id))
      .reduce((sum, currentChapter) => sum + (currentChapter.total_mcqs || 0), 0);
      
    onSelectionComplete(selectedIds, totalAvailable);
  };

  if (!mounted) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 w-full shadow-sm transition-colors flex-grow">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-50 mb-8">Select Topic</h2>
        <div className="space-y-6">
          <div className="h-14 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse"></div>
          <div className="h-14 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse"></div>
          <div className="h-14 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 w-full shadow-sm transition-colors flex-grow flex flex-col relative">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Select Topic</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Choose your exam subject & chapters</p>
        </div>

        {error && <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 px-4 py-3 rounded-xl mb-6 text-sm font-bold">{error}</div>}

        <div className="space-y-6 flex-grow">
          
          <div>
            <label className="block text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2">Class Level</label>
            <SingleSelectDropdown 
              options={levels}
              value={selectedLevel}
              onChange={(val) => setSelectedLevel(val)}
              placeholder="Select your class..."
              disabled={levels.length === 0}
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2">Subject</label>
            <SingleSelectDropdown 
              options={subjects}
              value={selectedSubject}
              onChange={(val) => setSelectedSubject(val)}
              placeholder={selectedLevel === '' ? "Please select a Class first..." : "Select your subject..."}
              disabled={selectedLevel === '' || subjects.length === 0}
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2">Chapters</label>
            <MultiSelectDropdown 
              chapters={chapters} 
              selectedIds={selectedChapters} 
              onChange={handleChapterSelect} 
              disabled={selectedSubject === '' || chapters.length === 0}
              onLockedClick={() => setShowPremiumModal(true)}
              isPremium={isPremium} // ইউজারের স্ট্যাটাস পাঠানো হলো
            />
          </div>

        </div>
      </div>

      {/* Modular Premium Modal */}
      <PremiumModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)} 
      />
    </>
  );
}