'use client';

import { Bookmark, History, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// আমরা একটু পরে এই ৩টি মডুলার কম্পোনেন্ট তৈরি করব
import BookmarksTab from '@/components/dashboard/BookmarksTab';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import ExamHistoryTab from '@/components/dashboard/ExamHistoryTab';

export interface UserProfile {
  name: string;
  email: string;
  bkash_number: string;
  subscription: {
    status: string;
    trx_id: string;
    expiry_date: string | null;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'bookmarks'>('overview');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        const API_BASE_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL}/api`;

        const response = await fetch(`${API_BASE_URL}/users/profile/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          localStorage.removeItem('access_token');
          router.push('/login');
        }
      } catch (err) {
        setError('Failed to load dashboard. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-violet-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
        <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl max-w-md w-full text-center font-bold">
          <ShieldAlert className="w-12 h-12 mx-auto mb-4" />
          {error || "Profile not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-80px)]">
      
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Welcome back, <span className="text-violet-600 dark:text-violet-400">{profile.name.split(' ')[0]}</span>! 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage your progress, bookmarks, and account details.</p>
      </div>

      {/* Modern Tab Navigation */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/50'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" /> Overview
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'history' ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/50'
          }`}
        >
          <History className="w-4 h-4" /> Exam History
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'bookmarks' ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/50'
          }`}
        >
          <Bookmark className="w-4 h-4" /> Bookmarks
        </button>
      </div>

      {/* Tab Content Renders Here */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'overview' && (
          <DashboardOverview profile={profile} onProfileUpdate={(newName) => setProfile({ ...profile, name: newName })} />
        )}
        {activeTab === 'history' && <ExamHistoryTab />}
        {activeTab === 'bookmarks' && <BookmarksTab />}
      </div>
      
    </div>
  );
}