'use client';

import { Lock, Save, User, X } from 'lucide-react';
import { useState } from 'react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onUpdateSuccess: (newName: string) => void;
}

export default function EditProfileModal({ isOpen, onClose, currentName, onUpdateSuccess }: EditProfileModalProps) {
  const [formData, setFormData] = useState({ name: currentName, password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('access_token');
      const RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const API_BASE_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL}/api`;

      // API call to update profile
      const response = await fetch(`${API_BASE_URL}/users/profile/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // পাসওয়ার্ড ফাঁকা থাকলে শুধু নাম পাঠানো হবে
        body: JSON.stringify(formData.password ? formData : { name: formData.name }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        
        // localStorage এর user object আপডেট করা যেন Navbar সাথে সাথে আপডেট হয়
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userObj = JSON.parse(userStr);
          userObj.name = formData.name; // first_name আপডেট
          localStorage.setItem('user', JSON.stringify(userObj));
          window.dispatchEvent(new Event('auth-change')); // Navbar কে সিগন্যাল দেওয়া
        }

        onUpdateSuccess(formData.name);
        setTimeout(() => onClose(), 1500); // ১.৫ সেকেন্ড পর মডাল বন্ধ হবে
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200 relative">
        
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-rose-500 transition-colors">
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Edit Profile</h3>

        {message && (
          <div className={`px-4 py-3 rounded-xl mb-6 text-sm font-bold text-center border ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2">Full Name</label>
            <div className="relative flex items-center">
              <User className="absolute left-4 text-slate-400 w-5 h-5" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold dark:text-white focus:border-violet-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2">New Password (Optional)</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-slate-400 w-5 h-5" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold dark:text-white focus:border-violet-500 outline-none transition-all"
                placeholder="Leave blank to keep current"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm mt-4 ${loading ? 'opacity-70 cursor-wait' : ''}`}
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
