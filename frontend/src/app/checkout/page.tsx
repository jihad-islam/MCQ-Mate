'use client';

import { SubscriptionPlan } from '@/lib/api';
import { CheckCircle2, Headset, Loader2, Mail, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import CheckoutForm from './CheckoutForm';
import { checkoutConfig } from './config';

interface PageSettings {
  bkash_number: string;
  page_title: string;
  page_subtitle: string;
  benefits: string[];
}

export default function CheckoutPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [pageSettings, setPageSettings] = useState<PageSettings | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        const API_BASE_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL}/api`;
        
        const response = await fetch(`${API_BASE_URL}/users/checkout-data/`);
        const data = await response.json();
        
        if (response.ok) {
          setPlans(data.plans || []);
          setPageSettings(data.settings || null);
        }
      } catch (err) {
        console.error('Failed to load page data.');
      } finally {
        setPageLoading(false);
      }
    };
    fetchPageData();
  }, []);

  if (pageLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-violet-600 dark:text-violet-500" />
      </div>
    );
  }

  const title = pageSettings?.page_title || "তোমার প্রস্তুতির ১০০% নিশ্চিত করো।";
  const subtitle = pageSettings?.page_subtitle || "হাজারো স্টুডেন্টদের সাথে যুক্ত হও এবং আনলিমিটেড অ্যাক্সেস পেয়ে তোমার প্রস্তুতিকে নিয়ে যাও অন্য লেভেলে।";
  const benefits = pageSettings?.benefits?.length ? pageSettings.benefits : [
    "সকল বিষয় ও চ্যাপ্টারের সম্পূর্ণ অ্যাক্সেস",
    "আনলিমিটেড MCQ মডেল টেস্ট জেনারেট করার সুবিধা"
  ];
  const adminBkashNumber = pageSettings?.bkash_number || "017XX-XXXXXX";

  return (
    <div className="w-full py-6 lg:py-8 px-4 sm:px-6 lg:px-8 flex justify-center font-sans selection:bg-violet-500/30">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        
        <div className="lg:col-span-5 flex flex-col gap-8 lg:sticky lg:top-24">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 text-xs font-bold mb-6 border border-violet-200 dark:border-violet-500/20">
              <Sparkles className="w-4 h-4" /> Premium Access
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4 tracking-tight">
              {title}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" strokeWidth={2.5} />
                <span className="text-slate-700 dark:text-slate-300 font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          {/* ==========================================
              Professional Support Box
          ========================================== */}
          <div className="mt-8 p-6 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Headset className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              {checkoutConfig.support.title}
            </h3>
            
            <div className="flex flex-col gap-3">
              <a 
                href={`tel:${checkoutConfig.support.phone}`} 
                className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-medium w-fit"
              >
                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                  <Headset className="w-4 h-4" />
                </div>
                {checkoutConfig.support.phone}
              </a>
              
              <a 
                href={`mailto:${checkoutConfig.support.email}`} 
                className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-medium w-fit"
              >
                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                  <Mail className="w-4 h-4" />
                </div>
                {checkoutConfig.support.email}
              </a>
            </div>
          </div>
          {/* END: Support Box */}

        </div>

        <div className="lg:col-span-7">
          <CheckoutForm plans={plans} adminBkashNumber={adminBkashNumber} />
        </div>
      </div>
    </div>
  );
}