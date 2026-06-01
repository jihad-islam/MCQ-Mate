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

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Profile Info Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Account Details</h2>
            </div>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 text-sm font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-500/10"
            >
              <Edit3 className="w-4 h-4" /> Edit
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name</p>
                <p className="text-base font-bold text-slate-900 dark:text-white">{profile.name}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address</p>
                <p className="text-base font-bold text-slate-900 dark:text-white">{profile.email}</p>
              </div>
            </div>

            <div className="flex gap-4 sm:col-span-2">
              <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Registered bKash Number</p>
                <p className="text-base font-bold text-slate-900 dark:text-white">{profile.bkash_number || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Status Card */}
        <div className={`lg:col-span-1 p-6 sm:p-8 rounded-3xl shadow-sm border ${
          isActive 
            ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-500/30' 
            : isPending 
              ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-500/30'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
        }`}>
          <div className="flex flex-col items-center justify-center text-center h-full">
            {isActive ? (
              <ShieldCheck className="w-16 h-16 text-emerald-500 mb-4" strokeWidth={2} />
            ) : isPending ? (
              <Calendar className="w-16 h-16 text-amber-500 mb-4" strokeWidth={2} />
            ) : (
              <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" strokeWidth={2} />
            )}

            <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border ${
              isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400' : 
              isPending ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400' :
              'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400'
            }`}>
              {profile.subscription?.status || 'No Active Plan'}
            </div>

            {isPending && (
              <div className="space-y-4 w-full">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200/80">Your payment is under review.</p>
                <div className="bg-amber-100/50 p-3 rounded-xl flex items-center justify-between border border-amber-200/50">
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase text-amber-600 mb-0.5">TrxID</p>
                    <p className="text-sm font-mono font-bold text-amber-900">{profile.subscription?.trx_id}</p>
                  </div>
                  <CreditCard className="w-5 h-5 text-amber-500" />
                </div>
              </div>
            )}

            {isActive && (
              <div className="space-y-4 w-full">
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200/80">Full premium access activated.</p>
                <div className="bg-emerald-100/50 p-3 rounded-xl flex items-center justify-between border border-emerald-200/50">
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase text-emerald-600 mb-0.5">Valid Until</p>
                    <p className="text-sm font-bold text-emerald-900">Lifetime</p>
                  </div>
                  <Calendar className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
            )}
            
            {!isPending && !isActive && (
              <button onClick={() => router.push('/checkout')} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 px-4 rounded-xl mt-4">Upgrade Now</button>
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