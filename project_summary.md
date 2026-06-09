# MCQMate - Project Summary

## Overview
MCQMate is a full-stack SaaS application that functions as an MCQ (Multiple Choice Questions) practice partner. It allows users to construct custom exams by selecting a Level (e.g., HSC/SSC), Subject, and specific chapters. Users can set a time limit and a set number of questions. After taking the exam, a review page breaks down the results, offering correct answers and explanations.

## Application State
Currently, the application includes the following features:
- **Authentication & Profiles:** User authentication and profile management via the `users` app.
- **Premium Subscription & Checkout:** Checkout flow for users to get premium access.
- **User Dashboard:** A comprehensive dashboard (`/dashboard`) allowing users to review their profile, subscription status, Exam History, and Bookmarks.
- **Exam Configuration:** Users select levels, subjects, and chapters, and specify the question limit and timer.
- **Dynamic Exam Generation:** Fetches questions for the selected chapters from the backend API.
- **Exam Interface & Timer:** Questions are displayed alongside a timer, allowing navigation between questions, keyboard shortcuts (via `useExamShortcuts`), and auto-submission when the time runs out.
- **Review Page:** Shows detailed analytics (correct, wrong, score, explanations).
- **Exam History & Bookmarks:** Tracks completed exams and allows bookmarking of questions (with explanations) for later review.
- **PDF Export:** Support for downloading reports or result summaries as PDF.

## Folder structure

```text
mcq/
├── backend/                  # Django Backend
│   ├── exams/                # Core Django App containing Models, Views, APIs
│   │   ├── management/commands/import_mcqs.py # Script for importing questions
│   │   ├── migrations/       # Database migrations
│   │   ├── models.py         # Defines Question, Option, Chapter, Subject, Level, History, Bookmarks DB schema
│   │   ├── serializers.py    # DRF JSON transformers
│   │   ├── urls.py           # API routing
│   │   ├── views.py          # Viewsets and custom actions (submit-exam, history, bookmarks)
│   ├── users/                # New User App for Authentication & Profiles
│   │   ├── models.py         # Custom user model
│   │   ├── views.py          # Auth and profile APIs
│   ├── staticfiles/          # Collected static assets
│   ├── mcq_project/          # Main Django configurations (settings, wsgi, asgi)
│   ├── .env                  # Environment Variables
│   ├── build.sh              # Build script for deployment
│   ├── manage.py             # Django entry point
│   ├── requirements.txt      # Python dependencies
├── frontend/                 # Next.js Frontend
│   ├── public/               # Public assets
│   ├── src/
│   │   ├── app/              # App Router Pages
│   │   │   ├── checkout/     # Checkout and premium subscription flow
│   │   │   ├── dashboard/    # User dashboard for overview, history, and bookmarks
│   │   │   ├── exam/page.tsx # Renders `ExamInterface` 
│   │   │   ├── login/        # Authentication pages
│   │   │   ├── review/page.tsx # Displays results/reviews after test
│   │   │   ├── globals.css   # Main CSS & Tailwind imports
│   │   │   ├── layout.tsx    # Root layout container
│   │   │   ├── page.tsx      # Entry flow (Level/Subject selection & Config)
│   │   ├── components/       # Reusable components
│   │   │   ├── config/       # Configuration flow components
│   │   │   ├── dashboard/    # Dashboard tabs (Overview, BookmarksTab, ExamHistoryTab)
│   │   │   ├── exam/         # Components specific to the real-time exam (e.g., Timer, DesktopTimer, MobileTimer, QuestionCard, ExamInterface, ResultView)
│   │   │   ├── selection/    # Flow components for intro page (SelectionFlow, ExamConfig)
│   │   │   ├── ui/           # Generic components (PdfDownloadButton, ThemeToggle, MultiSelectDropdown, Navbar, FormattedMathText, EditProfileModal, PremiumModal, etc.)
│   │   ├── hooks/            
│   │   │   ├── useExamShortcuts.tsx # Keyboard navigation mapping
│   │   ├── lib/              
│   │   │   ├── api.ts        # Fetch wrappers & TypeScript interfaces across the app
│   ├── package.json          # Node dependencies
│   ├── tailwind.config.ts    # Tailwind styling config
│   ├── next.config.ts        # Next.js configurations
```

## Key Files Breakdown

### 1. `frontend/src/app/page.tsx`
This is the root page of the application that handles test setup:
- It maintains the state of selected chapters, number of questions, and exam duration.
- Renders the primary entry components: `<SelectionFlow>` (for picking classes, subjects, and chapters) and `<ExamConfig>` (for choosing constraints).
- Contains validation logic ensuring required selections are made before proceeding.
- Uses `sessionStorage` cleanup before starting a new exam.
- Navigates the user to `/exam` forwarding the configurations as query search params.

### 2. `frontend/src/lib/api.ts`
Acts as the bridge between Next.js and the Django backend API:
- **Interfaces:** Centralizes types defining endpoints.
- **API Call Functions:** Includes wrappers for levels, subjects, chapters, questions fetching.
- **Tracking & Feedback Endpoints:** `submitExam` computes answers and submits to history. Includes `fetchUserHistory`, `fetchBookmarks`, and `toggleBookmark`.
- Adds Bearer Token headers from `localStorage` where required.

### 3. `frontend/src/components/dashboard/`
Handles user profile tracking. Includes:
- `DashboardOverview.tsx`: Views and edits user info (name, email) and displays mock active subscription statuses.
- `BookmarksTab.tsx`: Previews saved questions along with their dynamically revealed right answers + explanations.
- `ExamHistoryTab.tsx`: Maps previous `ExamHistory` records.

### 4. `frontend/src/components/exam/ExamInterface.tsx`
The primary controller for the actual exam instance:
- Orchestrates the timer, question rendering (`QuestionCard`), controls (`ExamControls`), and overall UI states.
- Interacts closely with `frontend/src/hooks/useExamShortcuts.tsx` for hotkeys.
- Submits completed answers using `api.ts`. Includes authentication token allowing completion data to be logged to their user history.

### 5. `backend/exams/views.py` (Backend API equivalent)
Contains the viewsets that provide data for components and validates the submission format receiving answers and generating dynamic performance metrics securely server-side. Additionally generates User History and Bookmark toggling APIs.
