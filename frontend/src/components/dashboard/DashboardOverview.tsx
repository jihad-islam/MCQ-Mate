'use client';

import { BookOpen, Calendar, Edit3, Mail, Phone, ShieldAlert, ShieldCheck, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import EditProfileModal from '../ui/EditProfileModal';

interface UserSubscription {
  id: number;
  plan_name: string;
  status: string;
  trx_id: string;
  expiry_date: string | null;
}

interface DashboardOverviewProps {
  profile: {
    name: string;
    email: string;
    bkash_number: string;
    subscriptions: UserSubscription[]; 
  };
  onProfileUpdate: (newName: string) => void;
}

export default function DashboardOverview({ profile, onProfileUpdate }: DashboardOverviewProps) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const activeSubs = profile.subscriptions?.filter(s => s.status === 'active') || [];
  const pendingSubs = profile.subscriptions?.filter(s => s.status === 'pending') || [];
  
  const isActive = activeSubs.length > 0;
  const isPending = pendingSubs.length > 0 && !isActive;
  const isNone = profile.subscriptions?.length === 0 || (!isActive && !isPending);

  let subBoxStyle = 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700/50';
  let iconStyle = 'text-slate-400';
  let badgeStyle = 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
  
  if (isActive) {
    subBoxStyle = 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-500/30';
    iconStyle = 'text-emerald-500';
    badgeStyle = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
  } else if (isPending) {
    subBoxStyle = 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-500/30';
    iconStyle = 'text-amber-500';
    badgeStyle = 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
  } else if (isNone) {
    subBoxStyle = 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-500/30';
    iconStyle = 'text-rose-500';
    badgeStyle = 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400';
  }

  return (
    <>
      {/* UPDATE: Added "relative overflow-hidden" and removed heavy transitions to stop GPU glitches */}
      <div className="w-full relative overflow-hidden bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-violet-100 dark:bg-violet-500/20 rounded-2xl">
              <User className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Account Details</h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Your personal information & access status</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="w-full sm:w-auto flex justify-center items-center gap-2 text-sm font-bold text-violet-600 dark:text-violet-400 hover:text-white px-5 py-2.5 rounded-xl border-2 border-violet-100 dark:border-violet-500/30 hover:bg-violet-600 dark:hover:bg-violet-500 hover:border-violet-600 dark:hover:border-violet-500 active:scale-95 transition-colors"
          >
            <Edit3 className="w-4 h-4" /> <span>Edit Profile</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50">
            <User className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{profile.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50">
            <Mail className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
            {/* UPDATE: min-w-0 flex-1 is critical here to prevent flexbox tearing */}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate" title={profile.email}>{profile.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50">
            <Phone className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Registered bKash</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{profile.bkash_number || 'Not provided'}</p>
            </div>
          </div>

          <div className={`flex items-start justify-between gap-4 p-5 rounded-2xl border ${subBoxStyle}`}>
            <div className="flex items-start gap-4 w-full">
              {isActive ? (
                <ShieldCheck className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconStyle}`} />
              ) : isPending ? (
                <Calendar className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconStyle}`} />
              ) : (
                <ShieldAlert className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconStyle}`} />
              )}
              
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Premium Access</p>
                <div className="flex flex-col items-start gap-2 w-full">
                  {isActive ? (
                    activeSubs.map(sub => {
                      const expiryText = sub.expiry_date 
                        ? new Date(sub.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) 
                        : 'Lifetime';
                      
                      return (
                        <span key={sub.id} className={`text-[10px] font-black tracking-wide px-2.5 py-1 rounded-md ${badgeStyle} flex items-center gap-1.5 w-fit max-w-full`}>
                          <BookOpen className="w-3 h-3 flex-shrink-0" /> <span className="truncate">{sub.plan_name.toUpperCase()} (Till: {expiryText})</span>
                        </span>
                      );
                    })
                  ) : (
                     <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${badgeStyle}`}>
                        {isPending ? 'Pending Approval' : 'None'}
                     </span>
                  )}
                </div>
                {isPending && <p className="text-xs font-mono font-medium mt-2 text-amber-700 dark:text-amber-400 truncate">TrxID: {pendingSubs[0]?.trx_id}</p>}
              </div>
            </div>
            
            {isNone && (
              <button 
                onClick={() => router.push('/checkout')} 
                className="text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg active:scale-95 whitespace-nowrap flex-shrink-0"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 dark:border-slate-700/50 pt-4 text-center">
          <p className="text-[10px] text-slate-400/60 dark:text-slate-500/60 font-medium tracking-wide">
            Note: Accounts without an active subscription for over 1 year are automatically deleted to maintain database health.
          </p>
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