'use client';

import { SubscriptionPlan } from '@/lib/api';
import { CheckCircle2, Hash, Lock, Mail, Phone, ShieldCheck, User, ChevronDown, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { checkoutConfig } from './config';

interface CheckoutFormProps {
  plans: SubscriptionPlan[];
  adminBkashNumber: string;
}

export default function CheckoutForm({ plans, adminBkashNumber }: CheckoutFormProps) {
  const router = useRouter();
  const [selectedPlanIds, setSelectedPlanIds] = useState<number[]>(
    plans.length > 0 ? [plans[0].id] : []
  );
  
  const [formData, setFormData] = useState({
    first_name: '', email: '', password: '', bkash_number: '', trx_id: ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePlanToggle = (id: number) => {
    setSelectedPlanIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const totalAmount = selectedPlanIds.reduce((sum, id) => {
    const plan = plans.find((p) => p.id === id);
    if (!plan) return sum;
    const activePrice = plan.discounted_price !== null ? plan.discounted_price : plan.price;
    return sum + parseFloat(activePrice);
  }, 0);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }
    const bkashRegex = /^01[3-9]\d{8}$/;
    if (!bkashRegex.test(formData.bkash_number)) {
      errors.bkash_number = "Enter a valid 11-digit Bangladeshi number.";
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlanIds.length === 0) {
      setError('⚠️ Please select at least one course.'); return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setLoading(true); setError(null); setMessage(null);

    try {
      const RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const API_BASE_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL}/api`;
      const payload = { ...formData, plan_ids: selectedPlanIds };

      const response = await fetch(`${API_BASE_URL}/users/checkout/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Registration successful! Pending admin approval.');
        setTimeout(() => { router.push('/login'); }, 2500);
      } else {
        const errorMessages = Object.values(data).flat().join(' ');
        setError(errorMessages || 'Something went wrong. Please check your data.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const inputWrapperClasses = "relative group flex items-center";
  const inputIconClasses = "absolute left-4 text-slate-400 group-focus-within:text-violet-600 dark:group-focus-within:text-violet-500 transition-colors w-5 h-5";
  const inputClasses = "w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:border-violet-600 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-600 dark:focus:ring-violet-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500";
  const labelClasses = "block text-[10px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2";

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-10 rounded-[2rem] shadow-xl dark:shadow-md border border-slate-100 dark:border-slate-700">
      {/* UPDATE: Added autoComplete="off" to the form tag */}
      <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
        
        <div className="relative" ref={dropdownRef}>
          <label className={labelClasses}>{checkoutConfig.formLabels.selectCourse}</label>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`${inputClasses} pl-12 cursor-pointer flex justify-between items-center group`}
          >
            <BookOpen className={inputIconClasses} />
            <span className="truncate">
              {selectedPlanIds.length === 0 
                ? checkoutConfig.formLabels.placeholderCourse 
                : `${selectedPlanIds.length} course(s) selected`}
            </span>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
              {plans.map((plan) => {
                const isSelected = selectedPlanIds.includes(plan.id);
                const displayPrice = plan.discounted_price !== null ? plan.discounted_price : plan.price;
                return (
                  <div 
                    key={plan.id}
                    onClick={() => handlePlanToggle(plan.id)}
                    className="px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'border-violet-600 dark:border-violet-500 bg-violet-600 dark:bg-violet-500' : 'border-slate-300 dark:border-slate-600'}`}>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <span className="text-slate-900 dark:text-white font-semibold block">{plan.name}</span>
                        {plan.discounted_price && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">Discounted</span>
                        )}
                      </div>
                    </div>
                    <span className="text-violet-600 dark:text-violet-400 font-bold text-sm">৳{parseFloat(displayPrice)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-violet-600 dark:bg-violet-500"></div>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{checkoutConfig.paymentInfo.secureTitle}</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-4">
            {checkoutConfig.paymentInfo.instructionPrefix} <span className="font-bold text-slate-900 dark:text-white text-lg">৳{totalAmount}</span> {checkoutConfig.paymentInfo.instructionSuffix}
          </p>
          <div className="bg-white dark:bg-slate-800 py-4 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-2xl font-black tracking-widest text-slate-900 dark:text-white">{adminBkashNumber}</span>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{checkoutConfig.paymentInfo.personalNumberTag}</p>
          </div>
        </div>

        {message && <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-emerald-200 dark:border-emerald-500/20"><CheckCircle2 className="w-5 h-5" /> {message}</div>}
        {error && <div className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-rose-200 dark:border-rose-500/20"><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> {error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          <div>
            <label className={labelClasses}>{checkoutConfig.formLabels.fullName}</label>
            <div className={inputWrapperClasses}>
              <User className={inputIconClasses} />
              {/* UPDATE: Added autoComplete="off" */}
              <input type="text" name="first_name" required autoComplete="off" value={formData.first_name} onChange={handleChange} className={inputClasses} placeholder="Rakib Hasan" />
            </div>
            {formErrors.first_name && <p className="text-rose-500 dark:text-rose-400 text-xs mt-1.5 font-semibold">{formErrors.first_name}</p>}
          </div>
          <div>
            <label className={labelClasses}>{checkoutConfig.formLabels.email}</label>
            <div className={inputWrapperClasses}>
              <Mail className={inputIconClasses} />
              {/* UPDATE: Added autoComplete="off" */}
              <input type="email" name="email" required autoComplete="off" value={formData.email} onChange={handleChange} className={inputClasses} placeholder="rakib@example.com" />
            </div>
            {formErrors.email && <p className="text-rose-500 dark:text-rose-400 text-xs mt-1.5 font-semibold">{formErrors.email}</p>}
          </div>
        </div>

        <div>
          <label className={labelClasses}>{checkoutConfig.formLabels.password}</label>
          <div className={inputWrapperClasses}>
            <Lock className={inputIconClasses} />
            {/* UPDATE: Added autoComplete="new-password" to strictly block password manager popups */}
            <input type="password" name="password" required autoComplete="new-password" value={formData.password} onChange={handleChange} className={inputClasses} placeholder="••••••••" />
          </div>
          {formErrors.password && <p className="text-rose-500 dark:text-rose-400 text-xs mt-1.5 font-semibold">{formErrors.password}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClasses}>{checkoutConfig.formLabels.bkashNumber}</label>
            <div className={inputWrapperClasses}>
              <Phone className={inputIconClasses} />
              {/* UPDATE: Added autoComplete="off" */}
              <input type="text" name="bkash_number" required autoComplete="off" value={formData.bkash_number} onChange={handleChange} className={inputClasses} placeholder="01XXXXXXXXX" />
            </div>
            {formErrors.bkash_number && <p className="text-rose-500 dark:text-rose-400 text-xs mt-1.5 font-semibold">{formErrors.bkash_number}</p>}
          </div>
          <div>
            <label className={labelClasses}>{checkoutConfig.formLabels.trxId}</label>
            <div className={inputWrapperClasses}>
              <Hash className={inputIconClasses} />
              {/* UPDATE: Added autoComplete="off" */}
              <input type="text" name="trx_id" required autoComplete="off" value={formData.trx_id} onChange={handleChange} className={inputClasses} placeholder="8A7B6C5D4E" />
            </div>
            {formErrors.trx_id && <p className="text-rose-500 dark:text-rose-400 text-xs mt-1.5 font-semibold">{formErrors.trx_id}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || totalAmount === 0}
          className={`w-full bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(124,58,237,0.2)] dark:shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.4)] active:scale-[0.98] mt-6 flex items-center justify-center gap-2 ${
            loading || totalAmount === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? checkoutConfig.buttons.processing : checkoutConfig.buttons.submit}
        </button>
      </form>
    </div>
  );
}