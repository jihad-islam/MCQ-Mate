'use client';

import { Chapter, fetchChaptersBySubject, fetchLevels, fetchSubjectsByLevel, Level, Subject } from '@/lib/api';
import { useEffect, useState } from 'react';

interface SelectionFlowProps {
  onSelectionComplete: (selectedChapterId: number | null, availableMcqs: number | null) => void;
}

export default function SelectionFlow({ onSelectionComplete }: SelectionFlowProps) {
  const [mounted, setMounted] = useState(false);
  const [levels, setLevels] = useState<Level[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  const [selectedLevel, setSelectedLevel] = useState<number | ''>('');
  const [selectedSubject, setSelectedSubject] = useState<number | ''>('');
  const [selectedChapter, setSelectedChapter] = useState<number | ''>('');

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
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
      setChapters([]); setSelectedChapter('');
      onSelectionComplete(null, null);
      return;
    }
    const loadSubjects = async () => {
      try {
        const data = await fetchSubjectsByLevel(Number(selectedLevel));
        setSubjects(data);
        setSelectedSubject('');
        setChapters([]); setSelectedChapter('');
        onSelectionComplete(null, null);
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
      setChapters([]); setSelectedChapter('');
      onSelectionComplete(null, null);
      return;
    }
    const loadChapters = async () => {
      try {
        const data = await fetchChaptersBySubject(Number(selectedSubject));
        setChapters(data);
        setSelectedChapter('');
        onSelectionComplete(null, null);
      } catch (err) {
        setError('Failed to load chapters');
      }
    };
    loadChapters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject]);

  const handleChapterSelect = (chapterId: number) => {
    setSelectedChapter(chapterId);
    if (!chapterId) {
      onSelectionComplete(null, null);
      return;
    }
    const chapter = chapters.find(c => c.id === chapterId);
    onSelectionComplete(chapterId, chapter ? chapter.total_mcqs : null);
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

  const selectClasses = "appearance-none w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-slate-900 dark:text-slate-50 font-semibold text-sm transition-all cursor-pointer";

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 w-full shadow-sm transition-colors flex-grow flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Select Topic</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Choose your exam subject & chapter</p>
      </div>

      {error && <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 px-4 py-3 rounded-xl mb-6 text-sm font-bold">{error}</div>}

      <div className="space-y-6 flex-grow">
        {/* Class Selection */}
        <div className="relative">
          <label className="block text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2">Class Level</label>
          <div className="relative">
            <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value ? Number(e.target.value) : '')} className={selectClasses}>
              <option value="" disabled hidden>Select your class...</option>
              {levels.map((level) => <option key={level.id} value={level.id}>{level.name}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-slate-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
            </div>
          </div>
        </div>

        {/* Subject Selection */}
        <div className="relative">
          <label className="block text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2">Subject</label>
          <div className="relative">
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value ? Number(e.target.value) : '')} className={selectClasses}>
              <option value="" disabled hidden>Select your subject...</option>
              {selectedLevel === '' && <option value="dummy" disabled>Please select a Class first 👆</option>}
              {selectedLevel !== '' && subjects.length === 0 && <option value="dummy" disabled>No subjects available for this class</option>}
              {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-slate-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
            </div>
          </div>
        </div>

        {/* Chapter Selection */}
        <div className="relative">
          <label className="block text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2">Chapter</label>
          <div className="relative">
            <select value={selectedChapter} onChange={(e) => handleChapterSelect(e.target.value ? Number(e.target.value) : 0)} className={selectClasses}>
              <option value="" disabled hidden>Select your chapter...</option>
              {selectedSubject === '' && <option value="dummy" disabled>Please select a Subject first 👆</option>}
              {selectedSubject !== '' && chapters.length === 0 && <option value="dummy" disabled>No chapters available for this subject</option>}
              {chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.name}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-slate-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}