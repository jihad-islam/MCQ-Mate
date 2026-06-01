'use client';

import { Calendar, CreditCard, Edit3, Mail, Phone, ShieldAlert, ShieldCheck, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import EditProfileModal from '../ui/EditProfileModal';

interface DashboardOverviewProps {
  profile: {
    name: string;
    email: string;
    bkash_number: string;
    subscription: {
      status: string;
      trx_id: string;
      expiry_date: string | null;
    };
  };
  onProfileUpdate: (newName: string) => void;
}

export default function DashboardOverview({ profile, onProfileUpdate }: DashboardOverviewProps) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isPending = profile.subscription?.status === 'pending';
  const isActive = profile.subscription?.status === 'active';
  const isNone = !isPending && !isActive;

  // Dynamic Styles for Subscription Card
  let subCardStyle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700';
  if (isActive) subCardStyle = 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-500/30';
  if (isPending) subCardStyle = 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-500/30';

  // Dynamic Styles for Status Badge
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400';
  if (isActive) badgeStyle = 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400';
  if (isPending) badgeStyle = 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400';
  if (isNone) badgeStyle = 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400';

  return (
    <>
      {/* items-stretch ensures equal height for both columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Profile Info Card */}
        <div className="lg:col-span-2 h-full bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-violet-100 dark:bg-violet-500/20 rounded-xl">
                <User className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Account Details</h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Your personal information</p>
              </div>
            </div>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 text-sm font-bold text-violet-600 dark:text-violet-400 hover:text-white transition-colors px-4 py-2 rounded-xl border-2 border-violet-100 dark:border-violet-500/30 hover:bg-violet-600 dark:hover:bg-violet-500 hover:border-violet-600 dark:hover:border-violet-500"
            >
              <Edit3 className="w-4 h-4" /> <span className="hidden sm:inline">Edit Profile</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 transition-colors hover:border-violet-200 dark:hover:border-violet-500/30">
              <User className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{profile.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 transition-colors hover:border-violet-200 dark:hover:border-violet-500/30">
              <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 transition-colors hover:border-violet-200 dark:hover:border-violet-500/30 sm:col-span-2">
              <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Registered bKash Number</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{profile.bkash_number || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Status Card */}
        <div className={`lg:col-span-1 p-6 sm:p-8 rounded-3xl shadow-sm border flex flex-col items-center justify-center text-center h-full transition-colors ${subCardStyle}`}>
          
          <div className="flex flex-col items-center justify-center flex-grow w-full">
            {isActive ? (
              <ShieldCheck className="w-16 h-16 text-emerald-500 mb-5 drop-shadow-sm" strokeWidth={2} />
            ) : isPending ? (
              <Calendar className="w-16 h-16 text-amber-500 mb-5 drop-shadow-sm" strokeWidth={2} />
            ) : (
              <ShieldAlert className="w-16 h-16 text-rose-500 mb-5 drop-shadow-sm" strokeWidth={2} />
            )}

            <div className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8 border shadow-sm ${badgeStyle}`}>
              {profile.subscription?.status || 'No Active Plan'}
            </div>

            {isPending && (
              <div className="space-y-4 w-full">
                <p className="text-sm font-bold text-amber-800 dark:text-amber-400">Payment under review</p>
                <div className="bg-amber-100/50 dark:bg-amber-900/30 p-4 rounded-2xl flex items-center justify-between border border-amber-200/50 dark:border-amber-500/20">
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-500/80 mb-1">TrxID</p>
                    <p className="text-sm font-mono font-bold text-amber-900 dark:text-amber-200">{profile.subscription?.trx_id}</p>
                  </div>
                  <CreditCard className="w-5 h-5 text-amber-500" />
                </div>
              </div>
            )}

            {isActive && (
              <div className="space-y-4 w-full">
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Premium access activated</p>
                <div className="bg-emerald-100/50 dark:bg-emerald-900/30 p-4 rounded-2xl flex items-center justify-between border border-emerald-200/50 dark:border-emerald-500/20">
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-500/80 mb-1">Valid Until</p>
                    <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Lifetime Access</p>
                  </div>
                  <Calendar className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
            )}
            
            {isNone && (
              <div className="w-full mt-auto pt-4">
                <button onClick={() => router.push('/checkout')} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg focus:ring-4 focus:ring-violet-500/20">
                  Upgrade to Premium
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        currentName={profile.name}
        onUpdateSuccess={onProfileUpdate}
      />
    </>
  );
}