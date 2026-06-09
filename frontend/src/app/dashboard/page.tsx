'use client';

import { ArrowLeft, ArrowRight, Bookmark, History, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  
  // Tab state to act like fast page routing
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
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-80px)] space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Dynamic Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {activeTab === 'overview' && <>Hello, <span className="text-violet-600 dark:text-violet-400">{profile.name.split(' ')[0]}</span>! 👋</>}
            {activeTab === 'history' && 'Exam History & Stats'}
            {activeTab === 'bookmarks' && 'Saved Questions'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {activeTab === 'overview' && 'Here is your complete overview in one glance.'}
            {activeTab === 'history' && 'Review your past performance and detailed exam records.'}
            {activeTab === 'bookmarks' && 'Manage and review the MCQs you have bookmarked.'}
          </p>
        </div>

        {/* Back Button for History and Bookmarks View */}
        {activeTab !== 'overview' && (
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors shadow-sm border border-slate-200 dark:border-slate-700 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> <span>Back to Dashboard</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="w-full">
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6 sm:gap-8 animate-in fade-in duration-300">
            {/* Account Details Component */}
            <DashboardOverview 
              profile={profile} 
              onProfileUpdate={(newName) => setProfile({ ...profile, name: newName })} 
            />

            {/* Fixed Size Action Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              
              {/* History Box */}
              <div 
                onClick={() => setActiveTab('history')}
                className="group cursor-pointer bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between transition-colors hover:shadow-md hover:border-violet-300 dark:hover:border-violet-500/50 min-h-[220px]"
              >
                <div>
                  <div className="p-3 bg-violet-100 dark:bg-violet-500/20 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
                    <History className="w-7 h-7 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Exam History</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Check your average score, total solved questions, and review past exam details.
                  </p>
                </div>
                <div className="mt-6 flex items-center text-sm font-bold text-violet-600 dark:text-violet-400">
                  Open History <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Bookmarks Box */}
              <div 
                onClick={() => setActiveTab('bookmarks')}
                className="group cursor-pointer bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between transition-colors hover:shadow-md hover:border-violet-300 dark:hover:border-violet-500/50 min-h-[220px]"
              >
                <div>
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
                    <Bookmark className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Saved Questions</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Access all the important MCQs you have bookmarked for quick revision.
                  </p>
                </div>
                <div className="mt-6 flex items-center text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  Open Bookmarks <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab Views with strictly fade-in */}
        {activeTab === 'history' && (
          <div className="animate-in fade-in duration-300">
            <ExamHistoryTab />
          </div>
        )}
        
        {activeTab === 'bookmarks' && (
          <div className="animate-in fade-in duration-300">
            <BookmarksTab />
          </div>
        )}
      </div>
      
    </div>
  );
}