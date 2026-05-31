# Learning Guide: MCQMate Internal Architecture

এই গাইডটি মূলত MCQMate-এর ভেতরের আর্কিটেকচার, প্রজেক্ট স্ট্রাকচার এবং কোডবেস বোঝার জন্য তৈরি করা হয়েছে। প্রজেক্টের কোর লজিকগুলো কোথায় এবং কীভাবে কাজ করছে, তার বিস্তারিত নিচে দেওয়া হলো।

## ১. Project Structure & File Mapping (কোথায় কোন কোড আছে)

প্রজেক্টটিকে Frontend (Next.js) এবং Backend (Django) এই দুটি মেইন ভাগে ভাগ করা হয়েছে। কোডগুলোকে মডুলার এবং রিইউজেবল রাখার জন্য নির্দিষ্ট ফাইল এবং ফোল্ডারে লজিকগুলো সাজানো হয়েছে।

### Frontend (Next.js)

Frontend-এর মেইন কাজগুলো `src` ফোল্ডারের ভেতরে হচ্ছে:

* **`src/app/page.tsx` (Home Page):**
* **লজিক:** এখানেই ইউজারের সিলেক্ট করা Chapter, MCQ Count এবং Time Limit-এর state ম্যানেজ করা হয়।
* **ফাংশন:** `handleStartExam` ফাংশনটি ইউজারের ইনপুটগুলো নিয়ে `URLSearchParams`-এর মাধ্যমে URL-এ query string হিসেবে সেট করে এবং `/exam` রাউটে পাঠিয়ে দেয়।


* **`src/app/exam/page.tsx`:**
* **লজিক:** এটি এক্সাম পেজের মেইন wrapper। URL থেকে `useSearchParams()` দিয়ে query parameter রিড করে এবং backend-এর API-তে রিকোয়েস্ট পাঠিয়ে প্রশ্নগুলো ফেচ (fetch) করে।


* **`src/components/ExamInterface.tsx`:**
* **লজিক:** এটি এক্সামের প্রধান state manager। এটি `useExamShortcuts` hook কল করে এবং `handleSubmit` ও `handleTimeUp`-এর মতো কোর লজিকগুলো হ্যান্ডেল করে।


* **`src/components/Exam/QuestionCard.tsx`:**
* **লজিক:** এটি একটি মডুলার UI component, যার কাজ হলো শুধু প্রশ্ন, অপশন, KaTeX দিয়ে ম্যাথ ফরম্যাটিং এবং Next.js-এর `<Image>` রেন্ডার করা।


* **`src/components/Exam/ExamControls.tsx`:**
* **লজিক:** এখানে Next, Previous এবং Submit বাটনের UI এবং onClick ইভেন্টগুলো রাখা হয়েছে।


* **`src/components/Exam/ResultView.tsx`:**
* **লজিক:** এক্সাম সাবমিট করার পর ইউজারের স্কোর এবং সঠিক/ভুল উত্তরের ক্যালকুলেশন স্ক্রিনে দেখানোর UI লজিক এখানে আছে।


* **`src/hooks/useExamShortcuts.ts`:**
* **লজিক:** এটি একটি Custom React Hook। কীবোর্ডের `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` এবং `Enter` চেপে এক্সাম নেভিগেট ও সাবমিট করার `useEffect` event listener-গুলো এখানে ডিফাইন করা আছে।


* **`src/components/Timer.tsx`:**
* **লজিক:** এক্সামের কাউন্টডাউন টাইমার। `setInterval` ব্যবহার করে প্রতি সেকেন্ডে সময় কমায় এবং সময় শেষ হলে `window.dispatchEvent(new Event('timeUp'))` ফায়ার করে।


* **`next.config.ts`:**
* **লজিক:** External image caching-এর জন্য `remotePatterns` কনফিগার করা আছে, যাতে ImgBB-এর ছবিগুলো Next.js অপটিমাইজ করতে পারে।



### Backend (Django REST Framework)

Backend-এর মেইন কাজগুলো `backend/exams` ফোল্ডারে হচ্ছে:

* **`exams/models.py`:**
* **লজিক:** ডাটাবেস স্কিমা। এখানে `Level`, `Subject`, `Chapter`, `Question` এবং `Option` মডেলগুলো Foreign Key দিয়ে রিলেশনালভাবে কানেক্ট করা আছে।


* **`exams/admin.py`:**
* **লজিক:** কাস্টম অ্যাডমিন প্যানেল। এখানে কাস্টম `ModelForm` লেখা আছে, যা Django Admin থেকে ছবি আপলোড করলে Python `requests` মডিউলের মাধ্যমে অটোমেটিক ImgBB API-তে ছবি পাঠিয়ে দেয় এবং `image_url` ফিল্ডে লিংক সেভ করে।


* **`exams/views.py`:**
* **লজিক:** API-এর মেইন ব্রেইন।
* `Question.objects.filter(...).order_by('?')[:count]` ব্যবহার করে ডাটাবেস লেভেল থেকেই প্রশ্নগুলো random order-এ আনা হয়।
* `/api/exams/submit/` এন্ডপয়েন্টে ইউজারের উত্তরগুলো মিলিয়ে স্কোর ক্যালকুলেট করার লজিক এখানে আছে।


* **`exams/serializers.py`:**
* **লজিক:** ডাটাবেসের মডেলকে JSON-এ কনভার্ট করে। `OptionSerializer` থেকে ইচ্ছা করেই `is_correct` ফিল্ডটি বাদ দেওয়া হয়েছে, যাতে API response চেক করে কেউ সঠিক উত্তর বের করতে না পারে।


* **`mcq_project/settings.py`:**
* **লজিক:** প্রজেক্ট কনফিগারেশন। `os.environ.get()` ব্যবহার করে Render-এর Environment Variable (যেমন: `DEBUG`, `SECRET_KEY`) রিড করা এবং প্রোডাকশনের জন্য `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`-এর মতো সিকিউরিটি রুলস অ্যাপ্লাই করা আছে।



---

## ২. Essential Commands (প্রয়োজনীয় কমান্ডসমূহ)

প্রজেক্টটি রান করা, বিল্ড করা এবং ডিপ্লয়মেন্ট চেক করার জন্য নিচের কমান্ডগুলো নিয়মিত ব্যবহার করা হয়:

### Frontend Commands (Next.js)

Frontend ফোল্ডারের ভেতরে (`cd frontend`) এই কমান্ডগুলো রান করতে হয়:

* **`npm run dev`** : লোকাল ডেভেলপমেন্ট সার্ভার চালু করার জন্য (http://localhost:3000)।
* **`npm run build`** : প্রোডাকশনের জন্য প্রজেক্টটিকে অপটিমাইজড এবং বিল্ড করার জন্য।
* **`npm run start`** : বিল্ড করা প্রোডাকশন ভার্সনটি লোকালি টেস্ট করার জন্য।
* **`npm run lint`** : কোডে কোনো সিনট্যাক্স বা লজিক্যাল error আছে কি না, তা চেক করার জন্য।

### Backend Commands (Django)

Backend ফোল্ডারের ভেতরে (Virtual Environment অ্যাকটিভ থাকা অবস্থায়) এই কমান্ডগুলো রান করতে হয়:

* **`python manage.py runserver`** : লোকাল API সার্ভার চালু করার জন্য (http://localhost:8000)।
* **`python manage.py makemigrations`** : `models.py`-তে কোনো চেঞ্জ আনলে নতুন ডাটাবেস মাইগ্রেশন ফাইল তৈরি করার জন্য।
* **`python manage.py migrate`** : তৈরি করা মাইগ্রেশনগুলো PostgreSQL ডাটাবেসে অ্যাপ্লাই করার জন্য।
* **`python manage.py createsuperuser`** : Django Admin প্যানেলে লগিন করার জন্য অ্যাডমিন ইউজার তৈরি করতে।
* **`python manage.py check --deploy`** : প্রোডাকশনে (Render-এ) ডিপ্লয় করার আগে সিকিউরিটি এবং কনফিগারেশন ঠিক আছে কি না, তা টেস্ট করার জন্য।
* **`pip freeze > requirements.txt`** : নতুন কোনো প্যাকেজ (যেমন: `requests`, `pillow`) ইন্সটল করলে সেটি requirements ফাইলে আপডেট করার জন্য।