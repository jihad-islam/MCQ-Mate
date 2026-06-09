'use client';

import { Download } from 'lucide-react';

interface PdfDownloadButtonProps {
  targetId: string;
  fileName?: string;
}

export default function PdfDownloadButton({ targetId }: PdfDownloadButtonProps) {
  const handleDownload = () => {
    // একটি টেম্পোরারি <style> ট্যাগ তৈরি করে পেজে ইনজেক্ট করা হচ্ছে
    // এটি নিশ্চিত করবে যে PDF-এ শুধুমাত্র আমাদের টার্গেট করা কন্টেন্টটিই আসবে
    const printStyle = document.createElement('style');
    printStyle.innerHTML = `
      @media print {
        /* পুরো পেজের সবকিছু লুকিয়ে ফেলা হচ্ছে */
        body * {
          visibility: hidden;
        }
        /* শুধুমাত্র আমাদের টার্গেট কন্টেন্ট এবং এর ভেতরের সবকিছু দেখানো হচ্ছে */
        #${targetId}, #${targetId} * {
          visibility: visible;
        }
        /* টার্গেট কন্টেন্টটিকে পেজের একদম উপরে সেট করা হচ্ছে */
        #${targetId} {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          margin: 0;
          padding: 0;
        }
        /* প্রিন্ট করার সময় যেকোনো বাটন হাইড করা হচ্ছে */
        button {
          display: none !important;
        }
        /* PDF-এর মার্জিন সেট করা হচ্ছে */
        @page {
          margin: 1cm;
        }
      }
    `;
    
    document.head.appendChild(printStyle);
    
    // ব্রাউজারের নেটিভ প্রিন্ট ডায়ালগ কল করা হচ্ছে (এখান থেকে Save as PDF করা যায়)
    window.print();
    
    // ডায়ালগ ওপেন হওয়ার পর টেম্পোরারি স্টাইলটি মুছে ফেলা হচ্ছে
    setTimeout(() => {
      document.head.removeChild(printStyle);
    }, 1000);
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold py-2.5 px-5 rounded-xl transition-all duration-200 shadow-sm text-sm"
    >
      <Download className="w-4 h-4" strokeWidth={2.5} />
      Save as PDF
    </button>
  );
}
